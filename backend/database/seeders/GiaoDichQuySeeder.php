<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GiaoDichQuySeeder extends Seeder
{
    public function run(): void
    {
        $campaigns = DB::table('chien_dich_gay_quy')->get();

        foreach ($campaigns as $campaign) {

            $ungHos = DB::table('ung_ho')
                ->where('chien_dich_gay_quy_id', $campaign->id)
                ->get();

            $tongTien = 0;

            foreach ($ungHos as $uh) {

                DB::table('giao_dich_quy')->insert([
                    'tai_khoan_gay_quy_id' => $campaign->tai_khoan_gay_quy_id,
                    'ung_ho_id' => $uh->id,
                    'so_tien' => $uh->so_tien,
                    'loai_giao_dich' => 'UNG_HO',
                    'mo_ta' => 'Ủng hộ chiến dịch',
                    'created_at' => $uh->created_at,
                ]);

                $tongTien += $uh->so_tien;
            }

            // 💰 update tài khoản
            DB::table('tai_khoan_gay_quy')
                ->where('id', $campaign->tai_khoan_gay_quy_id)
                ->increment('so_du', $tongTien);

            // 📈 update campaign
            DB::table('chien_dich_gay_quy')
                ->where('id', $campaign->id)
                ->update([
                    'so_tien_da_nhan' => $tongTien
                ]);

            // =========================
            // 🎯 LOGIC TRẠNG THÁI CHUẨN
            // =========================

            $trangThai = $campaign->trang_thai;

            // ❗ giữ nguyên nếu chưa duyệt / bị từ chối
            if (!in_array($trangThai, ['CHO_XU_LY', 'TU_CHOI'])) {

                if ($tongTien >= $campaign->muc_tieu_tien) {
                    $trangThai = 'HOAN_THANH';
                } elseif (now()->gt($campaign->ngay_ket_thuc)) {
                    $trangThai = 'DA_KET_THUC';
                } else {
                    // random pause
                    $trangThai = rand(0, 4) === 0 ? 'TAM_DUNG' : 'HOAT_DONG';
                }
            }

            DB::table('chien_dich_gay_quy')
                ->where('id', $campaign->id)
                ->update([
                    'trang_thai' => $trangThai
                ]);

            // =========================
            // 💸 FAKE RÚT TIỀN (REALISTIC)
            // =========================

            if (rand(0, 1)) {

                $soDu = DB::table('tai_khoan_gay_quy')
                    ->where('id', $campaign->tai_khoan_gay_quy_id)
                    ->value('so_du');

                if ($soDu > 500000) {

                    $rut = min(rand(100, 500) * 1000, $soDu);

                    DB::table('giao_dich_quy')->insert([
                        'tai_khoan_gay_quy_id' => $campaign->tai_khoan_gay_quy_id,
                        'ung_ho_id' => null,
                        'so_tien' => $rut,
                        'loai_giao_dich' => 'RUT',
                        'mo_ta' => 'Rút tiền quỹ',
                        'created_at' => now(),
                    ]);

                    DB::table('tai_khoan_gay_quy')
                        ->where('id', $campaign->tai_khoan_gay_quy_id)
                        ->decrement('so_du', $rut);
                }
            }
        }
    }
}