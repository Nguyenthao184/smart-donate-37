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
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

DB::table('bao_cao_bai_dang')->truncate();
DB::table('thich_bai_dang')->truncate();
DB::table('binh_luan_bai_dang')->truncate();
DB::table('bai_dang')->truncate();

DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        // $geo = app(GeocodingService::class);
        $nguoiDungIds = [2, 3, 4, 5, 6];

        // 📍 Tâm điểm địa lý (region sẽ = makeRegion(lat,lng) giống PostController khi tạo bài thật)
        $locations = [
            // ===== ĐÀ NẴNG =====
            ['dia_diem' => 'Hải Châu', 'lat' => 16.0471, 'lng' => 108.2068],
            ['dia_diem' => 'Hải Châu - Nguyễn Văn Linh', 'lat' => 16.0545, 'lng' => 108.2022],

            ['dia_diem' => 'Sơn Trà', 'lat' => 16.0720, 'lng' => 108.2470],
            ['dia_diem' => 'Sơn Trà - Võ Nguyên Giáp', 'lat' => 16.0800, 'lng' => 108.2500],

            ['dia_diem' => 'Ngũ Hành Sơn', 'lat' => 16.0000, 'lng' => 108.2700],
            ['dia_diem' => 'Ngũ Hành Sơn - Le Van Hien', 'lat' => 15.9900, 'lng' => 108.2600],

            ['dia_diem' => 'Liên Chiểu', 'lat' => 16.1200, 'lng' => 108.1300],
            ['dia_diem' => 'Liên Chiểu - Nguyễn Tất Thành', 'lat' => 16.1100, 'lng' => 108.1500],

            ['dia_diem' => 'Cẩm Lệ', 'lat' => 16.0200, 'lng' => 108.2000],
            ['dia_diem' => 'Thanh Khê', 'lat' => 16.0600, 'lng' => 108.1900],

            // ===== HÀ NỘI =====
            ['dia_diem' => 'Hà Nội', 'lat' => 21.0278, 'lng' => 105.8342],
            ['dia_diem' => 'Hà Nội - Cầu Giấy', 'lat' => 21.0360, 'lng' => 105.8000],

            // ===== HCM =====
            ['dia_diem' => 'Hồ Chí Minh', 'lat' => 10.8231, 'lng' => 106.6297],
            ['dia_diem' => 'Hồ Chí Minh - Thủ Đức', 'lat' => 10.8500, 'lng' => 106.6200],
        ];

        // 🎯 Hàm random lệch vị trí (~500m - 1km)
        function randomizeLatLng($lat, $lng) {
            return [
                'lat' => $lat + (mt_rand(-100, 100) / 10000),
                'lng' => $lng + (mt_rand(-100, 100) / 10000),
            ];
        }
        function fakeRegion($lat, $lng) {
            return round($lat, 2) . '_' . round($lng, 2);
        }
        $rows = [];
        $now = now();

        $count = 1000;

        // Ảnh mẫu cho bài CHO (đặt file tương ứng trong: storage/app/public/posts/)
        // Lưu trong DB theo path tương đối (không có "storage/"), để FE build URL: /storage/{path}
        $imageMap = [
            // Quần áo
            'Quần áo' => [
                'posts/quan_ao_cho.jpg',
                'posts/quan_ao_cho.png',
                'posts/quan_ao_cho.jpeg',
            ],
            'Quần áo mùa đông' => [
                'posts/quan_ao_mua_dong_cho.png',
                'posts/quan_ao_mua_dong_1_cho.png',
                'posts/quan_ao_mua_dong_cho.jpg',
                // một số file bạn có thể đặt tên không có "_cho"
                'posts/quan_ao_mua_dong_2.jpg',
                'posts/quan_ao_mua_dong_2.png',
            ],
            'Quần áo mùa hè' => [
                'posts/quan_ao_mua_he_1_cho.jpg',
                'posts/quan_ao_mua_he_2_cho.png',
                'posts/quan_ao_mua_he_1_cho.png',
                'posts/ao_mua_he_1_cho.jpg',
                'posts/ao_mua_he_1_cho.png',
                'posts/ao_mua_he_2_cho.png',
            ],
           

            // Thực phẩm
            'Gạo' => ['posts/gao_cho.jpg', 'posts/gao_1_cho.jpg', 'posts/gao_2_cho.jpg','posts/gao_3_cho.jpg'],
            'Mì tôm' => ['posts/mi_tom_1_cho.jpg'],
            'Gạo + Mì' => ['posts/gao_mi_cho.jpg', 'posts/gao_cho.jpg', 'posts/mi_tom_1_cho.jpg'],
            'Rau củ' => ['posts/rau_cho.jpg'],
            'Sữa' => ['posts/sua_cho.jpg'],
            'Nhu yếu phẩm' => ['posts/nhu_yeu_pham_cho.jpg'],
            'Thực phẩm' => [
                'posts/thuc_pham_1_cho.jpg',
                'posts/thuc_pham_2_cho.webp',
                'posts/gao_cho.jpg',
                'posts/mi_tom_1_cho.jpg',
                'posts/rau_cho.jpg',
                'posts/sua_cho.jpg',
                'posts/gao_mi_cho.jpg',
            ],

            // Học tập
            'Sách bút' => ['posts/sach_but_cho.png', 'posts/vo_but_chi_cho.jpg', 'posts/but_cho.jpg'],
            'Cặp học sinh' => ['posts/cap_hoc_sinh_cho.png'],

            // Đồ gia dụng
            'Đồ gia dụng' => [
                'posts/do_gia_dung_1_cho.jpg',
                'posts/do_gia_dung_2_cho.jpg',
                'posts/do_gia_dung_3_cho.jpg',
                'posts/do_gia_dung_4_cho.jpg',
            ],
            'Nồi cơm' => ['posts/noi_com_cho.jpg'],

            // Xe
            'Xe máy' => ['posts/xe_may_1_cho.jpg', 'posts/xe_may_2_cho.jpg'],
            'Xe đạp' => ['posts/xe_dap_1_cho.png', 'posts/xe_dap_2_cho.png'],
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
                'Quần áo',
                'Quần áo mùa đông',
                'Quần áo mùa hè',
                'Gạo',
                'Mì tôm',
                'Gạo + Mì',
                'Rau củ',
                'Sữa',
                'Nhu yếu phẩm',
                'Thực phẩm',
                'Sách bút',
                'Cặp học sinh',
                'Đồ gia dụng',
                'Nồi cơm',
                'Xe máy',
                'Xe đạp',
            ];
            $tenChuDe = Arr::random($chuDes);
            $diaDiem = $location['dia_diem'];

       
            $prefix = $loaiBai === 'CHO' ? 'CHO' : 'NHAN';
            $tieuDe = "{$prefix} - {$tenChuDe} - {$diaDiem} #{$i}";
            // Mô tả dài hơn (NHẬN: 3–6 câu, CHO: dài và "hay" hơn)
            if ($loaiBai === 'NHAN') {
                $sentences = [
                   "Mình đang cần {$tenChuDe} tại khu vực {$diaDiem}.", 
                    "Đây là nhu cầu chính hiện tại, không cần các loại khác.", 
                    "Nếu bạn có thể hỗ trợ {$tenChuDe}, mình rất biết ơn.",
                    "Mình có thể chủ động đến gần khu vực {$diaDiem} để nhận cho tiện.",
                    "Xin cảm ơn bạn rất nhiều vì đã lan tỏa sự sẻ chia.",
                    "Bài số {$i}: mình sẽ cập nhật trạng thái ngay khi đã nhận đủ.",
                ];
                shuffle($sentences);
                $take = rand(3, 6);
                $moTa = implode(' ', array_slice($sentences, 0, $take));
            } else {
                $sentences = [
                    "Mình muốn tặng {$tenChuDe} tại {$diaDiem}. ",
                    " Còn sử dụng tốt và phù hợp cho người đang cần." ,
                     "Đây là {$tenChuDe} thuộc nhóm hỗ trợ chính, không bao gồm các loại khác." ,
                    "Mình có thể hẹn tại {$diaDiem} hoặc linh động thời gian trao tặng. " ,
                    "Ưu tiên người thực sự cần. Nếu bạn quan tâm, hãy liên hệ mình nhé." ,
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
                // 'region' => $geo->makeRegion((float) $randomLatLng['lat'], (float) $randomLatLng['lng']),
                'region' => fakeRegion($randomLatLng['lat'], $randomLatLng['lng']),
                'so_luong' => 5 + ($i % 10),
                'trang_thai' => $trangThai,
                'lat' => $randomLatLng['lat'], // ✅ random
                'lng' => $randomLatLng['lng'],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];
        }
        $commentSamples = [
            "Mình rất cần cái này, bạn còn không ạ?",
            "Cảm ơn bạn rất nhiều vì chia sẻ ❤️",
            "Mình có thể qua lấy hôm nay không?",
            "Bạn cho mình xin địa chỉ với nhé",
            "Bài viết rất ý nghĩa 🙌",
            "Mình xin đăng ký nhận nhé!",
            "Chúc bạn nhiều sức khỏe ❤️",
            "Bạn còn không ạ, mình cần gấp",
            "Bạn còn {$tenChuDe} không ạ?",
            "Mình ở {$diaDiem}, có thể qua lấy không?",
        ];

        $likes = [];
        $comments = [];
        collect($rows)->chunk(200)->each(function ($chunk) {
            DB::table('bai_dang')->insert($chunk->toArray());
        });

        $postIds = DB::table('bai_dang')->pluck('id');

        foreach ($postIds as $postId) {

            // ❤️ LIKE
            $likeUsers = collect($nguoiDungIds)->shuffle()->take(rand(2,5));

            foreach ($likeUsers as $uid) {
                $likes[] = [
                    'bai_dang_id' => $postId,
                    'nguoi_dung_id' => $uid,
                    'created_at' => now()->subMinutes(rand(1, 1000)),
                ];
            }

            // 💬 COMMENT
            $commentCount = rand(2,5);

            for ($j = 0; $j < $commentCount; $j++) {
                $comments[] = [
                    'bai_dang_id' => $postId,
                    'nguoi_dung_id' => Arr::random($nguoiDungIds),
                    'noi_dung' => Arr::random($commentSamples),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // 🚀 Insert like + comment (chia nhỏ tránh lag)
        collect($likes)->chunk(500)->each(function ($chunk) {
            DB::table('thich_bai_dang')->insert($chunk->toArray());
        });

        collect($comments)->chunk(500)->each(function ($chunk) {
            DB::table('binh_luan_bai_dang')->insert($chunk->toArray());
        });
    }
}