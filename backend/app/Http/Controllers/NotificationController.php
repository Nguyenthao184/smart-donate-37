<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
{
    $user = auth()->user();

    $notifications = $user->notifications()
        ->latest()
        ->limit(20)
        ->get();

    return response()->json([
        'data' => $notifications,
        'unread_count' => $user->unreadNotifications()->count(),
    ]);
}
}
