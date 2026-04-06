<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Requests\User\ChangePasswordRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\ToChuc;
use Illuminate\Support\Facades\DB;

class UserProfileController extends Controller
{
    //lấy ttcn
    public function getProfile()
    {
        $user = Auth::user();

        // load quan hệ
        $user->load(['toChuc.taiKhoanGayQuy']);

        $tongTienUngHo = DB::table('ung_ho')
            ->where('nguoi_dung_id', $user->id)
            ->sum('so_tien');
        
        return response()->json([
            'user' => $user,
            'avatar_url' => $user->anh_dai_dien
                ? asset('storage/' . $user->anh_dai_dien)
                : null,
            'tong_tien_ung_ho' => $tongTienUngHo,
        ]);
    }

    //cập nhật ttcn
    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = Auth::user();

        // UPDATE USER
        $userData = $request->only([
            'ho_ten'
        ]);

        if ($request->hasFile('anh_dai_dien')) {

            if ($user->anh_dai_dien && Storage::disk('public')->exists($user->anh_dai_dien)) {
                Storage::disk('public')->delete($user->anh_dai_dien);
            }

            $userData['anh_dai_dien'] = $request->file('anh_dai_dien')
                ->store('avatars', 'public');
        }

        if (!empty(array_filter($userData))) {
            $user->update($userData);
        }

        //UPDATE TO_CHUC (nếu có)

        $toChuc = $user->toChuc;

        if ($toChuc) {

            $orgData = $request->only([
                'email',
                'mo_ta',
                'dia_chi',
                'so_dien_thoai'
            ]);

            if ($request->hasFile('logo')) {

                if ($toChuc->logo && Storage::disk('public')->exists($toChuc->logo)) {
                    Storage::disk('public')->delete($toChuc->logo);
                }

                $orgData['logo'] = $request->file('logo')
                    ->store('logos', 'public');
            }

            // chỉ update khi có data
            if (!empty(array_filter($orgData))) {
                $toChuc->update($orgData);
            }
        }

        /**
         * ========================
         * RESPONSE
         * ========================
         */
        return response()->json([
            'message' => 'Cập nhật profile thành công',
            'user' => $user->fresh()->load('toChuc')
        ]);
    }

    //đổi mật khẩu
    public function changePassword(ChangePasswordRequest $request)
    {
        $user = Auth::user();

        // kiểm tra mật khẩu hiện tại
        if (!Hash::check($request->current_password, $user->mat_khau)) {
            return response()->json([
                'message' => 'Mật khẩu hiện tại không đúng.'
            ], 400);
        }

        // kiểm tra mật khẩu mới trùng mật khẩu cũ
        if (Hash::check($request->new_password, $user->mat_khau)) {
            return response()->json([
                'message' => 'Mật khẩu mới không được trùng mật khẩu cũ.'
            ], 400);
        }

        // cập nhật mật khẩu mới
        $user->update([
            'mat_khau' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Đổi mật khẩu thành công'
        ]);
    }
}
