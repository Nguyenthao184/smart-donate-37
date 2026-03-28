<?php

namespace App\Http\Controllers;

use App\Http\Requests\Post\StorePostRequest;
use App\Http\Requests\Post\UpdatePostRequest;
use App\Models\BaiDang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\GhepNoiAi;
use App\Services\AiMatchingService;
use App\Services\GeocodingService;
use App\Services\DanhMucSuggestionService;
use App\Models\DanhMucBaiDang;
use Illuminate\Support\Facades\DB;

class PostController extends Controller
{
    
    public function index(Request $request)
    {
        $loaiBai = $request->query('loai_bai'); // CHO | NHAN
        if (is_string($loaiBai)) {
            $loaiBai = strtoupper(trim($loaiBai));
        }

        $location = $request->query('location'); // dia_diem (text)
        $keyword = $request->query('keyword');

        $radiusKm = $request->query('radius_km'); // optional
        $lat = $request->query('lat');
        $lng = $request->query('lng');

        $radiusKm = is_numeric($radiusKm) ? (float)$radiusKm : null;
        $lat = is_numeric($lat) ? (float)$lat : null;
        $lng = is_numeric($lng) ? (float)$lng : null;

        $query = BaiDang::query()
            ->with(['nguoiDung'])
            ->orderByDesc('created_at');

        // Lọc theo bán kính dựa trên lat/lng (chuẩn hơn "LIKE location")
        if ($radiusKm !== null && $radiusKm > 0 && $lat !== null && $lng !== null) {
            $distanceExpr = "(6371 * acos( cos(radians(?)) * cos(radians(bai_dang.lat)) * cos(radians(bai_dang.lng) - radians(?)) + sin(radians(?)) * sin(radians(bai_dang.lat)) ))";
            $query->whereNotNull('bai_dang.lat')
                ->whereNotNull('bai_dang.lng')
                ->whereRaw("$distanceExpr <= ?", [$lat, $lng, $lat, $radiusKm]);

            // Inject số vì đã cast sang float, dùng cho select khoảng cách để FE lấy hiển thị.
            $distanceExprSelect = "(6371 * acos( cos(radians(" . $lat . ")) * cos(radians(bai_dang.lat)) * cos(radians(bai_dang.lng) - radians(" . $lng . ")) + sin(radians(" . $lat . ")) * sin(radians(bai_dang.lat)) ))";
            $query->addSelect(DB::raw($distanceExprSelect . " as distance_km"));
            $query->orderBy('distance_km', 'asc');
        }

        if (in_array($loaiBai, ['CHO', 'NHAN'], true)) {
            $query->where('loai_bai', $loaiBai);
        }

        if (!empty($location)) {
            $query->where('dia_diem', 'like', '%' . $location . '%');
        }

        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('tieu_de', 'like', '%' . $keyword . '%')
                    ->orWhere('mo_ta', 'like', '%' . $keyword . '%');
            });
        }

        $posts = $query->paginate(12);

        $posts->getCollection()->transform(function (BaiDang $post) {
            $post->avatar_url = $post->nguoiDung && $post->nguoiDung->anh_dai_dien
                ? asset('storage/' . $post->nguoiDung->anh_dai_dien)
                : null;

            $post->hinh_anh_url = $post->hinh_anh
                ? asset('storage/' . $post->hinh_anh)
                : null;

            $post->nguoi_dung_ten = $post->nguoiDung?->ho_ten;

            unset($post->nguoiDung);

            return $post;
        });

        return response()->json([
            'data' => $posts
        ]);
    }

 
    public function show(int $id)
    {
        $post = BaiDang::with(['nguoiDung'])->findOrFail($id);

        $post->avatar_url = $post->nguoiDung && $post->nguoiDung->anh_dai_dien
            ? asset('storage/' . $post->nguoiDung->anh_dai_dien)
            : null;
        $post->hinh_anh_url = $post->hinh_anh ? asset('storage/' . $post->hinh_anh) : null;
        return response()->json([
            'data' => $post
        ]);
    }

    public function store(StorePostRequest $request)
    {
        $userId = Auth::id();

        $data = $request->validated();

        // Nếu client gửi lat/lng (từ map) nhưng dia_diem rỗng -> reverse geocode để có địa chỉ "chuẩn".
        if (
            (isset($data['lat'], $data['lng']) && $data['lat'] !== null && $data['lng'] !== null)
            && (empty($data['dia_diem']) || !is_string($data['dia_diem']))
        ) {
            /** @var GeocodingService $geo */
            $geo = app(GeocodingService::class);
            $rev = $geo->reverseGeocode((float)$data['lat'], (float)$data['lng']);
            if ($rev && !empty($rev['display_name'])) {
                $data['dia_diem'] = $rev['display_name'];
            }
        }

        // Auto convert địa điểm text -> lat/lng nếu client chưa gửi tọa độ
        if (
            (!isset($data['lat']) || $data['lat'] === null || $data['lng'] === null)
            && !empty($data['dia_diem'])
        ) {
            /** @var GeocodingService $geo */
            $geo = app(GeocodingService::class);
            $coords = $geo->geocode($data['dia_diem']);
            if ($coords) {
                $data['lat'] = $coords['lat'];
                $data['lng'] = $coords['lng'];
            }
        }
        if (isset($data['lat'], $data['lng']) && $data['lat'] !== null && $data['lng'] !== null) {
            /** @var GeocodingService $geo */
            $geo = app(GeocodingService::class);
            $data['region'] = $geo->makeRegion((float)$data['lat'], (float)$data['lng']);
        }

        $trangThaiDefault = $data['loai_bai'] === 'CHO' ? 'CON_TANG' : 'CON_NHAN';
        $data['trang_thai'] = $data['trang_thai'] ?? $trangThaiDefault;

        $data['nguoi_dung_id'] = $userId;

        if ($request->hasFile('hinh_anh')) {
            $data['hinh_anh'] = $request->file('hinh_anh')->store('posts', 'public');
        } else {
            $data['hinh_anh'] = null;
        }

        $post = BaiDang::create($data);

        // 1) Danh muc goi y (khong bat nguoi dung chon).
        $gService = app(DanhMucSuggestionService::class);
        $suggestions = $gService->suggest($post->tieu_de, $post->mo_ta);
        DanhMucBaiDang::where('bai_dang_id', $post->id)->delete();
        foreach ($suggestions as $s) {
            DanhMucBaiDang::create([
                'bai_dang_id' => $post->id,
                'danh_muc_code' => $s['danh_muc_code'],
                'is_primary' => (bool)$s['is_primary'],
                'confidence' => (float)$s['confidence'],
            ]);
        }

        $post->load('nguoiDung');
        $post->avatar_url = $post->nguoiDung && $post->nguoiDung->anh_dai_dien
            ? asset('storage/' . $post->nguoiDung->anh_dai_dien)
            : null;
        $post->hinh_anh_url = $post->hinh_anh ? asset('storage/' . $post->hinh_anh) : null;
        unset($post->nguoiDung);

        $danhMucGoiY = DanhMucBaiDang::where('bai_dang_id', $post->id)
            ->orderByDesc('is_primary')
            ->orderByDesc('confidence')
            ->get(['danh_muc_code', 'is_primary', 'confidence']);

        return response()->json([
            'message' => 'Tạo bài đăng thành công',
            'data' => $post,
            'danh_muc_goi_y' => $danhMucGoiY,
        ], 201);
    }

   
    public function update(UpdatePostRequest $request, int $id)
    {
        $userId = Auth::id();

        $post = BaiDang::findOrFail($id);

        if ((int)$post->nguoi_dung_id !== (int)$userId) {
            return response()->json([
                'message' => 'Bạn không có quyền cập nhật bài này.'
            ], 403);
        }

        $data = $request->validated();

        // Nếu user update lat/lng (từ map) mà không gửi dia_diem -> reverse geocode để fill.
        if (
            (array_key_exists('lat', $data) || array_key_exists('lng', $data))
            && (isset($data['lat'], $data['lng']) && $data['lat'] !== null && $data['lng'] !== null)
            && (!array_key_exists('dia_diem', $data) || empty($data['dia_diem']))
        ) {
            /** @var GeocodingService $geo */
            $geo = app(GeocodingService::class);
            $rev = $geo->reverseGeocode((float)$data['lat'], (float)$data['lng']);
            if ($rev && !empty($rev['display_name'])) {
                $data['dia_diem'] = $rev['display_name'];
            }
        }

        // Nếu user cập nhật dia_diem mà không cung cấp lat/lng -> auto geocode
        $shouldGeocode = array_key_exists('dia_diem', $data)
            && !empty($data['dia_diem'])
            && (!isset($data['lat']) || $data['lat'] === null || !isset($data['lng']) || $data['lng'] === null);

        if ($shouldGeocode) {
            /** @var GeocodingService $geo */
            $geo = app(GeocodingService::class);
            $coords = $geo->geocode($data['dia_diem']);
            if ($coords) {
                $data['lat'] = $coords['lat'];
                $data['lng'] = $coords['lng'];
            }
        }
        if (isset($data['lat'], $data['lng']) && $data['lat'] !== null && $data['lng'] !== null) {
            /** @var GeocodingService $geo */
            $geo = app(GeocodingService::class);
            $data['region'] = $geo->makeRegion((float)$data['lat'], (float)$data['lng']);
        }

        // Nếu loai_bai được đổi nhưng không gửi trang_thai thì tự suy ra trạng thái tương ứng
        if (!empty($data['loai_bai'])) {
            $default = $data['loai_bai'] === 'CHO' ? 'CON_TANG' : 'CON_NHAN';
            if (empty($data['trang_thai'])) {
                $data['trang_thai'] = $default;
            }
        }

        if ($request->hasFile('hinh_anh')) {
            if ($post->hinh_anh && Storage::disk('public')->exists($post->hinh_anh)) {
                Storage::disk('public')->delete($post->hinh_anh);
            }

            $data['hinh_anh'] = $request->file('hinh_anh')->store('posts', 'public');
        }

        $post->update($data);
        $post->refresh();

        // 1) Update danh muc goi y khi title/desc thay doi.
        $gService = app(DanhMucSuggestionService::class);
        $suggestions = $gService->suggest($post->tieu_de, $post->mo_ta);
        DanhMucBaiDang::where('bai_dang_id', $post->id)->delete();
        foreach ($suggestions as $s) {
            DanhMucBaiDang::create([
                'bai_dang_id' => $post->id,
                'danh_muc_code' => $s['danh_muc_code'],
                'is_primary' => (bool)$s['is_primary'],
                'confidence' => (float)$s['confidence'],
            ]);
        }

        $post->load('nguoiDung');
        $post->avatar_url = $post->nguoiDung && $post->nguoiDung->anh_dai_dien
            ? asset('storage/' . $post->nguoiDung->anh_dai_dien)
            : null;
        $post->hinh_anh_url = $post->hinh_anh ? asset('storage/' . $post->hinh_anh) : null;
        unset($post->nguoiDung);

        $danhMucGoiY = DanhMucBaiDang::where('bai_dang_id', $post->id)
            ->orderByDesc('is_primary')
            ->orderByDesc('confidence')
            ->get(['danh_muc_code', 'is_primary', 'confidence']);

        return response()->json([
            'message' => 'Cập nhật bài đăng thành công',
            'data' => $post,
            'danh_muc_goi_y' => $danhMucGoiY,
        ]);
    }


    public function destroy(int $id)
    {
        $userId = Auth::id();

        $post = BaiDang::findOrFail($id);

        if ((int)$post->nguoi_dung_id !== (int)$userId) {
            return response()->json([
                'message' => 'Bạn không có quyền xóa bài này.'
            ], 403);
        }

        if ($post->hinh_anh && Storage::disk('public')->exists($post->hinh_anh)) {
            Storage::disk('public')->delete($post->hinh_anh);
        }

        $post->delete();

        return response()->json([
            'message' => 'Xóa bài đăng thành công'
        ]);
    }

    /**
     * GET /api/posts/{id}/matches
     * Laravel gọi sang service AI (FastAPI) để tính matching theo TF-IDF + cosine similarity + haversine + time scoring.
     */
    public function matches(int $id, AiMatchingService $aiMatchingService)
    {
        $source = BaiDang::with(['nguoiDung'])->findOrFail($id);

        $targetLoaiBai = $source->loai_bai === 'CHO' ? 'NHAN' : 'CHO';
        $maxRadiusKm = 20.0;
        $candidatePrelimit = 120;
        $aiInputLimit = 40;

        // Lọc ứng viên: loại đối ứng + trạng thái active phù hợp + khác người đăng
        $candidatesQuery = BaiDang::query()
            ->with(['nguoiDung'])
            ->select('bai_dang.*')
            ->where('loai_bai', $targetLoaiBai)
            // Du lieu thuc te co the lech status (vd: CHO + CON_NHAN).
            // Chi loai bai da ket thuc de tranh bo sot ung vien phu hop.
            ->whereNotIn('trang_thai', ['DA_NHAN', 'DA_TANG'])
            ->where('nguoi_dung_id', '!=', $source->nguoi_dung_id);

        if (!empty($source->region)) {
            $nearRegions = $this->neighborRegions($source->region);
            $regions = array_values(array_unique(array_filter(array_merge([$source->region], $nearRegions))));
            $candidatesQuery->whereIn('region', $regions);
        }

        if ($source->lat !== null && $source->lng !== null) {
            $distanceExpr = "(6371 * acos( cos(radians(?)) * cos(radians(bai_dang.lat)) * cos(radians(bai_dang.lng) - radians(?)) + sin(radians(?)) * sin(radians(bai_dang.lat)) ))";
            $candidatesQuery->whereNotNull('bai_dang.lat')
                ->whereNotNull('bai_dang.lng')
                ->whereRaw("$distanceExpr <= ?", [
                    $source->lat,
                    $source->lng,
                    $source->lat,
                    $maxRadiusKm
                ]);
            $distanceExprSelect = "(6371 * acos( cos(radians(" . (float)$source->lat . ")) * cos(radians(bai_dang.lat)) * cos(radians(bai_dang.lng) - radians(" . (float)$source->lng . ")) + sin(radians(" . (float)$source->lat . ")) * sin(radians(bai_dang.lat)) ))";
            $candidatesQuery->addSelect(DB::raw($distanceExprSelect . " as distance_km"))
                ->orderBy('distance_km', 'asc');
        } else {
            $candidatesQuery->orderByDesc('created_at');
        }

        $candidates = $candidatesQuery
            ->limit($candidatePrelimit)
            ->get();

        if ($source->lat !== null && $source->lng !== null) {
            $candidates = $candidates->sortBy('distance_km')->take($aiInputLimit)->values();
        } else {
            $candidates = $candidates->take($aiInputLimit)->values();
        }

        $postsPayload = [];
        $allPosts = collect([$source])->concat($candidates);
        $danhMucMap = $this->loadDanhMucMap($allPosts->pluck('id')->all());

        $postsPayload[] = $this->toAiPost($source, $danhMucMap);
        foreach ($candidates as $cand) {
            $postsPayload[] = $this->toAiPost($cand, $danhMucMap);
        }

        $payload = [
            'post_id' => $source->id,
            'posts' => $postsPayload,
        ];

        if (count($postsPayload) < 2) {
            return response()->json([
                'data' => [],
            ]);
        }

        $matches = $aiMatchingService->match($payload);

        $matchedIds = collect($matches)->pluck('post_id')->all();
        $matchedPosts = BaiDang::with(['nguoiDung'])->whereIn('id', $matchedIds)->get()->keyBy('id');

        $responseData = [];
        foreach ($matches as $item) {
            $post = $matchedPosts->get((int)$item['post_id']);
            if (!$post) {
                continue;
            }

            $post->avatar_url = $post->nguoiDung && $post->nguoiDung->anh_dai_dien
                ? asset('storage/' . $post->nguoiDung->anh_dai_dien)
                : null;
            $post->hinh_anh_url = $post->hinh_anh ? asset('storage/' . $post->hinh_anh) : null;

            $post->nguoi_dung_ten = $post->nguoiDung?->ho_ten;
            unset($post->nguoiDung);

            $responseData[] = [
                'post' => $post,
                'score' => (float)$item['score'],
                'distance_km' => (float)$item['distance'],
                'match_percent' => (float)$item['match_percent'],
            ];

            // Cache kết quả vào bảng ghep_noi_ai
            GhepNoiAi::updateOrCreate(
                [
                    'bai_dang_nguon_id' => $source->id,
                    'bai_dang_phu_hop_id' => $post->id,
                ],
                [
                    'diem_phu_hop' => (float)$item['score'],
                    'trang_thai' => 'GHEP_NOI',
                ]
            );
        }

        return response()->json([
            'data' => $responseData,
        ]);
    }

    private function toAiPost(BaiDang $post, array $danhMucMap = []): array
    {
        $m = $danhMucMap[(int)$post->id] ?? ['primary' => null, 'all' => []];
        return [
            'id' => (int)$post->id,
            'loai_bai' => $post->loai_bai,
            'tieu_de' => $post->tieu_de,
            'mo_ta' => $post->mo_ta,
            'lat' => $post->lat,
            'lng' => $post->lng,
            'region' => $post->region,
            'created_at' => $post->created_at?->toIso8601String(),
            'danh_muc' => $m['primary'],
            'danh_mucs' => $m['all'],
        ];
    }

    private function loadDanhMucMap(array $postIds): array
    {
        if (!$postIds) {
            return [];
        }

        $rows = \App\Models\DanhMucBaiDang::query()
            ->whereIn('bai_dang_id', $postIds)
            ->orderByDesc('is_primary')
            ->orderByDesc('confidence')
            ->get(['bai_dang_id', 'danh_muc_code', 'is_primary', 'confidence']);

        $map = [];
        foreach ($postIds as $id) {
            $map[(int)$id] = ['primary' => null, 'all' => []];
        }

        foreach ($rows as $row) {
            $id = (int)$row->bai_dang_id;
            $code = (string)$row->danh_muc_code;
            if (!isset($map[$id])) {
                $map[$id] = ['primary' => null, 'all' => []];
            }
            if (!in_array($code, $map[$id]['all'], true)) {
                $map[$id]['all'][] = $code;
            }
            if ($row->is_primary && $map[$id]['primary'] === null) {
                $map[$id]['primary'] = $code;
            }
        }

        return $map;
    }

    /**
     * Build nearby region keys around a base region "lat_lng".
     */
    private function neighborRegions(string $region): array
    {
        $parts = explode('_', $region);
        if (count($parts) !== 2 || !is_numeric($parts[0]) || !is_numeric($parts[1])) {
            return [];
        }

        $lat = round((float)$parts[0], 2);
        $lng = round((float)$parts[1], 2);
        $step = 0.01;
        $rows = [];

        foreach ([-$step, 0.0, $step] as $dLat) {
            foreach ([-$step, 0.0, $step] as $dLng) {
                if ($dLat == 0.0 && $dLng == 0.0) {
                    continue;
                }
                $rows[] = number_format($lat + $dLat, 2, '.', '') . '_' . number_format($lng + $dLng, 2, '.', '');
            }
        }

        return $rows;
    }
}

