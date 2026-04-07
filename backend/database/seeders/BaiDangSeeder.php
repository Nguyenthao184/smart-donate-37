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

        // Ảnh mẫu cho bài CHO (đặt file tương ứng trong: storage/app/public/posts/)
        // Lưu trong DB theo path tương đối (không có "storage/"), để FE build URL: /storage/{path}
        $imageMap = [
            // Quần áo
            'Quan ao' => [
                'posts/quan_ao_cho.jpg',
                'posts/quan_ao_cho.png',
                'posts/quan_ao_cho.jpeg',
            ],
            'Quan ao mua dong' => [
                'posts/quan_ao_mua_dong_cho.png',
                'posts/quan_ao_mua_dong_1_cho.png',
                'posts/quan_ao_mua_dong_cho.jpg',
                // một số file bạn có thể đặt tên không có "_cho"
                'posts/quan_ao_mua_dong_2.jpg',
                'posts/quan_ao_mua_dong_2.png',
            ],
            'Quan ao mua he' => [
                'posts/quan_ao_mua_he_1_cho.jpg',
                'posts/quan_ao_mua_he_2_cho.png',
                'posts/quan_ao_mua_he_1_cho.png',
                'posts/ao_mua_he_1_cho.jpg',
                'posts/ao_mua_he_1_cho.png',
                'posts/ao_mua_he_2_cho.png',
            ],
            'Ao mua' => [
                'posts/ao_mua_he_1_cho.jpg',
                'posts/ao_mua_he_1_cho.png',
                'posts/ao_mua_he_2_cho.png',
                'posts/quan_ao_mua_dong_cho.png',
                'posts/quan_ao_mua_dong_1_cho.png',
            ],

            // Thực phẩm
            'Gao' => ['posts/gao_cho.jpg', 'posts/gao_1_cho.jpg', 'posts/gao_2_cho.jpg'],
            'Mi tom' => ['posts/mi_tom_1_cho.jpg'],
            'Gao + Mi' => ['posts/gao_mi_cho.jpg', 'posts/gao_cho.jpg', 'posts/mi_tom_1_cho.jpg'],
            'Rau cu' => ['posts/rau_cho.jpg'],
            'Sua' => ['posts/sua_cho.jpg'],
            'Nhu yeu pham' => ['posts/nhu_yeu_pham_cho.jpg'],
            'Thuc pham' => [
                'posts/thuc_pham_1_cho.jpg',
                'posts/thuc_pham_2_cho.webp',
                'posts/gao_cho.jpg',
                'posts/mi_tom_1_cho.jpg',
                'posts/rau_cho.jpg',
                'posts/sua_cho.jpg',
                'posts/gao_mi_cho.jpg',
            ],

            // Học tập
            'Sach but' => ['posts/sach_but_cho.png', 'posts/vo_but_chi_cho.jpg', 'posts/but_cho.jpg'],
            'Cap hoc sinh' => ['posts/cap_hoc_sinh_cho.png'],

            // Đồ gia dụng
            'Do gia dung' => [
                'posts/do_gia_dung_1_cho.jpg',
                'posts/do_gia_dung_2_cho.jpg',
                'posts/do_gia_dung_3_cho.jpg',
                'posts/do_gia_dung_4_cho.jpg',
            ],
            'Noi com' => ['posts/noi_com_cho.jpg'],

            // Xe
            'Xe may' => ['posts/xe_may_1_cho.jpg', 'posts/xe_may_2_cho.jpg'],
            'Xe dap' => ['posts/xe_dap_1_cho.png', 'posts/xe_dap_2_cho.png'],
        ];

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
            $chuDes = [
                'Quan ao',
                'Quan ao mua dong',
                'Quan ao mua he',
                'Ao mua',
                'Gao',
                'Mi tom',
                'Gao + Mi',
                'Rau cu',
                'Sua',
                'Nhu yeu pham',
                'Thuc pham',
                'Sach but',
                'Cap hoc sinh',
                'Do gia dung',
                'Noi com',
                'Xe may',
                'Xe dap',
            ];
            $tenChuDe = Arr::random($chuDes);
            $diaDiem = $location['dia_diem'];

            $prefix = $loaiBai === 'CHO' ? 'CHO' : 'NHAN';
            $tieuDe = "{$prefix} - {$tenChuDe} - {$diaDiem} #{$i}";
            // Mô tả dài hơn (NHẬN: 3–6 câu, CHO: dài và "hay" hơn)
            if ($loaiBai === 'NHAN') {
                $sentences = [
                    "Mình đang cần xin {$tenChuDe} tại khu vực {$diaDiem} để hỗ trợ cho gia đình/nhóm người gặp khó khăn.",
                    "Nếu là quần áo/đồ dùng học tập, ưu tiên còn sử dụng tốt, sạch sẽ và phù hợp nhu cầu thực tế.",
                    "Nếu bạn có thể hỗ trợ, cho mình xin lịch hẹn nhận trong vài ngày tới để sắp xếp thời gian.",
                    "Mình có thể chủ động đến gần khu vực {$diaDiem} để nhận cho tiện.",
                    "Xin cảm ơn bạn rất nhiều vì đã lan tỏa sự sẻ chia.",
                    "Bài số {$i}: mình sẽ cập nhật trạng thái ngay khi đã nhận đủ.",
                ];
                shuffle($sentences);
                $take = rand(3, 6);
                $moTa = implode(' ', array_slice($sentences, 0, $take));
            } else {
                $sentences = [
                    "Mình muốn tặng lại {$tenChuDe} tại {$diaDiem} để những món đồ còn tốt được tiếp tục có ích.",
                    "Đồ đã được kiểm tra và vệ sinh cơ bản; với thực phẩm (gạo/mì) đều còn hạn dùng và đóng gói gọn gàng.",
                    "Ưu tiên người thật sự cần hoặc các bạn sinh viên/hoàn cảnh khó khăn.",
                    "Bạn có thể nhắn mình thời gian thuận tiện (sáng/chiều/tối) để mình sắp xếp trao tận tay.",
                    "Nếu ở gần {$diaDiem}, mình có thể linh động điểm hẹn để hai bên thuận tiện di chuyển.",
                    "Mong món quà nhỏ này giúp bạn đỡ được một phần chi phí và có thêm động lực.",
                    "Bài số {$i}: nếu đã tặng xong mình sẽ cập nhật trạng thái ngay.",
                    "Gợi ý: nếu bạn cần thêm nhiều loại đồ, cứ nhắn mình để mình xem còn gì phù hợp.",
                ];
                // CHO: dài hơn NHAN một chút
                shuffle($sentences);
                $take = rand(5, 7);
                $moTa = implode(' ', array_slice($sentences, 0, $take));
            }

            $hinhAnhArr = null;
            if ($loaiBai === 'CHO') {
                $imgs = $imageMap[$tenChuDe] ?? null;
                if (is_array($imgs) && $imgs !== []) {
                    shuffle($imgs);
                    // mỗi bài CHO lấy 1–3 ảnh
                    $takeImg = min(count($imgs), rand(1, 3));
                    $hinhAnhArr = array_slice($imgs, 0, $takeImg);
                }
            }

            $rows[] = [
                'nguoi_dung_id' => $nguoiDungId,
                'loai_bai' => $loaiBai,
                'tieu_de' => $tieuDe,
                'mo_ta' => $moTa,
                'hinh_anh' => is_array($hinhAnhArr) ? json_encode($hinhAnhArr, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : null,
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