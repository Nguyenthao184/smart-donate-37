<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\XacMinhToChuc;
use App\Models\TaiKhoanGayQuy;
use App\Http\Requests\Organization\OrganizationRegisterRequest;
use Illuminate\Support\Facades\DB;

class OrganizationController extends Controller
{
    // USER đăng ký
    public function register(OrganizationRegisterRequest $request)
    {
        DB::beginTransaction();

        try {
            // CHECK ROLE TO_CHUC
            $isToChuc = DB::table('nguoi_dung_vai_tro')
                ->where('nguoi_dung_id', auth()->id())
                ->where('vai_tro_id', 3)
                ->exists();

            if ($isToChuc) {
                return response()->json([
                    'message' => 'Bạn đã là tổ chức từ thiện, không thể đăng ký lại'
                ], 400);
            }

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
            $org = XacMinhToChuc::findOrFail($id);

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

            DB::commit();

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
    public function reject($id)
    {
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

        return response()->json(['message' => 'Đã từ chối']);
    }
}
