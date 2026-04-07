<?php

namespace App\Http\Controllers;

use App\Events\TinNhanMoi;
use App\Events\TinNhanDaXem;
use App\Models\CuocTroChuyen;
use App\Models\ThanhVienTroChuyen;
use App\Models\TinNhan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TroChuyenController extends Controller
{
    /**
     * POST /api/tro-chuyen/tao-hoac-lay
     * Body: { nguoi_nhan_id: int }
     */
    public function taoHoacLay(Request $request)
    {
        $data = $request->validate([
            'nguoi_nhan_id' => ['required', 'integer', 'min:1'],
        ], [
            'nguoi_nhan_id.required' => 'Thiếu người nhận.',
        ]);

        $nguoiGuiId = (int)Auth::id();
        $nguoiNhanId = (int)$data['nguoi_nhan_id'];

        if ($nguoiNhanId === $nguoiGuiId) {
            return response()->json(['message' => 'Không thể tự chat với chính mình.'], 400);
        }

        /** @var User|null $nguoiNhan */
        $nguoiNhan = User::query()->find($nguoiNhanId);
        if (!$nguoiNhan) {
            return response()->json(['message' => 'Không tìm thấy người nhận.'], 404);
        }

        $minId = min($nguoiGuiId, $nguoiNhanId);
        $maxId = max($nguoiGuiId, $nguoiNhanId);
        $khoa1_1 = $minId . '_' . $maxId;

        $cuoc = null;
        DB::beginTransaction();
        try {
            $cuoc = CuocTroChuyen::query()->where('khoa_1_1', $khoa1_1)->first();

            if (!$cuoc) {
                $cuoc = CuocTroChuyen::query()->create([
                    'khoa_1_1' => $khoa1_1,
                ]);

                ThanhVienTroChuyen::query()->insert([
                    [
                        'cuoc_tro_chuyen_id' => $cuoc->id,
                        'nguoi_dung_id' => $nguoiGuiId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'cuoc_tro_chuyen_id' => $cuoc->id,
                        'nguoi_dung_id' => $nguoiNhanId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                ]);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        return response()->json([
            'data' => [
                'cuoc_tro_chuyen_id' => (int)$cuoc->id,
            ],
        ]);
    }

    /**
     * GET /api/tro-chuyen
     * Danh sách cuộc trò chuyện 1:1 của user hiện tại.
     */
    public function danhSach()
    {
        $userId = (int)Auth::id();

        // Lấy các cuộc trò chuyện có user là thành viên
        $cuocIds = ThanhVienTroChuyen::query()
            ->where('nguoi_dung_id', $userId)
            ->pluck('cuoc_tro_chuyen_id')
            ->all();

        if (!$cuocIds) {
            return response()->json(['data' => []]);
        }

        $cuocs = CuocTroChuyen::query()
            ->whereIn('id', $cuocIds)
            ->orderByDesc('updated_at')
            ->get();

        // Với 1:1, người còn lại suy từ khóa_1_1 (minId_maxId).
        $otherIds = [];
        $otherIdByConv = [];
        $lastMsgIds = [];
        $convIds = [];
        foreach ($cuocs as $c) {
            $convIds[] = (int) $c->id;
            $otherId = null;
            if (!empty($c->khoa_1_1) && str_contains($c->khoa_1_1, '_')) {
                [$a, $b] = explode('_', $c->khoa_1_1, 2);
                $a = (int) $a;
                $b = (int) $b;
                $otherId = ($a === $userId) ? $b : $a;
            }
            $otherIdByConv[(int) $c->id] = $otherId;
            if ($otherId) {
                $otherIds[] = $otherId;
            }
            if (!empty($c->tin_nhan_cuoi_id)) {
                $lastMsgIds[] = (int) $c->tin_nhan_cuoi_id;
            }
        }
        $otherIds = array_values(array_unique(array_filter($otherIds)));
        $lastMsgIds = array_values(array_unique(array_filter($lastMsgIds)));

        $users = $otherIds
            ? User::query()->whereIn('id', $otherIds)->get()->keyBy('id')
            : collect();

        $lastMsgs = $lastMsgIds
            ? TinNhan::query()->whereIn('id', $lastMsgIds)->get()->keyBy('id')
            : collect();

        // Unread count: tin nhắn của người kia, created_at > lan_cuoi_xem_luc (nếu null -> tính tất cả)
        $unreadMap = [];
        if ($convIds) {
            $unreadRows = DB::table('tin_nhan as tn')
                ->join('thanh_vien_tro_chuyen as tv', function ($join) use ($userId) {
                    $join->on('tv.cuoc_tro_chuyen_id', '=', 'tn.cuoc_tro_chuyen_id')
                        ->where('tv.nguoi_dung_id', '=', $userId);
                })
                ->whereIn('tn.cuoc_tro_chuyen_id', $convIds)
                ->where('tn.nguoi_gui_id', '!=', $userId)
                ->where(function ($q) {
                    $q->whereNull('tv.lan_cuoi_xem_luc')
                        ->orWhereColumn('tn.created_at', '>', 'tv.lan_cuoi_xem_luc');
                })
                ->groupBy('tn.cuoc_tro_chuyen_id')
                ->selectRaw('tn.cuoc_tro_chuyen_id as cid, COUNT(*) as c')
                ->get();

            foreach ($unreadRows as $r) {
                $unreadMap[(int) $r->cid] = (int) $r->c;
            }
        }

        $rows = [];
        foreach ($cuocs as $c) {
            $cid = (int) $c->id;
            $otherId = $otherIdByConv[$cid] ?? null;
            $otherUser = $otherId ? ($users[$otherId] ?? null) : null;

            $avatarUrl = null;
            if ($otherUser && !empty($otherUser->anh_dai_dien)) {
                $avatarUrl = asset('storage/' . $otherUser->anh_dai_dien);
            }

            $last = null;
            $lastMsg = (!empty($c->tin_nhan_cuoi_id) && isset($lastMsgs[(int) $c->tin_nhan_cuoi_id]))
                ? $lastMsgs[(int) $c->tin_nhan_cuoi_id]
                : null;
            if ($lastMsg) {
                $preview = $lastMsg->noi_dung;
                if ($lastMsg->loai_tin === 'ANH') {
                    $preview = '[Ảnh]';
                } elseif ($lastMsg->loai_tin === 'VIDEO') {
                    $preview = '[Video]';
                }

                $last = [
                    'id' => (int) $lastMsg->id,
                    'loai_tin' => (string) $lastMsg->loai_tin,
                    'noi_dung' => $lastMsg->noi_dung,
                    'tep_dinh_kem' => $lastMsg->tep_dinh_kem,
                    'preview' => $preview,
                    'created_at' => $lastMsg->created_at?->toIso8601String(),
                    'nguoi_gui_id' => (int) $lastMsg->nguoi_gui_id,
                ];
            }

            $rows[] = [
                'cuoc_tro_chuyen_id' => $cid,
                'updated_at' => $c->updated_at?->toIso8601String(),
                'unread_count' => (int) ($unreadMap[$cid] ?? 0),
                'nguoi_kia' => $otherUser ? [
                    'id' => (int) $otherUser->id,
                    'ho_ten' => $otherUser->ho_ten,
                    'email' => $otherUser->email,
                    'avatar_url' => $avatarUrl,
                ] : null,
                'tin_nhan_cuoi' => $last,
            ];
        }

        return response()->json(['data' => $rows]);
    }

    /**
     * GET /api/tro-chuyen/{id}/tin-nhan
     */
    public function layTinNhan(int $id, Request $request)
    {
        $userId = (int)Auth::id();

        $isMember = ThanhVienTroChuyen::query()
            ->where('cuoc_tro_chuyen_id', $id)
            ->where('nguoi_dung_id', $userId)
            ->exists();

        if (!$isMember) {
            return response()->json(['message' => 'Bạn không có quyền xem cuộc trò chuyện này.'], 403);
        }

        $limit = (int)$request->query('limit', 30);
        $limit = max(1, min(100, $limit));
        $beforeId = $request->query('before_id');
        $beforeId = is_numeric($beforeId) ? (int)$beforeId : null;

        $q = TinNhan::query()
            ->where('cuoc_tro_chuyen_id', $id)
            ->orderByDesc('id');
        if ($beforeId !== null) {
            $q->where('id', '<', $beforeId);
        }
        $messages = $q->limit($limit)->get()->reverse()->values();

        return response()->json(['data' => $messages]);
    }

    /**
     * POST /api/tro-chuyen/{id}/tin-nhan
     */
    public function guiTinNhan(int $id, Request $request)
    {
        $userId = (int)Auth::id();

        $isMember = ThanhVienTroChuyen::query()
            ->where('cuoc_tro_chuyen_id', $id)
            ->where('nguoi_dung_id', $userId)
            ->exists();

        if (!$isMember) {
            return response()->json(['message' => 'Bạn không có quyền gửi tin vào cuộc trò chuyện này.'], 403);
        }

        $data = $request->validate([
            'noi_dung' => ['nullable', 'string'],
            'loai_tin' => ['nullable', 'in:VAN_BAN,ANH,VIDEO'],
            'tep_dinh_kem' => ['nullable'],
            'tep_dinh_kem_file' => ['nullable', 'file', 'image', 'max:5120'], // 5MB
            'file' => ['nullable', 'file', 'max:10240'], // 10MB (backward compatible)
            'video_file' => ['nullable', 'file', 'max:10240'], // 10MB
        ]);

        $loaiTin = (string)($data['loai_tin'] ?? 'VAN_BAN');
        $noiDung = $data['noi_dung'] ?? null;
        $tep = isset($data['tep_dinh_kem']) && is_string($data['tep_dinh_kem']) ? $data['tep_dinh_kem'] : null;

        if ($loaiTin === 'ANH' || $loaiTin === 'VIDEO') {
            $upload = null;
            if ($loaiTin === 'ANH' && $request->hasFile('tep_dinh_kem_file')) {
                $upload = $request->file('tep_dinh_kem_file');
            } elseif ($loaiTin === 'VIDEO' && $request->hasFile('video_file')) {
                $upload = $request->file('video_file');
            } elseif ($request->hasFile('file')) {
                // backward compatible: may be image or video
                $upload = $request->file('file');
            }

            if ($upload) {
                $mime = (string) ($upload->getMimeType() ?? '');
                if ($loaiTin === 'ANH' && !str_starts_with($mime, 'image/')) {
                    return response()->json(['message' => 'Tệp phải là ảnh.'], 422);
                }
                if ($loaiTin === 'VIDEO') {
                    $allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
                    if (!in_array($mime, $allowed, true)) {
                        return response()->json(['message' => 'Video chỉ hỗ trợ mp4/webm/mov.'], 422);
                    }
                }

                $path = $upload->store('chat', 'public');
                $tep = $path ? ('storage/' . $path) : null;
            }
        }

        if ($loaiTin === 'VAN_BAN' && (empty($noiDung) || !is_string($noiDung))) {
            return response()->json(['message' => 'Nội dung tin nhắn không được trống.'], 422);
        }

        if (($loaiTin === 'ANH' || $loaiTin === 'VIDEO') && empty($tep)) {
            return response()->json(['message' => 'Thiếu tệp đính kèm.'], 422);
        }

        $tin = TinNhan::query()->create([
            'cuoc_tro_chuyen_id' => $id,
            'nguoi_gui_id' => $userId,
            'noi_dung' => $noiDung,
            'loai_tin' => $loaiTin,
            'tep_dinh_kem' => $tep,
            'da_xem' => false,
        ]);

        CuocTroChuyen::query()->where('id', $id)->update([
            'tin_nhan_cuoi_id' => $tin->id,
            'updated_at' => now(),
        ]);

        event(new TinNhanMoi(
            cuoc_tro_chuyen_id: (int)$id,
            tin_nhan_id: (int)$tin->id,
            nguoi_gui_id: (int)$userId,
            noi_dung: $tin->noi_dung,
            loai_tin: (string)$tin->loai_tin,
            tep_dinh_kem: $tin->tep_dinh_kem,
            created_at: $tin->created_at?->toIso8601String() ?? now()->toIso8601String(),
        ));

        return response()->json(['data' => $tin], 201);
    }

    /**
     * POST /api/tro-chuyen/{id}/da-xem
     * Đánh dấu các tin nhắn của người kia là đã xem (1:1).
     */
    public function danhDauDaXem(int $id)
    {
        $userId = (int)Auth::id();

        $isMember = ThanhVienTroChuyen::query()
        ->where('cuoc_tro_chuyen_id', $id)
            ->where('nguoi_dung_id', $userId)
            ->exists();

        if (!$isMember) {
            return response()->json(['message' => 'Bạn không có quyền thao tác cuộc trò chuyện này.'], 403);
        }

        // Chỉ lấy các tin nhắn "chưa xem" để có thể báo realtime đúng danh sách message.
        $tinNhanIds = TinNhan::query()
            ->where('cuoc_tro_chuyen_id', $id)
            ->where('nguoi_gui_id', '!=', $userId)
            ->where('da_xem', false)
            ->pluck('id')
            ->all();

        if (!empty($tinNhanIds)) {
            TinNhan::query()
                ->whereIn('id', $tinNhanIds)
                ->update(['da_xem' => true]);

            event(new TinNhanDaXem(
                cuoc_tro_chuyen_id: (int)$id,
                nguoi_xem_id: (int)$userId,
                tin_nhan_ids: array_map(static fn ($v) => (int)$v, $tinNhanIds),
            ));
        }

        ThanhVienTroChuyen::query()
            ->where('cuoc_tro_chuyen_id', $id)
            ->where('nguoi_dung_id', $userId)
            ->update(['lan_cuoi_xem_luc' => now()]);

        return response()->json(['message' => 'Đã cập nhật trạng thái đã xem.']);
    }
}

