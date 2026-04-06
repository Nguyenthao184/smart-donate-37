<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\FundAccountController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\DonateController;

use App\Http\Controllers\FraudController;

Route::post('/register', [AuthController::class,'register']);
Route::post('/login', [AuthController::class,'login']);
Route::get('/auth/google', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);

// Feed - guest có thể xem danh sách/chi tiết
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{id}', [PostController::class, 'show']);

// ds danh mục
Route::get('/categories', [CampaignController::class, 'getDanhMuc']);
Route::middleware('auth:sanctum')->group(function(){
    Route::post('/logout',[AuthController::class,'logout']);

    Route::middleware('role:ADMIN')->group(function(){
        // ADMIN duyệt tổ chức
        Route::post('/admin/organization/{id}/approve', [OrganizationController::class, 'approve']);
        Route::post('/admin/organization/{id}/reject', [OrganizationController::class, 'reject']);

        // ADMIN duyệt tài khoản gây quỹ
        Route::post('/fund-accounts/{id}/approve', [FundAccountController::class, 'approve']);
        Route::post('/fund-accounts/{id}/lock', [FundAccountController::class, 'lock']);

        // ADMIN duyệt chiến dịch
        Route::post('/campaigns/{id}/approve', [CampaignController::class, 'approveCampaign']);
        Route::post('/campaigns/{id}/reject', [CampaignController::class, 'rejectCampaign']);
        // ADMIN auto fraud check (tu tinh feature roi goi AI)
        Route::post('/admin/fraud-check/auto', [FraudController::class, 'autoCheck']);
        Route::get('/admin/fraud-alerts', [FraudController::class, 'getAlerts']);
        Route::post('/admin/fraud-alerts/{canhBao}', [FraudController::class, 'updateAlert']);
    });

    Route::middleware('role:NGUOI_DUNG')->group(function(){
        //ttcn
        Route::get('/user/profile',[UserProfileController::class,'getProfile']);
        Route::post('/user/profile',[UserProfileController::class,'updateProfile']);
        Route::post('/user/change-password',[UserProfileController::class,'changePassword']);

        //đăng ký tổ chức
        Route::post('/organization/register', [OrganizationController::class, 'register']);
        Route::get('/organization/status', [OrganizationController::class, 'status']);

        //ủng hộ
        Route::post('/donate', [DonateController::class, 'donate']);
        Route::post('/donate/confirm', [DonateController::class, 'confirmDonate']);
        Route::get('/donate/history', [DonateController::class, 'donateHistory']);
    });
    
    Route::middleware('role:TO_CHUC')->group(function(){
        //tài khoản gây quỹ       
        Route::post('/fund-accounts', [FundAccountController::class, 'store']);
        Route::get('/fund-accounts/me', [FundAccountController::class, 'me']);

        //chiến dịch
        Route::post('/campaigns', [CampaignController::class, 'store']);
        Route::get('/campaigns/me', [CampaignController::class, 'myCampaigns']);
        
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

//xem tổ chức
Route::get('/organization', [OrganizationController::class, 'index']);
Route::get('/organization/{id}', [OrganizationController::class, 'show']);

//xem chiến dịch
Route::get('/campaigns', [CampaignController::class, 'index']);
Route::get('/campaigns/featured', [CampaignController::class, 'featured']);
Route::get('/campaigns/{id}', [CampaignController::class, 'show']);