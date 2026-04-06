<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UngHoSeeder extends Seeder
{
    public function run(): void
    {
        $users = DB::table('nguoi_dung')
            ->whereNotIn('id', [1, 2, 3])
            ->get();
        $campaigns = DB::table('chien_dich_gay_quy')->get();

        foreach ($campaigns as $campaign) {

            // bỏ campaign chưa duyệt
            if (in_array($campaign->trang_thai, ['CHO_XU_LY', 'TU_CHOI'])) {
                continue;
            }

            switch ($campaign->trang_thai) {
                case 'HOAN_THANH':
                    $targetPercent = rand(100, 130);
                    break;
                case 'DA_KET_THUC':
                    $targetPercent = rand(40, 90);
                    break;
                case 'TAM_DUNG':
                    $targetPercent = rand(20, 70);
                    break;
                default:
                    $targetPercent = rand(30, 80);
                    break;
            }

            $tongTienTarget = ($campaign->muc_tieu_tien * $targetPercent) / 100;

            // top donor (rất quan trọng)
            $topUsers = $users->random(min(5, $users->count()));

            $tong = 0;
            for ($i = 0; $i < 500; $i++) {

                // 30% là top donor
                $user = rand(0, 100) < 30
                    ? $topUsers->random()
                    : $users->random();

                $rand = rand(1, 100);

                if ($topUsers->contains('id', $user->id)) {
                    // top donor
                    $soTien = rand(200, 1000) * 1000;
                } else {
                    if ($rand <= 60) {
                        $soTien = rand(10, 500) * 1000;   // đa số donate nhỏ
                    } elseif ($rand <= 90) {
                        $soTien = rand(500, 5000) * 1000;  // trung bình
                    } elseif ($rand <= 98) {
                        $soTien = rand(5000, 10000) * 1000; // hiếm
                    } else{
                        $soTien = rand(10000, 50000) * 1000; // rất hiếm
                    }
                }

                if ($tong + $soTien > $tongTienTarget) {
                    $soTien = max(10000, $tongTienTarget - $tong);
                }

                $tong += $soTien;

                // thời gian giống thật
                $dayOffset = rand(0, 30);

                $hour = rand(0, 100) < 70
                    ? rand(8, 22)   // giờ cao điểm
                    : rand(0, 23);

                $createdAt = Carbon::now()
                    ->subDays($dayOffset)
                    ->setHour($hour)
                    ->setMinute(rand(0, 59));

                DB::table('ung_ho')->insert([
                    'nguoi_dung_id' => $user->id,
                    'chien_dich_gay_quy_id' => $campaign->id,
                    'so_tien' => $soTien,
                    'ma_giao_dich' => 'GD' . strtoupper(Str::random(10)),
                    'created_at' => $createdAt,
                    'updated_at' => now(),
                ]);

                $tong += $soTien;
                if ($tong >= $tongTienTarget) break;
            }
        }
    }
}