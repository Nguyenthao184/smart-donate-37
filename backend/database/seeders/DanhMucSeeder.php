<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DanhMucSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('danh_muc')->insert([
            [
                'ten_danh_muc' => 'Ao quan tre em',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_danh_muc' => 'Thuc pham',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_danh_muc' => 'Sach giao khoa',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

