<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaiKhoanGayQuy extends Model
{
    protected $table = 'tai_khoan_gay_quy';

    protected $fillable = [
        'nguoi_dung_id',
        'ten_quy',
        'ngan_hang',
        'so_tai_khoan',
        'chu_tai_khoan',
        'so_du',
        'qr_code',
        'trang_thai',
        'ma_yeu_cau_mb'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'nguoi_dung_id');
    }
}
