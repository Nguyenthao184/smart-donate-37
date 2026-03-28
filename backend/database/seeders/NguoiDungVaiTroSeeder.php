<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NguoiDungVaiTroSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('nguoi_dung_vai_tro')->upsert([

            // admin
            [
                'nguoi_dung_id' => 1,
                'vai_tro_id' => 1
            ],

            // user thường
            [
                'nguoi_dung_id' => 2,
                'vai_tro_id' => 2
            ],

            // user + tổ chức
            [
                'nguoi_dung_id' => 3,
                'vai_tro_id' => 2
            ],
            [
                'nguoi_dung_id' => 3,
                'vai_tro_id' => 3
            ]

        ], ['nguoi_dung_id', 'vai_tro_id'], ['vai_tro_id']);
    }
}
