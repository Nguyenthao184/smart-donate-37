<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ChienDichGayQuy;
use App\Models\ToChuc;
use App\Models\TaiKhoanGayQuy;
use App\Models\DanhMuc;
use Illuminate\Support\Str;
use App\Http\Requests\Campaign\StoreCampaignRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use App\Services\ApprovalService;
use App\Notifications\ApprovalNotification;
use Illuminate\Support\Facades\DB;

class CampaignController extends Controller
{
    //tạo chiến dịch
    public function store(StoreCampaignRequest $request)
    {
        $user = auth()->user();
        $toChuc = $user->toChuc;

        if (!$toChuc) {
            return response()->json([
                'message' => 'Bạn chưa phải tổ chức'
            ], 403);
        }

        // 2. Check xác minh
        if ($toChuc->trang_thai != 'HOAT_DONG') {
            return response()->json([
                'message' => 'Tổ chức chưa được xác minh'
            ], 400);
        }

        $taiKhoan = $toChuc->taiKhoanGayQuy;

        if (!$taiKhoan) {
            return response()->json([
                'message' => 'Tổ chức chưa có tài khoản gây quỹ'
            ], 400);
        }

        // chưa duyệt
        if ($taiKhoan->trang_thai === 'CHO_DUYET') {
            return response()->json([
                'message' => 'Tài khoản gây quỹ đang chờ duyệt'
            ], 400);
        }

        // bị khóa
        if ($taiKhoan->trang_thai === 'KHOA') {
            return response()->json([
                'message' => 'Tài khoản gây quỹ đã bị khóa'
            ], 400);
        }
        // 3. Geocoding
        if ($request->lat < 8 || $request->lat > 24 ||
            $request->lng < 102 || $request->lng > 110) {
            return response()->json([
                'message' => 'Vị trí không hợp lệ'
            ], 400);
        }
        // 4. Lấy tài khoản gây quỹ (tự động)
        $taiKhoan = $toChuc->taiKhoanGayQuy;

        if (!$taiKhoan) {
            return response()->json([
                'message' => 'Tổ chức chưa có tài khoản gây quỹ'
            ], 400);
        }

        // 5. Upload ảnh
        $images = [];

        foreach ($request->file('hinh_anh') as $file) {
            $path = $file->store('campaigns', 'public');
            $images[] = $path;
        }

        // 6. Tạo mã chuyển tiền UNIQUE
        do {
            $maCK = 'CT' . strtoupper(\Illuminate\Support\Str::random(8));
        } while (ChienDichGayQuy::where('ma_noi_dung_ck', $maCK)->exists());

        // 7. Tạo chiến dịch
        $chienDich = ChienDichGayQuy::create([
            'tai_khoan_gay_quy_id' => $taiKhoan->id,
            'to_chuc_id' => $toChuc->id,
            'danh_muc_id' => $request->danh_muc_id,

            'ten_chien_dich' => $request->ten_chien_dich,
            'mo_ta' => $request->mo_ta,
            'hinh_anh' => json_encode($images),

            'muc_tieu_tien' => $request->muc_tieu_tien,
            'so_tien_da_nhan' => 0,

            'ngay_ket_thuc' => $request->ngay_ket_thuc,
            'vi_tri' => $request->vi_tri,
            'lat' => $request->lat,
            'lng' => $request->lng,
            
            'ma_noi_dung_ck' => $maCK,
            'trang_thai' => 'CHO_XU_LY'
        ]);

        return response()->json([
            'message' => 'Tạo chiến dịch thành công, chờ duyệt',
            'data' => $chienDich
        ]);
    }

    //danh sách chiến dịch
    public function index(Request $request)
    {
        $query = ChienDichGayQuy::with(['toChuc', 'danhMuc'])
            ->withCount('ungHos')
            ->whereIn('trang_thai', ['HOAT_DONG', 'HOAN_THANH', 'TAM_DUNG', 'DA_KET_THUC']);

        if ($request->keyword) {
            $query->where('ten_chien_dich', 'like', '%' . $request->keyword . '%');
        }

        if ($request->danh_muc_id) {
            $query->where('danh_muc_id', $request->danh_muc_id);
        }

        $sort = $request->sort ?? 'newest';

        switch ($sort) {

            case 'ending_soon':
                $query->orderBy('ngay_ket_thuc', 'asc');
                break;

            case 'almost_done':
                $query->orderByRaw('(so_tien_da_nhan / NULLIF(muc_tieu_tien, 0)) DESC');
                break;

            default:
                $query->latest(); // = orderBy created_at DESC
                break;
        }

        $campaigns = $query->paginate(7);

        // format lại dữ liệu cho FE
        $campaigns->getCollection()->transform(fn($item) 
            => $this->formatCampaign($item));

        return response()->json($campaigns);
    }

