<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BaiDang extends Model
{
    protected $table = 'bai_dang';

    protected $fillable = [
        'nguoi_dung_id',
        'loai_bai',
        'danh_muc_id',
        'tieu_de',
        'mo_ta',
        'hinh_anh',
        'dia_diem',
        'lat',
        'lng',
        'so_luong',
        'trang_thai',
    ];

    public function nguoiDung()
    {
        return $this->belongsTo(User::class, 'nguoi_dung_id');
    }

    public function danhMuc()
    {
        return $this->belongsTo(DanhMuc::class, 'danh_muc_id');
    }
}

