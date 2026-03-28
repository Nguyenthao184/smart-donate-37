<?php

namespace Database\Seeders;

use App\Services\GeocodingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;

class BaiDangSeeder extends Seeder
{
    public function run(): void
    {
        $geo = app(GeocodingService::class);
        $nguoiDungIds = [2, 3, 4, 5, 6];

        // 📍 Tâm điểm địa lý (region sẽ = makeRegion(lat,lng) giống PostController khi tạo bài thật)
        $locations = [
            // ===== ĐÀ NẴNG =====
            ['dia_diem' => 'Hai Chau', 'lat' => 16.0471, 'lng' => 108.2068],
            ['dia_diem' => 'Hai Chau - Nguyen Van Linh', 'lat' => 16.0545, 'lng' => 108.2022],

            ['dia_diem' => 'Son Tra', 'lat' => 16.0720, 'lng' => 108.2470],
            ['dia_diem' => 'Son Tra - Vo Nguyen Giap', 'lat' => 16.0800, 'lng' => 108.2500],

            ['dia_diem' => 'Ngu Hanh Son', 'lat' => 16.0000, 'lng' => 108.2700],
            ['dia_diem' => 'Ngu Hanh Son - Le Van Hien', 'lat' => 15.9900, 'lng' => 108.2600],

            ['dia_diem' => 'Lien Chieu', 'lat' => 16.1200, 'lng' => 108.1300],
            ['dia_diem' => 'Lien Chieu - Nguyen Tat Thanh', 'lat' => 16.1100, 'lng' => 108.1500],

            ['dia_diem' => 'Cam Le', 'lat' => 16.0200, 'lng' => 108.2000],
            ['dia_diem' => 'Thanh Khe', 'lat' => 16.0600, 'lng' => 108.1900],

            // ===== HÀ NỘI =====
            ['dia_diem' => 'Ha Noi', 'lat' => 21.0278, 'lng' => 105.8342],
            ['dia_diem' => 'Ha Noi - Cau Giay', 'lat' => 21.0360, 'lng' => 105.8000],

            // ===== HCM =====
            ['dia_diem' => 'Ho Chi Minh', 'lat' => 10.8231, 'lng' => 106.6297],
            ['dia_diem' => 'Ho Chi Minh - Thu Duc', 'lat' => 10.8500, 'lng' => 106.6200],
        ];

        // 🎯 Hàm random lệch vị trí (~500m - 1km)
        function randomizeLatLng($lat, $lng) {
            return [
                'lat' => $lat + (mt_rand(-100, 100) / 10000),
                'lng' => $lng + (mt_rand(-100, 100) / 10000),
            ];
        }

        $rows = [];
        $now = now();

        $count = 40;

        for ($i = 1; $i <= $count; $i++) {

            $loaiBai = ($i % 2 === 0) ? 'CHO' : 'NHAN';
            $trangThai = $loaiBai === 'CHO' ? 'CON_TANG' : 'CON_NHAN';

            $nguoiDungId = Arr::random($nguoiDungIds);
            $location = Arr::random($locations);

            $randomLatLng = randomizeLatLng($location['lat'], $location['lng']);

            // ⏱ thời gian random
            $daysAgo = ($i % 11);
            $createdAt = $now->copy()->subDays($daysAgo)->subHours($i);

            // 🧠 nội dung
            $chuDes = ['Xe may', 'Quan ao', 'Sach vo', 'Do gia dung', 'Thuc pham', 'Do hoc tap'];
            $tenChuDe = Arr::random($chuDes);
            $diaDiem = $location['dia_diem'];

            $prefix = $loaiBai === 'CHO' ? 'CHO' : 'NHAN';
            $tieuDe = "{$prefix} - {$tenChuDe} - {$diaDiem} #{$i}";
            $moTa = "Can hoac nhan {$tenChuDe} tai {$diaDiem}. Chi tiet: bai {$i}.";

            $rows[] = [
                'nguoi_dung_id' => $nguoiDungId,
                'loai_bai' => $loaiBai,
                'tieu_de' => $tieuDe,
                'mo_ta' => $moTa,
                'hinh_anh' => null,
                'dia_diem' => $diaDiem,
                'region' => $geo->makeRegion((float) $randomLatLng['lat'], (float) $randomLatLng['lng']),
                'so_luong' => 5 + ($i % 10),
                'trang_thai' => $trangThai,
                'lat' => $randomLatLng['lat'], // ✅ random
                'lng' => $randomLatLng['lng'],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];
        }

        DB::table('bai_dang')->insert($rows);
    }
}