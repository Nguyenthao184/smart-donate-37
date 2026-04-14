<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class NguoiDungSeeder extends Seeder
{
    public function run(): void
    {
        DB::disableQueryLog();
        $password = bcrypt('123456');
        $now = now();

        // Admin
        User::create([
            'ho_ten' => 'Admin',
            'ten_tai_khoan' => 'admin',
            'email' => 'admin@gmail.com',
            'mat_khau' => $password,
            'trang_thai' => 'HOAT_DONG'
        ]);

        // User thường
        User::create([
            'ho_ten' => 'Nguyễn Văn Anh',
            'ten_tai_khoan' => 'user',
            'email' => 'user@gmail.com',
            'mat_khau' => $password,
            'trang_thai' => 'HOAT_DONG'
        ]);

        // tổ chức
        User::create([
            'ho_ten' => 'Tổ chức từ thiện',
            'ten_tai_khoan' => 'tochuc',
            'email' => 'tochuc@gmail.com',
            'mat_khau' => $password,
            'trang_thai' => 'HOAT_DONG'
        ]);

        // tạo data bằng factory (KHÔNG insert)
        $users = User::factory()
            ->count(30)
            ->make()
            ->toArray();

        // chỉnh lại field
        foreach ($users as &$user) {
            $user['mat_khau'] = $password;
            $user['trang_thai'] = 'HOAT_DONG';
            $user['created_at'] = $now;
            $user['updated_at'] = $now;
        }

        // chunk insert giống seeder trước
        collect($users)->chunk(500)->each(function ($chunk) {
            DB::table('nguoi_dung')->insert($chunk->toArray());
        });
    }
}