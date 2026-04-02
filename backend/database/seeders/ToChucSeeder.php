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

        $logoMap = [
            'Thiên tai' => 'logo_thientai.png',
            'Trẻ em' => 'logo_treem.png',
            'Giáo dục' => 'logo_giaoduc.png',
            'Môi trường' => 'logo_moitruong.png',
            'Xóa đói' => 'logo_xoadoi.png',
            'An sinh' => 'logo_ansinh.png',
        ];

        $orgCategoryMap = [
            'Trung Tâm Hỗ Trợ Cứu Trợ Thiên Tai Việt' => 'Thiên tai',
            'Chung Tay Xóa Đói Giảm Nghèo' => 'Xóa đói',
            'An Sinh Cộng Đồng Việt Nam' => 'An sinh',
            'Bảo Vệ và Phát Triển Trẻ Em Việt' => 'Trẻ em',
            'Liên Minh Hành Động Vì Môi Trường Xanh' => 'Môi trường',
            'Hỗ Trợ Giáo Dục và Tri Thức Trẻ' => 'Giáo dục',
        ];

        foreach ($xacMinh as $item) {
            $categoryName = $orgCategoryMap[$item->ten_to_chuc] ?? null;
            if (!$categoryName) continue;
            $logoFile = $logoMap[$categoryName] ?? 'default.png';

            DB::table('to_chuc')->insert([
                'nguoi_dung_id' => $item->nguoi_dung_id,
                'xac_minh_to_chuc_id' => $item->id,
                'ten_to_chuc' => $item->ten_to_chuc,
                'mo_ta' => 'Tổ chức hoạt động vì cộng đồng tại Việt Nam',
                'dia_chi' => collect(['Đà Nẵng','Hà Nội','TP.HCM'])->random(),
                'so_dien_thoai' => '0' . rand(300000000,999999999),
                'email' => 'org'.$item->nguoi_dung_id.'@gmail.com',
                'logo' => 'logos/' . $logoFile,
                'trang_thai' => 'HOAT_DONG',
                'diem_uy_tin' => rand(70,100),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}