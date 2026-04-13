<?php

namespace App\Http\Controllers;

use App\Http\Requests\Post\StorePostCommentRequest;
use App\Models\BaiDang;
use App\Models\BinhLuanBaiDang;
use App\Models\User;
use App\Notifications\BaiDangDuocBinhLuanNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PostCommentController extends Controller
{
    /**
     * GET /api/posts/{id}/comments
     */
    public function index(int $id, Request $request)
    {
        BaiDang::query()->findOrFail($id);

        $perPage = (int) $request->query('per_page', 20);
        $perPage = max(1, min($perPage, 50));

        $paginator = BinhLuanBaiDang::query()
            ->where('bai_dang_id', $id)
            ->with(['nguoiDung:id,ho_ten,anh_dai_dien'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage);

        $paginator->getCollection()->transform(fn (BinhLuanBaiDang $c) => $this->formatComment($c));

        return response()->json([
            'data' => $paginator,
        ]);
    }

    /**
     * POST /api/posts/{id}/comments
     */
    public function store(StorePostCommentRequest $request, int $id)
    {
        $post = BaiDang::query()->findOrFail($id);

        $comment = BinhLuanBaiDang::query()->create([
            'bai_dang_id' => $id,
            'nguoi_dung_id' => (int) Auth::id(),
            'noi_dung' => $request->validated()['noi_dung'],
        ]);

        $comment->load(['nguoiDung:id,ho_ten,anh_dai_dien']);

        $chuBaiId = (int) $post->nguoi_dung_id;
        $nguoiBinhLuanId = (int) Auth::id();
        if ($chuBaiId !== $nguoiBinhLuanId) {
            $chuBai = User::query()->find($chuBaiId);
            $nguoiBinhLuan = Auth::user();
            if ($chuBai && $nguoiBinhLuan) {
                $chuBai->notify(new BaiDangDuocBinhLuanNotification(
                    bai_dang_id: $id,
                    binh_luan_id: (int) $comment->id,
                    nguoi_binh_luan_id: $nguoiBinhLuanId,
                    nguoi_binh_luan_ten: (string) ($nguoiBinhLuan->ho_ten ?? 'Người dùng'),
                    noi_dung_preview: Str::limit((string) $comment->noi_dung, 120),
                    tieu_de_bai: $post->tieu_de,
                ));
            }
        }

        return response()->json([
            'data' => $this->formatComment($comment),
        ], 201);
    }

    /**
     * DELETE /api/comments/{id}
     */
    public function destroy(int $id)
    {
        $comment = BinhLuanBaiDang::query()->findOrFail($id);
        $userId = (int) Auth::id();

        $isAdmin = Auth::user()->roles()->where('ten_vai_tro', 'ADMIN')->exists();
        if ((int) $comment->nguoi_dung_id !== $userId && !$isAdmin) {
            return response()->json(['message' => 'Bạn không có quyền xóa bình luận này.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Đã xóa bình luận.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatComment(BinhLuanBaiDang $c): array
    {
        $u = $c->nguoiDung;
        $avatarUrl = $u && $u->anh_dai_dien
            ? asset('storage/' . $u->anh_dai_dien)
            : null;

        return [
            'id' => (int) $c->id,
            'bai_dang_id' => (int) $c->bai_dang_id,
            'noi_dung' => $c->noi_dung,
            'created_at' => $c->created_at?->toIso8601String(),
            'updated_at' => $c->updated_at?->toIso8601String(),
            'nguoi_dung' => $u ? [
                'id' => (int) $u->id,
                'ho_ten' => $u->ho_ten,
                'avatar_url' => $avatarUrl,
            ] : null,
        ];
    }
}
