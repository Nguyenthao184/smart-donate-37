<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class XacMinhToChuc extends Model
{
    protected $table = 'xac_minh_to_chuc';

    protected $fillable = [
        'nguoi_dung_id',
        'ten_to_chuc',
        'ma_so_thue',
        'nguoi_dai_dien',
        'giay_phep',
        'trang_thai',
        'loai_hinh',
        'duyet_boi',
        'duyet_luc'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'nguoi_dung_id');
    }
}
