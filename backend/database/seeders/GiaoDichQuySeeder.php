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
            if (in_array($campaign->trang_thai, ['CHO_XU_LY', 'TU_CHOI'])) {
                continue;
            }

            $ungHos = DB::table('ung_ho')
                ->where('chien_dich_gay_quy_id', $campaign->id)
                ->get();

            $tongTien = 0;

            $users = DB::table('nguoi_dung')->get()->keyBy('id');
            $campaigns = DB::table('chien_dich_gay_quy')->get()->keyBy('id');

            foreach ($ungHos as $uh) {
                $user = $users[$uh->nguoi_dung_id];
                $campaign = $campaigns[$uh->chien_dich_gay_quy_id];

                // format tên in hoa
                $ten = strtoupper($this->removeVietnameseAccents($user->ho_ten));

                // tạo mô tả
                $moTa = $campaign->ma_noi_dung_ck . ' ' . $ten . ' UNG HO';
                DB::table('giao_dich_quy')->insert([
                    'tai_khoan_gay_quy_id' => $campaign->tai_khoan_gay_quy_id,
                    'ung_ho_id' => $uh->id,
                    'so_tien' => $uh->so_tien,
                    'loai_giao_dich' => 'UNG_HO',
                    'mo_ta' => $moTa,
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

            // 💸 FAKE RÚT TIỀN (REALISTIC)
            if (rand(0, 1)) {

                $soDu = DB::table('tai_khoan_gay_quy')
                    ->where('id', $campaign->tai_khoan_gay_quy_id)
                    ->value('so_du');

                if ($soDu > 5000000) {

                    $rut = min(rand(100, 500) * 1000, $soDu);

                    DB::table('giao_dich_quy')->insert([
                        'tai_khoan_gay_quy_id' => $campaign->tai_khoan_gay_quy_id,
                        'ung_ho_id' => null,
                        'so_tien' => $rut,
                        'loai_giao_dich' => 'RUT',
                        'mo_ta' => 'RUT TIEN QUY',
                        'created_at' => now(),
                    ]);

                    DB::table('tai_khoan_gay_quy')
                        ->where('id', $campaign->tai_khoan_gay_quy_id)
                        ->decrement('so_du', $rut);
                }
            }
        }
    }

    private function removeVietnameseAccents($str) {
        $str = mb_strtolower($str, 'UTF-8');

        $accents = [
            'a' => ['à','á','ạ','ả','ã','â','ầ','ấ','ậ','ẩ','ẫ','ă','ằ','ắ','ặ','ẳ','ẵ'],
            'e' => ['è','é','ẹ','ẻ','ẽ','ê','ề','ế','ệ','ể','ễ'],
            'i' => ['ì','í','ị','ỉ','ĩ'],
            'o' => ['ò','ó','ọ','ỏ','õ','ô','ồ','ố','ộ','ổ','ỗ','ơ','ờ','ớ','ợ','ở','ỡ'],
            'u' => ['ù','ú','ụ','ủ','ũ','ư','ừ','ứ','ự','ử','ữ'],
            'y' => ['ỳ','ý','ỵ','ỷ','ỹ'],
            'd' => ['đ']
        ];

        foreach ($accents as $nonAccent => $accentChars) {
            foreach ($accentChars as $accent) {
                $str = str_replace($accent, $nonAccent, $str);
            }
        }

        return $str;
    }
}