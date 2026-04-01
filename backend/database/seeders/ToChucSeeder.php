<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ToChucSeeder extends Seeder
{
    public function run(): void
    {
        $xacMinh = DB::table('xac_minh_to_chuc')
            ->where('trang_thai','CHAP_NHAN')
            ->where('nguoi_dung_id', '!=', 1) 
            ->get();

        foreach ($xacMinh as $item) {

            DB::table('to_chuc')->insert([
                'nguoi_dung_id' => $item->nguoi_dung_id,
                'xac_minh_to_chuc_id' => $item->id,
                'ten_to_chuc' => $item->ten_to_chuc,
                'mo_ta' => 'Tổ chức hoạt động vì cộng đồng tại Việt Nam',
                'dia_chi' => collect(['Đà Nẵng','Hà Nội','TP.HCM'])->random(),
                'so_dien_thoai' => '0' . rand(300000000,999999999),
                'email' => 'org'.$item->nguoi_dung_id.'@gmail.com',
                'logo' => 'logo.png',
                'trang_thai' => 'HOAT_DONG',
                'diem_uy_tin' => rand(70,100),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}