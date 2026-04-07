<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TroChuyenController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-chat/{cuoc_tro_chuyen}', function ($id) {
    return view('test-chat', ['cuoc_tro_chuyen_id' => $id]);
});