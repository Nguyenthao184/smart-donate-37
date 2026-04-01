<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class NguoiDungSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'ho_ten' => 'Admin',
            'ten_tai_khoan' => 'admin',
            'email' => 'admin@gmail.com',
            'mat_khau' => bcrypt('123456'),
            'trang_thai' => 'HOAT_DONG'
        ]);

        // User thường
        User::create([
            'ho_ten' => 'Nguyễn Văn Anh',
            'ten_tai_khoan' => 'user',
            'email' => 'user@gmail.com',
            'mat_khau' => bcrypt('123456'),
            'trang_thai' => 'HOAT_DONG'
        ]);

        // tổ chức
        User::create([
            'ho_ten' => 'Tổ chức từ thiện',
            'ten_tai_khoan' => 'tochuc',
            'email' => 'tochuc@gmail.com',
            'mat_khau' => bcrypt('123456'),
            'trang_thai' => 'HOAT_DONG'
        ]);

        //random users
        User::factory()->count(30)->create();
    }
}