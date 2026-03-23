<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;

class BaiDangSeeder extends Seeder
{
    public function run(): void
    {
        // Lấy danh mục đã có (seeder DanhMucSeeder chạy trước)
        $danhMucs = DB::table('danh_muc')->get(['id', 'ten_danh_muc']);
        if ($danhMucs->isEmpty()) {
            // Tránh lỗi nếu bạn chưa seed danh mục
            DB::table('danh_muc')->insert([
                ['ten_danh_muc' => 'Ao quan tre em', 'created_at' => now(), 'updated_at' => now()],
                ['ten_danh_muc' => 'Thuc pham', 'created_at' => now(), 'updated_at' => now()],
                ['ten_danh_muc' => 'Sach giao khoa', 'created_at' => now(), 'updated_at' => now()],
            ]);
            $danhMucs = DB::table('danh_muc')->get(['id', 'ten_danh_muc']);
        }

        // Người dùng có sẵn theo seed hiện tại: id 1..3
        $nguoiDungIds = [2, 3];

        // Các cụm location (lat/lng) để test radius + haversine
        $locations = [
            // Da Nang (xung quanh)
            ['dia_diem' => 'Da Nang', 'lat' => 16.0544, 'lng' => 108.2022],
            ['dia_diem' => 'Da Nang', 'lat' => 16.0600, 'lng' => 108.2050],
            ['dia_diem' => 'Da Nang', 'lat' => 16.0520, 'lng' => 108.1980],
            ['dia_diem' => 'Da Nang', 'lat' => 16.0700, 'lng' => 108.2000],
            ['dia_diem' => 'Da Nang', 'lat' => 16.0544, 'lng' => 108.3000], // xa > 10km

            // Ha Noi
            ['dia_diem' => 'Ha Noi', 'lat' => 21.0278, 'lng' => 105.8342],
            ['dia_diem' => 'Ha Noi', 'lat' => 21.0360, 'lng' => 105.8000],

            // Ho Chi Minh
            ['dia_diem' => 'Ho Chi Minh', 'lat' => 10.8231, 'lng' => 106.6297],
            ['dia_diem' => 'Ho Chi Minh', 'lat' => 10.8500, 'lng' => 106.6200],
        ];

        // Tạo 40 bài để đủ dữ liệu matching
        $rows = [];
        $now = now();

        $count = 40;
        for ($i = 1; $i <= $count; $i++) {
            $loaiBai = ($i % 2 === 0) ? 'CHO' : 'NHAN';
            $trangThai = $loaiBai === 'CHO' ? 'CON_TANG' : 'CON_NHAN';

            $nguoiDungId = Arr::random($nguoiDungIds);
            $danhMuc = $danhMucs->random();
            $location = Arr::random($locations);

            // Created_at trải từ 0 đến 10 ngày trước để test time_score
            $daysAgo = ($i % 11); // 0..10
            $createdAt = $now->copy()->subDays($daysAgo)->subHours($i);

            // Tạo title/mo_ta có chủ đề rõ theo danh mục + địa điểm
            $tenChuDe = $danhMuc->ten_danh_muc;
            $diaDiem = $location['dia_diem'];

            $prefix = $loaiBai === 'CHO' ? 'CHO' : 'NHAN';
            $tieuDe = "{$prefix} - {$tenChuDe} - {$diaDiem} #{$i}";
            $moTa = "Can hoac nhan {$tenChuDe} tai {$diaDiem}. Chi tiet: bai {$i}.";

            $rows[] = [
                'nguoi_dung_id' => $nguoiDungId,
                'loai_bai' => $loaiBai,
                'danh_muc_id' => $danhMuc->id,
                'tieu_de' => $tieuDe,
                'mo_ta' => $moTa,
                'hinh_anh' => null,
                'dia_diem' => $diaDiem,
                'so_luong' => 5 + ($i % 10),
                'trang_thai' => $trangThai,
                'lat' => $location['lat'],
                'lng' => $location['lng'],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];
        }

        DB::table('bai_dang')->insert($rows);
    }
}

