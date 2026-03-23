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
            ->with(['nguoiDung', 'danhMuc'])
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
        $post = BaiDang::with(['nguoiDung', 'danhMuc'])->findOrFail($id);

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

        $trangThaiDefault = $data['loai_bai'] === 'CHO' ? 'CON_TANG' : 'CON_NHAN';
        $data['trang_thai'] = $data['trang_thai'] ?? $trangThaiDefault;

        $data['nguoi_dung_id'] = $userId;

        if ($request->hasFile('hinh_anh')) {
            $data['hinh_anh'] = $request->file('hinh_anh')->store('posts', 'public');
        } else {
            $data['hinh_anh'] = null;
        }

        $post = BaiDang::create($data);

        return response()->json([
            'message' => 'Tạo bài đăng thành công',
            'data' => $post
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

        return response()->json([
            'message' => 'Cập nhật bài đăng thành công',
            'data' => $post
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
        $source = BaiDang::with(['danhMuc', 'nguoiDung'])->findOrFail($id);

        $targetLoaiBai = $source->loai_bai === 'CHO' ? 'NHAN' : 'CHO';
        $activeStatus = $targetLoaiBai === 'CHO' ? 'CON_TANG' : 'CON_NHAN';

        // Lọc ứng viên: loại đối ứng + trạng thái active phù hợp + khác người đăng
        $candidates = BaiDang::query()
            ->with(['danhMuc', 'nguoiDung'])
            ->where('loai_bai', $targetLoaiBai)
            ->where('trang_thai', $activeStatus)
            ->where('nguoi_dung_id', '!=', $source->nguoi_dung_id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $postsPayload = [];
        $postsPayload[] = $this->toAiPost($source);
        foreach ($candidates as $cand) {
            $postsPayload[] = $this->toAiPost($cand);
        }

        $payload = [
            'post_id' => $source->id,
            'posts' => $postsPayload,
        ];

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

    private function toAiPost(BaiDang $post): array
    {
        return [
            'id' => (int)$post->id,
            'loai_bai' => $post->loai_bai,
            'tieu_de' => $post->tieu_de,
            'mo_ta' => $post->mo_ta,
            'lat' => $post->lat,
            'lng' => $post->lng,
            'created_at' => $post->created_at?->toIso8601String(),
            'danh_muc' => $post->danhMuc?->ten_danh_muc,
        ];
    }
}

