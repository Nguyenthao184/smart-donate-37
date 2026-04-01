<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ChienDichGayQuySeeder extends Seeder
{
    public function run(): void
    {
        $orgCategoryMap = [
            'Trung Tâm Hỗ Trợ Cứu Trợ Thiên Tai Việt' => 'Thiên tai',
            'Chung Tay Xóa Đói Giảm Nghèo' => 'Xóa đói',
            'An Sinh Cộng Đồng Việt Nam' => 'An sinh',
            'Bảo Vệ và Phát Triển Trẻ Em Việt' => 'Trẻ em',
            'Liên Minh Hành Động Vì Môi Trường Xanh' => 'Môi trường',
            'Hỗ Trợ Giáo Dục và Tri Thức Trẻ' => 'Giáo dục',
        ];

        $folderMap = [
            'Trẻ em' => 'tre_em',
            'Giáo dục' => 'giao_duc',
            'Thiên tai' => 'thien_tai',
            'Xóa đói' => 'xoa_doi',
            'Môi trường' => 'moi_truong',
            'An sinh' => 'an_sinh',
        ];

        $orgs = DB::table('to_chuc')
            ->join('tai_khoan_gay_quy', 'to_chuc.id', '=', 'tai_khoan_gay_quy.to_chuc_id')
            ->select('to_chuc.*', 'tai_khoan_gay_quy.id as tk_id')
            ->where('to_chuc.trang_thai', 'HOAT_DONG')
            ->where('tai_khoan_gay_quy.trang_thai', 'HOAT_DONG')
            ->get();

        foreach ($orgs as $org) {
            // lấy danh mục theo tổ chức
            $categoryName = $orgCategoryMap[$org->ten_to_chuc] ?? null;
            if (!$categoryName) continue;

            // lấy danh mục trong DB
            $danhMuc = DB::table('danh_muc')
                ->where('ten_danh_muc', $categoryName)
                ->first();

            if (!$danhMuc) continue;

            // lấy folder ảnh
            $folder = $folderMap[$categoryName] ?? null;

            $files = $folder
                ? Storage::disk('public')->files("campaigns/$folder")
                : [];

            // fallback nếu folder rỗng
            if (empty($files)) {
                $files = [
                    'campaigns/default.jpg'
                ];
            }

            // tạo 10 campaign
            for ($i = 0; $i < 10; $i++) {

                // random 1–5 ảnh KHÔNG trùng
                $selected = collect($files)->random(min(5, count($files)));

                $images = collect($selected)
                    ->map(fn($f) => 'storage/' . $f)
                    ->toArray();

                // mục tiêu tiền
                $rand = rand(1, 100);
                if ($rand <= 50) {
                    $mucTieu = rand(10, 50) * 1000000;
                } elseif ($rand <= 80) {
                    $mucTieu = rand(50, 200) * 1000000;
                } else {
                    $mucTieu = rand(200, 1000) * 1000000;
                }

                $ngayKetThuc = now()->addDays(rand(-10, 30));

                $statuses = array_merge(
                    array_fill(0, 55, 'HOAT_DONG'),
                    array_fill(0, 10, 'TAM_DUNG'),
                    array_fill(0, 10, 'DA_KET_THUC'),
                    array_fill(0, 15, 'HOAN_THANH'),
                    array_fill(0, 5, 'CHO_XU_LY'),
                    array_fill(0, 5, 'TU_CHOI'),
                );

                $trangThai = $statuses[array_rand($statuses)];

                $orgIds = DB::table('to_chuc')->pluck('id');

                foreach ($orgIds as $orgId) {

                    $count = DB::table('chien_dich_gay_quy')
                        ->where('to_chuc_id', $orgId)
                        ->where('trang_thai', 'HOAT_DONG')
                        ->count();

                    DB::table('to_chuc')
                        ->where('id', $orgId)
                        ->update([
                            'so_cd_dang_hd' => $count
                        ]);
                }
                DB::table('chien_dich_gay_quy')->insert([
                    'to_chuc_id' => $org->id,
                    'danh_muc_id' => $danhMuc->id,
                    'tai_khoan_gay_quy_id' => $org->tk_id,

                    'ten_chien_dich' => "Chiến dịch {$categoryName} #" . ($i+1),
                    'mo_ta' => "Chiến dịch hỗ trợ {$categoryName}",

                    'hinh_anh' => json_encode($images),

                    'muc_tieu_tien' => $mucTieu,
                    'so_tien_da_nhan' => 0,

                    'ngay_ket_thuc' => $ngayKetThuc,

                    'vi_tri' => collect(['Đà Nẵng','Hà Nội','TP.HCM'])->random(),
                    'lat' => rand(10,21),
                    'lng' => rand(105,108),

                    'ma_noi_dung_ck' => 'CD' . strtoupper(Str::random(6)),

                    'trang_thai' => $trangThai,

                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}