    //danh sách chiến dịch của tôi
    public function myCampaigns(Request $request)
    {
        $user = auth()->user();
        $toChuc = $user->toChuc;

        if (!$toChuc) {
            return response()->json([
                'message' => 'Bạn không phải tổ chức'
            ], 403);
        }

        $query = ChienDichGayQuy::where('to_chuc_id', $toChuc->id);

        // tìm kiếm 
        if ($request->keyword) {
            $query->where('ten_chien_dich', 'like', '%' . $request->keyword . '%');
        }

        if ($request->danh_muc_id) {
            $query->where('danh_muc_id', $request->danh_muc_id);
        }

        //  sort 
        $sort = $request->sort ?? 'newest';

        switch ($sort) {
            case 'ending_soon':
                $query->orderBy('ngay_ket_thuc', 'asc');
                break;

            case 'almost_done':
                $query->orderByRaw('(so_tien_da_nhan / NULLIF(muc_tieu_tien, 0)) DESC');
                break;

            default:
                $query->latest();
                break;
        }

        $campaigns = $query->paginate(7);

        $campaigns->getCollection()->transform(fn($item) 
            => $this->formatCampaign($item));

        return response()->json($campaigns);
    }

    //chi tiết chiến dịch
    public function show($id)
    {
        $chienDich = ChienDichGayQuy::with(['toChuc', 'danhMuc'])
            ->find($id);

        if (!$chienDich) {
            return response()->json([
                'message' => 'Không tìm thấy chiến dịch'
            ], 404);
        }

        $phanTram = $chienDich->muc_tieu_tien > 0
            ? round(($chienDich->so_tien_da_nhan / $chienDich->muc_tieu_tien) * 100)
            : 0;

        $ngayConLai = max(0, floor(
            now()->diffInDays($chienDich->ngay_ket_thuc, false)
        ));

        $images = json_decode($chienDich->hinh_anh, true) ?? [];

        $images = array_map(function ($img) {
            return asset('storage/' . $img);
        }, $images);

        $donations = DB::table('ung_ho as uh')
            ->leftJoin('nguoi_dung as nd', 'uh.nguoi_dung_id', '=', 'nd.id')
            ->select(
                'uh.so_tien',
                'uh.created_at',
                'nd.ho_ten'
            )
            ->where('uh.chien_dich_gay_quy_id', $chienDich->id)
            ->orderByDesc('uh.created_at')
            ->limit(10) // giới hạn 10 dòng giống UI
            ->get()
            ->map(function ($item) {
                return [
                    'ten_nguoi_ung_ho' => $item->ho_ten ?? 'Người ủng hộ ẩn danh',
                    'so_tien' => number_format($item->so_tien, 0, ',', '.') . 'đ',
                    'thoi_gian' => \Carbon\Carbon::parse($item->created_at)->format('d/m/Y H:i')
                ];
            });
        
        $soLuotUngHo = DB::table('ung_ho')
            ->where('chien_dich_gay_quy_id', $chienDich->id)
            ->count();

        return response()->json([
            'id' => $chienDich->id,
            'ten_chien_dich' => $chienDich->ten_chien_dich,
            'mo_ta' => $chienDich->mo_ta,
            'ten_danh_muc' => $chienDich->danhMuc->ten_danh_muc ?? null,


            'hinh_anh' => $images,

            'so_tien_da_nhan' => $chienDich->so_tien_da_nhan,
            'muc_tieu_tien' => $chienDich->muc_tieu_tien,
            'phan_tram' => $phanTram,
            'ma_noi_dung_ck' => $chienDich->ma_noi_dung_ck,

            'ngay_bat_dau' => optional($chienDich->created_at)->format('d/m/Y'),
            'ngay_ket_thuc' => \Carbon\Carbon::parse($chienDich->ngay_ket_thuc)->format('d/m/Y'),
            'so_ngay_con_lai' => $ngayConLai,

            'vi_tri' => $chienDich->vi_tri,
            'lat' => $chienDich->lat,
            'lng' => $chienDich->lng,

            'to_chuc' => [
                'ten_to_chuc' => $chienDich->toChuc->ten_to_chuc ?? null,
                'logo' => $chienDich->toChuc->logo ? asset('storage/' . $chienDich->toChuc->logo) : null,
                'mo_ta' => $chienDich->toChuc->mo_ta ?? null,
                'dia_chi' => $chienDich->toChuc->dia_chi ?? null,
                'email' => $chienDich->toChuc->email ?? null,
                'so_dien_thoai' => $chienDich->toChuc->so_dien_thoai ?? null,
            ],
            'danh_sach_ung_ho' => $donations,
            'so_luot_ung_ho' => $soLuotUngHo,
        ]);
    }

