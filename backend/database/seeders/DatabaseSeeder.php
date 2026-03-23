<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\VaiTroSeeder; 
use Database\Seeders\NguoiDungSeeder; 
use Database\Seeders\NguoiDungVaiTroSeeder;
use Database\Seeders\DanhMucSeeder;
use Database\Seeders\BaiDangSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            VaiTroSeeder::class,
            NguoiDungSeeder::class,
            NguoiDungVaiTroSeeder::class,
            DanhMucSeeder::class,
            BaiDangSeeder::class,
        ]);
    }
}
