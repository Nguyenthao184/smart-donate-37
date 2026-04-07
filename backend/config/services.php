<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    // 'vnpay' => [
    //     // trim: copy/paste từ cổng VNPay dễ dính khoảng trắng/đầu dòng → sai chữ ký
    //     'tmn_code' => trim((string) env('VNP_TMNCODE')),
    //     'hash_secret' => trim((string) env('VNP_HASH_SECRET')),
    //     'url' => env('VNP_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
    //     'return_url' => trim((string) env('VNP_RETURN_URL', '')),
    // ],

    'vnpay' => [
        'tmn_code'    => env('VNP_TMNCODE'),
        'hash_secret' => env('VNP_HASH_SECRET'),
        'url'         => env('VNP_URL'),
        'return_url'  => env('VNP_RETURN_URL'),
    ],
];