    //duyệt chiến dịch
    public function approveCampaign($id, ApprovalService $service)
    {
        $campaign = ChienDichGayQuy::findOrFail($id);

        $service->approve($campaign);

        $user = $campaign->toChuc->user;

        $user->notify(new ApprovalNotification('approve', 'Chiến dịch'));

        return response()->json([
            'message' => 'Đã duyệt chiến dịch'
        ]);
    }

    //từ chối chiến dịch
    public function rejectCampaign(Request $request, $id, ApprovalService $service)
    {
        $campaign = ChienDichGayQuy::findOrFail($id);

        $service->reject($campaign, $request->ly_do);

        $user = $campaign->toChuc->user;

        $user->notify(new ApprovalNotification('reject', 'Chiến dịch', $request->ly_do));

        return response()->json([
            'message' => 'Đã từ chối chiến dịch'
        ]);
    }

    //chiến dịch nổi bật
    public function featured()
    {
        $campaigns = ChienDichGayQuy::withCount('ungHos')
            ->where('trang_thai', 'HOAT_DONG')
            ->whereColumn('so_tien_da_nhan', '<', 'muc_tieu_tien') // chưa đạt target
            ->orderByRaw('(so_tien_da_nhan / NULLIF(muc_tieu_tien, 0)) DESC')
            ->orderByDesc('ung_hos_count')
            ->limit(6)
            ->get();

        $campaigns->transform(fn($item) => $this->formatCampaign($item));

        return response()->json($campaigns);
    }

    private function formatCampaign($item)
    {
        $soTien = $item->so_tien_da_nhan;
        $mucTieu = $item->muc_tieu_tien;

        $phanTram = $mucTieu > 0 
            ? round(($soTien / $mucTieu) * 100) 
            : 0;

        $ngayConLai = max(0, floor(now()->diffInDays($item->ngay_ket_thuc, false)));

        $images = json_decode($item->hinh_anh, true);
        $image = $images[0] ?? null;

        $soTienConThieu = 0;
        if (
            $item->trang_thai === 'HOAT_DONG' &&
            $soTien < $mucTieu
        ) {
            $soTienConThieu = $mucTieu - $soTien;
        }
        return [
            'id' => $item->id,
            'ten_chien_dich' => $item->ten_chien_dich,
            'hinh_anh' => $image ? asset('storage/' . $image) : null,
            'so_tien_da_nhan' => $soTien,
            'muc_tieu_tien' => $mucTieu,
            'phan_tram' => $phanTram,
            'so_ngay_con_lai' => $ngayConLai,
            'trang_thai' => $item->trang_thai,
            'so_tien_con_thieu' => $soTienConThieu,
            'so_luot_ung_ho' => $item->ung_hos_count ?? 0,
        ];
    }

    public function getDanhMuc()
    {
        $danhMucs = DB::table('danh_muc')
            ->select('id', 'ten_danh_muc', 'hinh_anh')
            ->get()
            ->map(function ($item) {
                $item->hinh_anh = asset('storage/' . $item->hinh_anh);
                return $item;
            });

        return response()->json($danhMucs);
    }
}
