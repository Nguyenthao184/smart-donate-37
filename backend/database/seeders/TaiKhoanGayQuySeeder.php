<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaiKhoanGayQuySeeder extends Seeder
{
    public function run(): void
    {
        $orgs = DB::table('to_chuc')
            ->where('nguoi_dung_id', '!=', 1) 
            ->get();

        foreach ($orgs as $org) {

            $status = $org->trang_thai == 'KHOA'
                ? 'KHOA'
                : (rand(0,10)>2 ? 'HOAT_DONG':'CHO_DUYET');

            DB::table('tai_khoan_gay_quy')->insert([
                'to_chuc_id' => $org->id,
                'ten_quy' => "Quỹ {$org->ten_to_chuc}",
                'ngan_hang' => "MB Bank",
                'so_tai_khoan' => rand(1000000000,9999999999),
                'chu_tai_khoan' => strtoupper($org->ten_to_chuc),
                'so_du' => rand(100000,10000000),
                'qr_code' => 'qr.png',
                'trang_thai' => 'HOAT_DONG',
                'ma_yeu_cau_mb' => 'MB_'.rand(1000,9999),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}