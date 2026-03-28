<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class NguoiDungSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('nguoi_dung')->upsert([
           // ===== ADMIN =====
           [
            'id' => 1,
            'ho_ten' => 'Admin',
            'ten_tai_khoan' => 'admin',
            'email' => 'admin@gmail.com',
            'mat_khau' => Hash::make('123456'),
            'anh_dai_dien' => null,
            'trang_thai' => 'HOAT_DONG'
        ],
        [
            'id' => 2,
            'ho_ten' => 'Nguyễn Văn A',
            'ten_tai_khoan' => 'nguyenvana',
            'email' => 'user@gmail.com',
            'mat_khau' => Hash::make('123456'),
            'anh_dai_dien' => null,
            'trang_thai' => 'HOAT_DONG'
        ],
        [
            'id' => 3,
            'ho_ten' => 'Tổ Chức A',
            'ten_tai_khoan' => 'tochuc',
            'email' => 'tochuc@gmail.com',
            'mat_khau' => Hash::make('123456'),
            'anh_dai_dien' => null,
            'trang_thai' => 'HOAT_DONG'
        ],
    
        [
            'id' => 4,
            'ho_ten' => 'Lê Văn C',
            'ten_tai_khoan' => 'levanc',
            'email' => 'c@gmail.com',
            'mat_khau' => Hash::make('123456'),
            'anh_dai_dien' => null,
            'trang_thai' => 'HOAT_DONG'
        ],

        [
            'id' => 5,
            'ho_ten' => 'Phạm Văn D',
            'ten_tai_khoan' => 'phamvand',
            'email' => 'd@gmail.com',
            'mat_khau' => Hash::make('123456'),
            'anh_dai_dien' => null,
            'trang_thai' => 'HOAT_DONG'
        ],
        [
            'id' => 6,
            'ho_ten' => 'Nguyễn Thị E',
            'ten_tai_khoan' => 'nguyenthie',
            'email' => 'e@gmail.com',
            'mat_khau' => Hash::make('123456'),
            'anh_dai_dien' => null,
            'trang_thai' => 'HOAT_DONG'
        ],

    
        ], ['id'], [
            'ho_ten',
            'ten_tai_khoan',
            'email',
            'mat_khau',
            'anh_dai_dien',
            'trang_thai'
        ]);
    }
}
