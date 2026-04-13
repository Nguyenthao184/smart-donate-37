<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\User\ForgotPasswordRequest;
use App\Http\Requests\User\ResetPasswordRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    // đăng ký
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        if (User::where('email', $data['email'])->exists()) {
            return response()->json([
                'message' => 'Email đã tồn tại'
            ], 400);
        }

        // chống spam
        if (Cache::has('verify_limit_' . $data['email'])) {
            return response()->json([
                'message' => 'Vui lòng đợi trước khi gửi lại'
            ], 429);
        }

        $token = Str::random(64);

        // lưu tạm
        Cache::put('register_token_' . $token, [
            'email' => $data['email'],
            'ho_ten' => $data['ho_ten'],
            'password' => Hash::make($data['password'])
        ], now()->addMinutes(10));

        Cache::put('verify_limit_' . $data['email'], true, 60);

        $link = "http://localhost:8000/api/verify-register?token=$token";

        Mail::html("
        <div style='font-family: Arial, sans-serif; background:#f4f6f8; padding:40px'>
            <div style='max-width:500px; margin:auto; background:white; padding:30px; border-radius:10px; text-align:center'>
                
                <h2 style='color:#333;'>Xác minh tài khoản</h2>
                
                <p style='color:#666; font-size:14px;'>
                    Cảm ơn bạn đã đăng ký 🎉 <br>
                    Nhấn nút bên dưới để xác minh email của bạn.
                </p>

                <a href='$link' 
                style='display:inline-block;
                        margin-top:20px;
                        padding:12px 25px;
                        background:linear-gradient(135deg,#4CAF50,#2ecc71);
                        color:white;
                        text-decoration:none;
                        font-weight:bold;
                        border-radius:6px;
                        box-shadow:0 4px 10px rgba(0,0,0,0.1);'>
                    Xác minh tài khoản
                </a>

                <p style='margin-top:30px; font-size:12px; color:#999;'>
                    Nếu bạn không đăng ký, hãy bỏ qua email này.
                </p>

            </div>
        </div>
        ", function ($message) use ($data) {
            $message->to($data['email'])
                    ->subject('Xác minh đăng ký');
        });

        return response()->json([
            'message' => 'Vui lòng kiểm tra email để xác minh tài khoản'
        ]);
    }

    public function verifyRegister(Request $request)
    {
        $token = $request->token;

        $data = Cache::get('register_token_' . $token);

        if (!$data) {
            return response()->json([
                'message' => 'Link không hợp lệ hoặc đã hết hạn'
            ], 400);
        }

        // tạo username
        $baseUsername = Str::before($data['email'], '@');
        $username = $baseUsername;
        $count = 1;

        while (User::where('ten_tai_khoan', $username)->exists()) {
            $username = $baseUsername . $count;
            $count++;
        }

        // tạo user
        $user = User::create([
            'ho_ten' => $data['ho_ten'],
            'ten_tai_khoan' => $username,
            'email' => $data['email'],
            'mat_khau' => $data['password'],
            'trang_thai' => 'HOAT_DONG'
        ]);

        $user->roles()->attach(2);

        Cache::forget('register_token_' . $token);

        $tokenLogin = $user->createToken('auth_token')->plainTextToken;

        // redirect về FE luôn
        return response("
        <!DOCTYPE html>
        <html>
        <head>
            <title>Xác minh thành công</title>
        </head>
        <body style='font-family:sans-serif; text-align:center; padding:50px'>
            <h2>✅ Xác minh email thành công!</h2>
            <p>Bạn có thể quay lại trang đăng nhập để tiếp tục.</p>
        </body>
        </html>
        ");
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

    public function me(Request $request)
    {
        $user = $request->user()->load('roles');
        return response()->json([
            'user' => $request->user(),
            'roles' => $user->roles->pluck('ten_vai_tro'),
            'has_password' => $user->mat_khau ? true : false
        ]);
    }

    public function resendOtp(Request $request)
    {
        $email = $request->email;

        if (!Cache::has('register_' . $email)) {
            return response()->json(['message' => 'Không tìm thấy yêu cầu'], 400);
        }

        $otp = rand(100000, 999999);

        $data = Cache::get('register_' . $email);
        $data['otp'] = $otp;

        Cache::put('register_' . $email, $data, now()->addMinutes(5));

        Mail::raw("OTP mới của bạn là: $otp", function ($message) use ($email) {
            $message->to($email)->subject('Gửi lại OTP');
        });

        return response()->json(['message' => 'OTP đã được gửi lại']);
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $email = $request->email;

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email không tồn tại'
            ], 404);
        }

        // chống spam
        if (Cache::has('forgot_limit_' . $email)) {
            return response()->json([
                'message' => 'Vui lòng đợi trước khi gửi lại OTP'
            ], 429);
        }

        $otp = rand(100000, 999999);

        Cache::put('forgot_' . $email, $otp, now()->addMinutes(5));
        Cache::put('forgot_limit_' . $email, true, 60);

        Mail::raw("Mã OTP đặt lại mật khẩu là: $otp", function ($message) use ($email) {
            $message->to($email)->subject('Quên mật khẩu');
        });

        return response()->json([
            'message' => 'OTP đã được gửi về email'
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $email = $request->email;
        $otp = $request->otp;

        $savedOtp = Cache::get('forgot_' . $email);

        if (!$savedOtp || $savedOtp != $otp) {
            return response()->json([
                'message' => 'OTP không hợp lệ hoặc đã hết hạn'
            ], 400);
        }

        $user = User::where('email', $email)->first();

        $user->update([
            'mat_khau' => Hash::make($request->new_password)
        ]);

        Cache::forget('forgot_' . $email);

        return response()->json([
            'message' => 'Đặt lại mật khẩu thành công'
        ]);
    }
}