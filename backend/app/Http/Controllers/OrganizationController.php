<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\XacMinhToChuc;
use App\Models\TaiKhoanGayQuy;
use App\Models\ToChuc;
use App\Http\Requests\Organization\OrganizationRegisterRequest;
use Illuminate\Support\Facades\DB;
use App\Notifications\ApprovalNotification;
use App\Services\ApprovalService;

class OrganizationController extends Controller
{
    // USER đăng ký
    public function register(OrganizationRegisterRequest $request)
    {
        DB::beginTransaction();

        try {
            // upload file
            $path = null;
            if ($request->hasFile('giay_phep')) {
                $path = $request->file('giay_phep')->store('giay_phep', 'public');
            }

            $org = XacMinhToChuc::create([
                'nguoi_dung_id' => auth()->id(),
                'ten_to_chuc' => $request->ten_to_chuc,
                'ma_so_thue' => $request->ma_so_thue,
                'nguoi_dai_dien' => $request->nguoi_dai_dien,
                'giay_phep' => $path,
                'loai_hinh' => $request->loai_hinh,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Đăng ký thành công, vui lòng chờ admin duyệt',
                'data' => $org
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // USER xem trạng thái
    public function status()
    {
        return XacMinhToChuc::where('nguoi_dung_id', auth()->id())->latest()->first();
    }

    // ADMIN duyệt
    public function approve($id)
    {
        DB::beginTransaction();

        try {
            $org = XacMinhToChuc::with('user')->findOrFail($id);

            // nếu đã xử lý rồi thì không duyệt lại
            if ($org->trang_thai !== 'CHO_XU_LY') {
                return response()->json([
                    'message' => 'Yêu cầu đã được xử lý trước đó'
                ], 400);
            }

            // duyệt tổ chức
            $org->update([
                'trang_thai' => 'CHAP_NHAN',
                'duyet_boi' => auth()->id(),
                'duyet_luc' => now()
            ]);

            // nâng quyền user thành tổ chức
            DB::table('nguoi_dung_vai_tro')->insert([
                'nguoi_dung_id' => $org->nguoi_dung_id,
                'vai_tro_id' => 3, 
            ]);

            ToChuc::updateOrCreate(
                ['nguoi_dung_id' => $org->nguoi_dung_id],
                [
                    'xac_minh_to_chuc_id' => $org->id,
                    'ten_to_chuc' => $org->ten_to_chuc,
                    'email' => $org->user->email,
                    'trang_thai' => 'HOAT_DONG'
                ]
            );


            DB::commit();

            // Gửi notification
            $user = $org->user;
            $user->notify(
                new ApprovalNotification('approve', 'Tổ chức')
            );

            return response()->json([
                'message' => 'Duyệt tổ chức thành công'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ADMIN từ chối
    public function reject(Request $request, $id)
    {
        $request->validate([
            'ly_do' => 'required|string|max:255'
        ]);

        $org = XacMinhToChuc::findOrFail($id);

        // nếu đã xử lý rồi thì không reject lại
        if ($org->trang_thai !== 'CHO_XU_LY') {
            return response()->json([
                'message' => 'Yêu cầu đã được xử lý trước đó'
            ], 400);
        }

        $org->update([
            'trang_thai' => 'TU_CHOI',
            'duyet_boi' => auth()->id(),
            'duyet_luc' => now()
        ]);

        $user = $org->user;
        $user->notify(
            new ApprovalNotification(
                'reject',
                'Tổ chức',
                $request->ly_do
            )
        );

        return response()->json([
            'message' => 'Đã từ chối',
            'ly_do' => $request->ly_do
        ]);
    }

    // Danh sách tổ chức
    public function index(Request $request)
    {
        $query = ToChuc::query()
            ->with('taiKhoanGayQuy')
            ->leftJoin('xac_minh_to_chuc', 'to_chuc.xac_minh_to_chuc_id', '=', 'xac_minh_to_chuc.id')
            ->leftJoin('chien_dich_gay_quy', 'to_chuc.id', '=', 'chien_dich_gay_quy.to_chuc_id')
            ->select(
                'to_chuc.id',
                'to_chuc.ten_to_chuc',
                'to_chuc.logo',
                'to_chuc.dia_chi',
                'xac_minh_to_chuc.loai_hinh',
                'to_chuc.created_at',
                DB::raw('COALESCE(SUM(chien_dich_gay_quy.so_tien_da_nhan), 0) as tong_gay_quy')
            )
            ->groupBy(
                'to_chuc.id',
                'to_chuc.ten_to_chuc',
                'to_chuc.logo',
                'to_chuc.dia_chi',
                'xac_minh_to_chuc.loai_hinh',
                'to_chuc.created_at'
            );

        if ($request->keyword) {
            $query->where('to_chuc.ten_to_chuc', 'like', '%' . $request->keyword . '%');
        }

        if ($request->loai_hinh) {
            $query->where('xac_minh_to_chuc.loai_hinh', $request->loai_hinh);
        }

        // TOP theo tổng gây quỹ
        $query->orderByDesc('tong_gay_quy')
            ->orderByDesc('to_chuc.created_at');

        $orgs = $query->paginate(6);

        // Tổng tổ chức
        $totalAll = ToChuc::count();

        $totalByType = DB::table('xac_minh_to_chuc')
            ->select('loai_hinh', DB::raw('count(*) as total'))
            ->groupBy('loai_hinh')
            ->get();

        $orgs->through(function ($org) {
            return [
                'id' => $org->id,
                'ten_to_chuc' => $org->ten_to_chuc,
                'logo' => $org->logo ? asset('storage/' . $org->logo) : null,
                'dia_chi' => $org->dia_chi,
                'tong_gay_quy' => (float) $org->tong_gay_quy,
                'so_tai_khoan' => optional($org->taiKhoanGayQuy)->so_tai_khoan,
                'tham_gia' => optional($org->created_at)->format('m/Y'),
            ];
        });

        return response()->json([
            'data' => $orgs,
            'tong_to_chuc' => $totalAll,
            'theo_loai' => $totalByType
        ]);
    }

    // Thông tin tổ chức + chiến dịch
    public function show($id)
    {
        // Thông tin tổ chức + tài khoản
        $org = ToChuc::with('taiKhoanGayQuy')->findOrFail($id);

        // Danh sách chiến dịch
        $chienDichs = DB::table('chien_dich_gay_quy')
            ->where('to_chuc_id', $id)
            ->latest()
            ->get()
            ->map(function ($cd) {

                // ảnh
                $hinhAnh = null;
                if ($cd->hinh_anh) {
                    $arr = json_decode($cd->hinh_anh, true);
                    $hinhAnh = isset($arr[0]) ? asset($arr[0]) : null;
                }

                // % hoàn thành
                $phanTram = $cd->muc_tieu_tien > 0
                    ? round(($cd->so_tien_da_nhan / $cd->muc_tieu_tien) * 100)
                    : 0;

                // số ngày còn lại
                $soNgayConLai = null;
                if ($cd->trang_thai === 'HOAT_DONG') {
                    $soNgayConLai = (int) max(
                        0,
                        now()->diffInDays($cd->ngay_ket_thuc, false)
                    );
                }

                // số lượt ủng hộ
                $soLuotUngHo = DB::table('ung_ho')
                    ->where('chien_dich_gay_quy_id', $cd->id)
                    ->count();

                return [
                    'id' => $cd->id,
                    'hinh_anh' => $hinhAnh,
                    'ten_chien_dich' => $cd->ten_chien_dich,

                    'so_tien_da_nhan' => (float) $cd->so_tien_da_nhan,
                    'muc_tieu_tien' => (float) $cd->muc_tieu_tien,

                    'phan_tram' => $phanTram,
                    'trang_thai' => $cd->trang_thai,
                    'so_ngay_con_lai' => $soNgayConLai,

                    // giống UI
                    'so_luot_ung_ho' => $soLuotUngHo,
                ];
            });

        // Tổng thu
        $tongThu = DB::table('chien_dich_gay_quy')
            ->where('to_chuc_id', $id)
            ->sum('so_tien_da_nhan');

        // Tổng chi (từ giao_dich_quy)
        $tongChi = DB::table('giao_dich_quy')
            ->join('tai_khoan_gay_quy', 'giao_dich_quy.tai_khoan_gay_quy_id', '=', 'tai_khoan_gay_quy.id')
            ->where('tai_khoan_gay_quy.to_chuc_id', $id)
            ->where('loai_giao_dich', 'RUT')
            ->sum('so_tien');

        // Tổng chiến dịch
        $tongChienDich = DB::table('chien_dich_gay_quy')
            ->where('to_chuc_id', $id)
            ->count();

        // Tổng lượt ủng hộ (cho box bên phải)
        $tongLuotUngHo = DB::table('ung_ho')
            ->join('chien_dich_gay_quy', 'ung_ho.chien_dich_gay_quy_id', '=', 'chien_dich_gay_quy.id')
            ->where('chien_dich_gay_quy.to_chuc_id', $id)
            ->count();

        $tk = $org->taiKhoanGayQuy;

        return response()->json([
            // thông tin tổ chức
            'id' => $org->id,
            'ten_to_chuc' => $org->ten_to_chuc,
            'logo' => $org->logo ? asset('storage/' . $org->logo) : null,
            'mo_ta' => $org->mo_ta,
            'dia_chi' => $org->dia_chi,
            'so_dien_thoai' => $org->so_dien_thoai,
            'email' => $org->email,

            // danh sách chiến dịch
            'chien_dichs' => $chienDichs,

            // tài khoản
            'ten_tai_khoan' => optional($tk)->chu_tai_khoan,
            'so_tai_khoan' => optional($tk)->so_tai_khoan,
            'so_du_hien_tai' => (float) optional($tk)->so_du ?? 0,
            'qr_code' => optional($tk)->qr_code 
                ? asset('storage/' . $tk->qr_code) 
                : null,

            // thống kê (match UI)
            'tong_thu' => (float) $tongThu,
            'tong_chi' => (float) $tongChi,
            'tong_chien_dich' => $tongChienDich,
            'tong_luot_ung_ho' => $tongLuotUngHo,
        ]);
    }
}
