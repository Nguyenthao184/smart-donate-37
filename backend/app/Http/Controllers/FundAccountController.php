<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TaiKhoanGayQuy;
use Illuminate\Support\Str;
use App\Http\Requests\Organization\StoreFundAccountRequest;
use Illuminate\Support\Facades\Storage;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Encoding\Encoding;

class FundAccountController extends Controller
{
    // Lấy tài khoản
    public function me()
    {
        $account = TaiKhoanGayQuy::where('nguoi_dung_id', auth()->id())
            ->first();

        if (!$account) {
            return response()->json([
                'message' => 'Bạn chưa có tài khoản gây quỹ'
            ], 404);
        }

        return response()->json($account);
    }

    // Tạo tài khoản
    public function store(StoreFundAccountRequest $request)
    {
        $user = auth()->user();

        // Không cho tạo nhiều tài khoản
        $exists = TaiKhoanGayQuy::where('nguoi_dung_id', $user->id)
            ->whereIn('trang_thai', ['CHO_DUYET', 'HOAT_DONG'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Bạn đã có tài khoản gây quỹ'
            ], 400);
        }

        $account = TaiKhoanGayQuy::create([
            'nguoi_dung_id' => $user->id,
            'ten_quy' => $request->ten_quy,
            'ngan_hang' => 'MBBank',
            'so_tai_khoan' => null,
            'chu_tai_khoan' => null,
            'ma_yeu_cau_mb' => null,
            'so_du' => 0,
            'trang_thai' => 'CHO_DUYET'
        ]);

        return response()->json([
            'message' => 'Tạo tài khoản thành công, chờ duyệt',
            'data' => $account
        ]);
    }

    // ADMIN duyệt
    public function approve($id)
    {
        $tk = TaiKhoanGayQuy::findOrFail($id);

        if ($tk->trang_thai !== 'CHO_DUYET') {
            return response()->json([
                'message' => 'Không thể duyệt'
            ], 400);
        }

        // FAKE TẠO TÀI KHOẢN MB
        $mb = $this->fakeMBBank($tk->ten_quy, $tk->user);

        // NỘI DUNG QR
        $qrContent = json_encode([
            'bank' => $mb['ngan_hang'],
            'account' => $mb['so_tai_khoan'],
            'name' => $mb['chu_tai_khoan']
        ]);

        // TẠO QR
        $result = Builder::create()
            ->writer(new PngWriter())
            ->data($qrContent)
            ->size(300)
            ->margin(10)
            ->build();

        $fileName = 'qr_' . time() . '_' . Str::random(5) . '.png';

        Storage::disk('public')->put($fileName, $result->getString());

        // UPDATE
        $tk->update([
            'so_tai_khoan' => $mb['so_tai_khoan'],
            'chu_tai_khoan' => $mb['chu_tai_khoan'],
            'ma_yeu_cau_mb' => $mb['request_id'],
            'trang_thai' => 'HOAT_DONG',
            'qr_code' => 'storage/' . $fileName
        ]);

        return response()->json([
            'message' => 'Đã duyệt và tạo tài khoản',
            'data' => $tk,
            'qr_url' => asset('storage/' . $fileName)
        ]);
    }

    // Admin khóa
    public function lock($id)
    {
        $tk = TaiKhoanGayQuy::findOrFail($id);

        $tk->update([
            'trang_thai' => 'KHOA'
        ]);

        return response()->json([
            'message' => 'Đã khóa tài khoản'
        ]);
    }


    // FAKE MBBANK SERVICE
    private function fakeMBBank($tenQuy, $user)
    {
        return [
            'so_tai_khoan' => 'MB' . rand(100000000, 999999999),
            'chu_tai_khoan' => strtoupper($user->ho_ten),
            'ngan_hang' => 'MBBank',
            'request_id' => 'REQ_' . Str::upper(Str::random(10))
        ];
    }
}
