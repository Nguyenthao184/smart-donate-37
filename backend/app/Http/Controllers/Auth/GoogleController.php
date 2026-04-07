<?php

namespace App\Http\Controllers\Auth;

use Laravel\Socialite\Facades\Socialite;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $email = $googleUser->getEmail();

        $user = User::where('email', $email)->first();

        if (!$user) {
            return redirect("http://localhost:5173/login?error=email_not_found");
        }

        if ($user->trang_thai == 'BI_CAM') {
            return response()->json([
                'status' => false,
                'message' => 'Tài khoản đã bị cấm'
            ],403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $roles = $user->roles->pluck('ten_vai_tro')->implode(',');
        return redirect("http://localhost:5173/bang-tin?token={$token}&roles={$roles}");
    }
}
