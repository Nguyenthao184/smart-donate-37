<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{

    // đăng ký
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'ho_ten' => $data['ho_ten'],
            'ten_tai_khoan' => $data['ten_tai_khoan'],
            'email' => $data['email'],
            'mat_khau' => Hash::make($data['password'])
        ]);

        // gán role người dùng
        $user->roles()->attach(2);

        return response()->json([
            'message' => 'Đăng ký thành công',
            'user' => $user
        ]);
    }

    // đăng nhập
    public function login(LoginRequest $request)
    {

        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->mat_khau)) {
            return response()->json([
                'message' => 'Sai email hoặc mật khẩu'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'roles' => $user->roles->pluck('ten_vai_tro') 
        ]);
    }

    //đăng xuất
    public function logout()
    {
        Auth::user()->tokens()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công'
        ]);
    }
}