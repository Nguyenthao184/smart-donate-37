<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Requests\User\ChangePasswordRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserProfileController extends Controller
{
    //lấy ttcn
    public function getProfile()
    {
        $user = Auth::user();

        return response()->json([
            'user' => $user,
            'avatar_url' => $user->anh_dai_dien 
                ? asset('storage/'.$user->anh_dai_dien)
                : null
        ]);
    }

    //cập nhật ttcn
    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = Auth::user();

        $data = $request->except('anh_dai_dien');

        /**
         * Upload avatar
         */
        if ($request->hasFile('anh_dai_dien')) {

            // xóa avatar cũ
            if ($user->anh_dai_dien && Storage::disk('public')->exists($user->anh_dai_dien)) {
                Storage::disk('public')->delete($user->anh_dai_dien);
            }

            // upload avatar mới
            $path = $request->file('anh_dai_dien')->store('avatars', 'public');

            $data['anh_dai_dien'] = $path;
        }

        /**
         * update user
         */
        $user->update($data);
        $user->refresh();

        return response()->json([
            'message' => 'Cập nhật profile thành công',
            'user' => $user,
            'avatar_url' => $user->anh_dai_dien 
                ? asset('storage/'.$user->anh_dai_dien)
                : null
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
