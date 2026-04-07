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
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\TroChuyenController;

Route::post('/register', [AuthController::class,'register']);
Route::post('/login', [AuthController::class,'login']);
Route::get('/auth/google', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);

// Feed - guest có thể xem danh sách/chi tiết
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{id}', [PostController::class, 'show'])->whereNumber('id');

// ds danh mục
Route::get('/categories', [CampaignController::class, 'getDanhMuc']);

Route::middleware('auth:sanctum')->group(function(){
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout',[AuthController::class,'logout']);

    Route::middleware('role:ADMIN')->group(function(){
        Route::prefix('/admin')->group(function () {
            // ADMIN - nguoi dung
            Route::get('/users', [AdminUserController::class, 'index']);
            Route::post('/users/{id}/lock', [AdminUserController::class, 'lock']);
            Route::post('/users/{id}/unlock', [AdminUserController::class, 'unlock']);

            // ADMIN - dashboard
            Route::get('/dashboard/summary', [AdminDashboardController::class, 'summary']);
            Route::get('/dashboard/fundraising-by-month', [AdminDashboardController::class, 'fundraisingByMonth']);
            Route::get('/dashboard/recent-activities', [AdminDashboardController::class, 'recentActivities']);
            Route::get('/dashboard/featured-campaigns', [AdminDashboardController::class, 'featuredCampaigns']);

            // ADMIN - danh sach / chi tiet
            Route::get('/organizations', [OrganizationController::class, 'index']);
            Route::get('/organizations/{id}', [OrganizationController::class, 'show']);
            Route::get('/campaigns', [CampaignController::class, 'index']);
            Route::get('/campaigns/{id}', [CampaignController::class, 'show']);
            Route::get('/posts', [PostController::class, 'index']);
            Route::get('/posts/{id}', [PostController::class, 'show']);

            // ADMIN - duyet to chuc
            Route::post('/organization/{id}/approve', [OrganizationController::class, 'approve']);
            Route::post('/organization/{id}/reject', [OrganizationController::class, 'reject']);

            // ADMIN - duyet tai khoan gay quy
            Route::post('/fund-accounts/{id}/approve', [FundAccountController::class, 'approve']);
            Route::post('/fund-accounts/{id}/lock', [FundAccountController::class, 'lock']);

            // ADMIN - duyet chien dich
            Route::post('/campaigns/{id}/approve', [CampaignController::class, 'approveCampaign']);
            Route::post('/campaigns/{id}/reject', [CampaignController::class, 'rejectCampaign']);

            // ADMIN - fraud
            Route::post('/fraud-check/auto', [FraudController::class, 'autoCheck']);
            Route::post('/fraud-check/campaigns/auto', [FraudController::class, 'autoCheckCampaigns']);
            Route::get('/fraud-alerts', [FraudController::class, 'getAlerts']);
            Route::post('/fraud-alerts/{canhBao}', [FraudController::class, 'updateAlert']);
        });

       
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
        Route::get('/posts/me', [PostController::class, 'me']);
        Route::put('/posts/{id}', [PostController::class, 'update'])->whereNumber('id');
        Route::delete('/posts/{id}', [PostController::class, 'destroy'])->whereNumber('id');

        // AI matching
        Route::get('/posts/{id}/matches', [PostController::class, 'matches'])->whereNumber('id');
        Route::prefix('/tro-chuyen')->group(function () {
            Route::post('/tao-hoac-lay', [TroChuyenController::class, 'taoHoacLay']);
            Route::get('/', [TroChuyenController::class, 'danhSach']);
            Route::get('/{id}/tin-nhan', [TroChuyenController::class, 'layTinNhan']);
            Route::post('/{id}/tin-nhan', [TroChuyenController::class, 'guiTinNhan']);
            Route::post('/{id}/da-xem', [TroChuyenController::class, 'danhDauDaXem']);
        });
       
       
    });
});


//xem tổ chức
Route::get('/organization', [OrganizationController::class, 'index']);
Route::get('/organization/{id}', [OrganizationController::class, 'show']);

//xem chiến dịch
Route::get('/campaigns', [CampaignController::class, 'index']);
Route::get('/campaigns/featured', [CampaignController::class, 'featured']);
Route::get('/campaigns/{id}', [CampaignController::class, 'show']);

Route::get('/vnpay/return', [DonateController::class, 'vnpayReturn']);