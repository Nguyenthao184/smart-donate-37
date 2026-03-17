<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\VaiTroSeeder; 
use Database\Seeders\NguoiDungSeeder; 
use Database\Seeders\NguoiDungVaiTroSeeder;

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
            NguoiDungVaiTroSeeder::class
        ]);
    }
}
