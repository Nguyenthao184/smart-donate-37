<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\UserProfileController;

Route::post('/register', [AuthController::class,'register']);
Route::post('/login', [AuthController::class,'login']);
Route::get('/auth/google', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);

Route::middleware('auth:sanctum')->group(function(){
    Route::post('/logout',[AuthController::class,'logout']);

    //ttcn
    Route::get('/user/profile',[UserProfileController::class,'getProfile']);
    Route::post('/user/profile',[UserProfileController::class,'updateProfile']);
    Route::post('/user/change-password',[UserProfileController::class,'changePassword']);
});