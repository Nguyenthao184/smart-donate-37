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

            // scale số lượt theo mục tiêu
            $soLuot = match (true) {
                $campaign->muc_tieu_tien < 50_000_000 => rand(20, 80),
                $campaign->muc_tieu_tien < 200_000_000 => rand(80, 200),
                default => rand(200, 500),
            };

            // top donor (rất quan trọng)
            $topUsers = $users->random(min(5, $users->count()));

            for ($i = 0; $i < $soLuot; $i++) {

                // 30% là top donor
                $user = rand(0, 100) < 30
                    ? $topUsers->random()
                    : $users->random();

                // tiền donate
                if ($topUsers->contains('id', $user->id)) {
                    $soTien = rand(200, 2000) * 1000;
                } else {
                    $soTien = rand(20, 500) * 1000;
                }

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
            }
        }
    }
}