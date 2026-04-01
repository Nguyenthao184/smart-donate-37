<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\Donate\DonateRequest;
use App\Http\Requests\Donate\ConfirmDonateRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\ChienDichGayQuy;

class DonateController extends Controller
{
    // Ủng hộ
    public function donate(DonateRequest $request)
    {
        $user = auth()->user();

        $campaign = ChienDichGayQuy::with('taiKhoanGayQuy')
            ->findOrFail($request->chien_dich_gay_quy_id);

        if ($campaign->trang_thai !== 'HOAT_DONG') {
            return response()->json([
                'message' => 'Chiến dịch không hoạt động'
            ], 400);
        }

        if ($campaign->ngay_ket_thuc < now()) {
            return response()->json([
                'message' => 'Chiến dịch đã kết thúc'
            ], 400);
        }

        // Tạo nội dung chuyển khoản (optional)
        $reference = strtoupper(Str::random(8));
        $noiDung = "{$campaign->ma_noi_dung_ck} {$reference}";

        // Lưu giao dịch chờ
        DB::table('giao_dich_cho_xu_ly')->insert([
            'nguoi_dung_id' => $user->id,
            'chien_dich_gay_quy_id' => $campaign->id,
            'so_tien' => $request->so_tien,
            'noi_dung' => $noiDung,
            'thoi_gian' => now(),
            'trang_thai' => 'CHUA_GAN',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'data' => [
                'so_tien' => $request->so_tien,
                'noi_dung_ck' => $noiDung,
                'qr_code' => $campaign->taiKhoanGayQuy->qr_code,
                'ten_tai_khoan' => $campaign->taiKhoanGayQuy->chu_tai_khoan,
                'so_tai_khoan' => $campaign->taiKhoanGayQuy->so_tai_khoan,
                'ten_ngan_hang' => "MB Bank",
            ]
        ]);
    }

    // Xác nhận ủng hộ
    public function confirmDonate(ConfirmDonateRequest $request)
    {
        $userId = auth()->id();

        // 1. Anti-spam (atomic)
        $key = 'confirm_' . $userId;
        if (!cache()->add($key, true, 5)) {
            return response()->json([
                'message' => 'Vui lòng thử lại sau 5 giây'
            ], 429);
        }

        try {
            DB::beginTransaction();

            // 2. Lock giao dịch pending của user
            $gds = DB::table('giao_dich_cho_xu_ly')
                ->where('nguoi_dung_id', $userId)
                ->where('trang_thai', 'CHUA_GAN')
                ->where('thoi_gian', '>=', now()->subMinutes(30))
                ->lockForUpdate()
                ->get();

            $bestMatch = null;
            $bestScore = 0;

            foreach ($gds as $gd) {
                $score = 0;

                // match số tiền
                $diff = abs($gd->so_tien - $request->so_tien);

                if ($diff == 0) {
                    $score += 50;
                } elseif ($diff <= 5000) {
                    $score += 30;
                }

                // match thời gian
                $minutes = now()->diffInMinutes($gd->thoi_gian);

                if ($minutes <= 5) {
                    $score += 30;
                } elseif ($minutes <= 15) {
                    $score += 20;
                }

                if ($score > $bestScore) {
                    $bestScore = $score;
                    $bestMatch = $gd;
                }
            }

            if (!$bestMatch || $bestScore < 50) {
                return response()->json([
                    'message' => 'Không tìm thấy giao dịch phù hợp'
                ], 404);
            }

            // 4. Lấy campaign
            $campaign = DB::table('chien_dich_gay_quy')
                ->where('id', $gd->chien_dich_gay_quy_id)
                ->lockForUpdate()
                ->first();

            if (!$campaign) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Chiến dịch không tồn tại'
                ], 404);
            }

            // 5. Tạo ủng hộ (unique mã giao dịch)
            $maGiaoDich = 'GD' . strtoupper(Str::random(10));

            $ungHoId = DB::table('ung_ho')->insertGetId([
                'nguoi_dung_id' => $userId,
                'chien_dich_gay_quy_id' => $campaign->id,
                'so_tien' => $gd->so_tien,
                'ma_giao_dich' => $maGiaoDich,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 6. Ghi sổ quỹ
            DB::table('giao_dich_quy')->insert([
                'tai_khoan_gay_quy_id' => $campaign->tai_khoan_gay_quy_id,
                'ung_ho_id' => $ungHoId,
                'so_tien' => $gd->so_tien,
                'loai_giao_dich' => 'UNG_HO',
                'mo_ta' => $gd->noi_dung,
                'created_at' => now(),
            ]);

            // 7. Update số dư tài khoản quỹ
            DB::table('tai_khoan_gay_quy')
                ->where('id', $campaign->tai_khoan_gay_quy_id)
                ->increment('so_du', $gd->so_tien);

            // 8. Update tiền chiến dịch
            DB::table('chien_dich_gay_quy')
                ->where('id', $campaign->id)
                ->increment('so_tien_da_nhan', $gd->so_tien);

            // 9. Update trạng thái giao dịch chờ
            DB::table('giao_dich_cho_xu_ly')
                ->where('id', $gd->id)
                ->update([
                    'trang_thai' => 'DA_GAN',
                    'updated_at' => now()
                ]);

            DB::commit();

            return response()->json([
                'message' => 'Ủng hộ thành công',
                'data' => [
                    'ma_giao_dich' => $maGiaoDich
                ]
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Có lỗi xảy ra',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Lịch sử ủng hộ của user
    public function donateHistory()
    {
        $userId = auth()->id();

        $data = DB::table('ung_ho as uh')
            ->join('chien_dich_gay_quy as cd', 'uh.chien_dich_gay_quy_id', '=', 'cd.id')
            ->leftJoin('tai_khoan_gay_quy as tk', 'cd.tai_khoan_gay_quy_id', '=', 'tk.id')
            ->select(
                'uh.id',
                'uh.so_tien',
                'uh.created_at as ngay_ung_ho',
                'cd.id as chien_dich_id',
                'cd.ten_chien_dich',
                'cd.hinh_anh'
            )
            ->where('uh.nguoi_dung_id', $userId)
            ->orderByDesc('uh.created_at')
            ->get()
            ->map(function ($item) {
            // lấy ảnh đầu tiên từ JSON
            $images = json_decode($item->hinh_anh, true);

            $item->anh = $images[0] ?? null;

            unset($item->hinh_anh);
            return $item;
        });

        return response()->json([
            'data' => $data
        ]);
    }
}