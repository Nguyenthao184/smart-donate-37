<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\FundAccountController;
use App\Http\Controllers\PostController;

Route::post('/register', [AuthController::class,'register']);
Route::post('/login', [AuthController::class,'login']);
Route::get('/auth/google', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);

// Feed - guest có thể xem danh sách/chi tiết
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{id}', [PostController::class, 'show']);

Route::middleware('auth:sanctum')->group(function(){
    Route::post('/logout',[AuthController::class,'logout']);

    Route::middleware('role:ADMIN')->group(function(){
        // ADMIN duyệt tổ chức
        Route::post('/admin/organization/{id}/approve', [OrganizationController::class, 'approve']);
        Route::post('/admin/organization/{id}/reject', [OrganizationController::class, 'reject']);

        // ADMIN duyệt tài khoản gây quỹ
        Route::post('/fund-accounts/{id}/approve', [FundAccountController::class, 'approve']);
        Route::post('/fund-accounts/{id}/lock', [FundAccountController::class, 'lock']);
    });

    Route::middleware('role:NGUOI_DUNG')->group(function(){
        //ttcn
        Route::get('/user/profile',[UserProfileController::class,'getProfile']);
        Route::post('/user/profile',[UserProfileController::class,'updateProfile']);
        Route::post('/user/change-password',[UserProfileController::class,'changePassword']);

        //đăng ký tổ chức
        Route::post('/organization/register', [OrganizationController::class, 'register']);
        Route::get('/organization/status', [OrganizationController::class, 'status']);
    });
    
    Route::middleware('role:TO_CHUC')->group(function(){
        //tài khoản gây quỹ       
        Route::post('/fund-accounts', [FundAccountController::class, 'store']);
        Route::get('/fund-accounts/me', [FundAccountController::class, 'me']);
   });

    // Feed - user và tổ chức: đăng/cập nhật/xóa 
    Route::middleware('role:NGUOI_DUNG,TO_CHUC')->group(function () {
        // CRUD posts
        Route::post('/posts', [PostController::class, 'store']);
        Route::put('/posts/{id}', [PostController::class, 'update']);
        Route::delete('/posts/{id}', [PostController::class, 'destroy']);

        // AI matching
        Route::get('/posts/{id}/matches', [PostController::class, 'matches']);
       
    });
});