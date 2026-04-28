<?php

namespace App\Http\Controllers;

use App\Http\Requests\Post\StorePostReportRequest;
use App\Http\Requests\Post\UpdatePostReportRequest;
use App\Models\BaiDang;
use App\Models\BaoCaoBaiDang;
use App\Models\CanhBaoGianLan;
use App\Models\ChienDichGayQuy;
use App\Models\User;
use App\Notifications\AdminViolationDetectedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class PostReportController extends Controller
{
    private const DEDUPE_HOURS = 24;
    private const REPORT_REASON_LABELS = [
        'SPAM' => [
            'title' => 'Spam bài đăng',
            'description' => 'Bài đăng này có dấu hiệu spam, vui lòng xem xét.',
        ],
        'LUA_DAO' => [
            'title' => 'Dấu hiệu lừa đảo',
            'description' => 'Bài đăng này có dấu hiệu lừa đảo, vui lòng xem xét.',
        ],
        'NOI_DUNG_XAU' => [
            'title' => 'Nội dung xấu/không phù hợp',
            'description' => 'Bài đăng có nội dung xấu/không phù hợp, vui lòng xem xét.',
        ],
        'KHAC' => [
            'title' => 'Lý do khác',
            'description' => 'Lý do khác do người dùng cung cấp, cần admin xác minh.',
        ],
    ];

    private const AI_ACCOUNT_REASONS = [
        ['code' => 'AI_SPAM_BAI_DANG', 'title' => 'Spam bài đăng', 'description' => 'AI phát hiện tần suất đăng bài bất thường cao.', 'source' => 'AI_USER', 'target_type' => 'USER'],
        ['code' => 'AI_NOI_DUNG_TRUNG_LAP', 'title' => 'Nội dung trùng lặp', 'description' => 'AI phát hiện nội dung bài đăng lặp lại nhiều lần.', 'source' => 'AI_USER', 'target_type' => 'USER'],
        ['code' => 'AI_TANG_TIEN_BAT_THUONG', 'title' => 'Tăng tiền bất thường', 'description' => 'AI phát hiện biến động tiền ủng hộ bất thường.', 'source' => 'AI_USER', 'target_type' => 'USER'],
        ['code' => 'AI_NHIEU_IP', 'title' => 'Nhiều tài khoản cùng IP', 'description' => 'AI phát hiện nhiều tài khoản có hành vi từ cùng IP đáng ngờ.', 'source' => 'AI_USER', 'target_type' => 'USER'],
        ['code' => 'AI_HANH_VI_BAT_THUONG', 'title' => 'Hành vi bất thường', 'description' => 'AI tổng hợp nhiều tín hiệu và đánh giá rủi ro cao.', 'source' => 'AI_USER', 'target_type' => 'USER'],
    ];

    private const AI_CAMPAIGN_REASONS = [
        ['code' => 'AI_NHIEU_CHIEN_DICH', 'title' => 'Nhiều chiến dịch cùng tổ chức', 'description' => 'AI phát hiện tần suất tạo chiến dịch cao bất thường.', 'source' => 'AI_CAMPAIGN', 'target_type' => 'CAMPAIGN'],
        ['code' => 'AI_TANG_UNG_HO_BAT_THUONG', 'title' => 'Tăng ủng hộ bất thường (chiến dịch)', 'description' => 'AI phát hiện tăng trưởng ủng hộ đột biến trên chiến dịch.', 'source' => 'AI_CAMPAIGN', 'target_type' => 'CAMPAIGN'],
        ['code' => 'AI_TU_UNG_HO_CAO', 'title' => 'Tỷ lệ tự ủng hộ cao', 'description' => 'AI phát hiện tỷ lệ tự ủng hộ cao hơn mức an toàn.', 'source' => 'AI_CAMPAIGN', 'target_type' => 'CAMPAIGN'],
        ['code' => 'AI_IT_NGUOI_UNG_HO', 'title' => 'Ít người ủng hộ', 'description' => 'AI phát hiện số lượng người ủng hộ thấp bất thường.', 'source' => 'AI_CAMPAIGN', 'target_type' => 'CAMPAIGN'],
        ['code' => 'AI_UNG_HO_DAY_DAC', 'title' => 'Ủng hộ dày đặc', 'description' => 'AI phát hiện nhiều giao dịch ủng hộ dồn dập trong thời gian ngắn.', 'source' => 'AI_CAMPAIGN', 'target_type' => 'CAMPAIGN'],
    ];

    public function store(StorePostReportRequest $request, int $id)
    {
        $post = BaiDang::query()->findOrFail($id);
        $userId = (int) Auth::id();

        if ((int) $post->nguoi_dung_id === $userId) {
            return response()->json(['message' => 'Không thể báo cáo bài đăng của chính mình.'], 422);
        }

        $dup = BaoCaoBaiDang::query()
            ->where('bai_dang_id', $id)
            ->where('nguoi_to_cao_id', $userId)
            ->where('trang_thai', 'CHO_XU_LY')
            ->where('created_at', '>=', now()->subHours(self::DEDUPE_HOURS))
            ->exists();

        if ($dup) {
            return response()->json([
                'message' => 'Bạn đã gửi báo cáo cho bài này và đang chờ xử lý.',
            ], 422);
        }

        $data = $request->validated();
        $lyDoCode = (string) $data['ly_do'];
        $lyDoMeta = $this->getReportReasonMeta($lyDoCode);
        $lyDoHienThi = $lyDoMeta['description'];
        $moTaNguoiDung = isset($data['mo_ta']) ? trim((string) $data['mo_ta']) : null;
        if ($moTaNguoiDung === '') {
            $moTaNguoiDung = null;
        }

        DB::beginTransaction();
        try {
            $baoCao = BaoCaoBaiDang::query()->create([
                'bai_dang_id' => $id,
                'nguoi_to_cao_id' => $userId,
                'ly_do' => $lyDoCode,
                'mo_ta' => $moTaNguoiDung,
                'trang_thai' => 'CHO_XU_LY',
            ]);

            $moTaCanhBao = 'USER_REPORT|post:' . $post->id . '|report:' . $baoCao->id . '|ly_do:' . $lyDoCode;
            if ($moTaNguoiDung !== null) {
                $moTaCanhBao .= '|mo_ta:' . $moTaNguoiDung;
            }
            $moTaCanhBao = mb_substr($moTaCanhBao, 0, 255);

            $canhBao = CanhBaoGianLan::query()->create([
                'nguoi_dung_id' => (int) $post->nguoi_dung_id,
                'chien_dich_id' => null,
                'loai_gian_lan' => $lyDoHienThi,
                'diem_rui_ro' => 72.0,
                'mo_ta' => $moTaCanhBao,
                'trang_thai' => 'CHO_XU_LY',
                'created_at' => now(),
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        $this->notifyAdmins(
            $canhBao,
            (int) $post->id,
            'Người dùng vừa báo cáo bài đăng',
            $lyDoHienThi,
            $moTaNguoiDung
        );

        return response()->json([
            'data' => $this->formatReport($baoCao),
        ], 201);
    }

    public function adminIndex(Request $request)
    {
        return response()->json([
            'data' => $this->buildViolationFeed(
                trangThai: $request->query('trang_thai'),
                baiDangId: is_numeric($request->query('bai_dang_id')) ? (int) $request->query('bai_dang_id') : null,
                chienDichId: is_numeric($request->query('chien_dich_id')) ? (int) $request->query('chien_dich_id') : null,
                source: $request->query('source'),
                limit: (int) $request->query('limit', 50)
            ),
        ]);
    }

    public function violationReasons()
    {
        $userReportReasons = collect(self::REPORT_REASON_LABELS)->map(
            static fn (array $meta, string $code) => [
                'code' => $code,
                'title' => $meta['title'],
                'description' => $meta['description'],
                'require_mo_ta' => $code === 'KHAC',
                'source' => 'USER_REPORT',
                'target_type' => 'POST',
            ]
        )->values();

        return response()->json([
            'data' => [
                'user_report' => $userReportReasons,
                'ai_account' => self::AI_ACCOUNT_REASONS,
                'ai_campaign' => self::AI_CAMPAIGN_REASONS,
            ],
        ]);
    }

    public function postViolations(int $id, Request $request)
    {
        BaiDang::query()->findOrFail($id);

        return response()->json([
            'data' => $this->buildViolationFeed(
                trangThai: $request->query('trang_thai'),
                baiDangId: $id,
                chienDichId: null,
                source: $request->query('source'),
                limit: (int) $request->query('limit', 50)
            ),
        ]);
    }

    public function campaignViolations(int $id, Request $request)
    {
        ChienDichGayQuy::query()->findOrFail($id);

        return response()->json([
            'data' => $this->buildViolationFeed(
                trangThai: $request->query('trang_thai'),
                baiDangId: null,
                chienDichId: $id,
                source: $request->query('source'),
                limit: (int) $request->query('limit', 50)
            ),
        ]);
    }

    public function adminUpdate(UpdatePostReportRequest $request, int $id)
    {
        $baoCao = BaoCaoBaiDang::query()->findOrFail($id);
        $trangThaiMoi = $request->validated()['trang_thai'];
        $baoCao->update(['trang_thai' => $trangThaiMoi]);

        if ($trangThaiMoi === 'DA_XU_LY' && $baoCao->baiDang) {
            $baoCao->baiDang->update(['trang_thai' => 'TAM_DUNG']);
        }

        $this->syncFraudAlertWithAdminDecision($baoCao, $trangThaiMoi);

        $baoCao->load(['baiDang:id,nguoi_dung_id,tieu_de,loai_bai,trang_thai', 'nguoiToCao:id,ho_ten,email']);

        return response()->json([
            'data' => $this->formatReport($baoCao, true),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatReport(BaoCaoBaiDang $r, bool $detail = false): array
    {
        $reasonMeta = $this->getReportReasonMeta((string) $r->ly_do);
        $out = [
            'id' => (int) $r->id,
            'bai_dang_id' => (int) $r->bai_dang_id,
            'ly_do' => $r->ly_do,
            'ly_do_hien_thi' => $reasonMeta['description'],
            'ly_do_tieu_de' => $reasonMeta['title'],
            'mo_ta' => $r->mo_ta,
            'trang_thai' => $r->trang_thai,
            'created_at' => $r->created_at?->toIso8601String(),
            'updated_at' => $r->updated_at?->toIso8601String(),
        ];

        if ($detail) {
            $out['bai_dang'] = $r->baiDang ? [
                'id' => (int) $r->baiDang->id,
                'tieu_de' => $r->baiDang->tieu_de,
                'loai_bai' => $r->baiDang->loai_bai,
                'nguoi_dung_id' => (int) $r->baiDang->nguoi_dung_id,
                'trang_thai' => $r->baiDang->trang_thai,
            ] : null;
            $out['nguoi_to_cao'] = $r->nguoiToCao ? [
                'id' => (int) $r->nguoiToCao->id,
                'ho_ten' => $r->nguoiToCao->ho_ten,
                'email' => $r->nguoiToCao->email,
            ] : null;
        }

        return $out;
    }

    private function syncFraudAlertWithAdminDecision(BaoCaoBaiDang $baoCao, string $trangThaiBaoCao): void
    {
        $query = CanhBaoGianLan::query()
            ->whereNull('chien_dich_id')
            ->where('mo_ta', 'like', 'USER_REPORT|post:' . (int) $baoCao->bai_dang_id . '|%')
            ->whereIn('trang_thai', ['CHO_XU_LY', 'DA_KIEM_TRA', 'CANH_BAO_SAI']);

        if ($trangThaiBaoCao === 'DA_XU_LY') {
            $query->update(['trang_thai' => 'DA_KIEM_TRA']);
            return;
        }

        if ($trangThaiBaoCao === 'TU_CHOI') {
            $query->update(['trang_thai' => 'CANH_BAO_SAI']);
        }
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function buildViolationFeed(
        mixed $trangThai,
        ?int $baiDangId,
        ?int $chienDichId,
        mixed $source,
        int $limit
    ): Collection {
        $limit = max(1, min($limit, 100));
        $trangThai = is_string($trangThai) ? strtoupper(trim($trangThai)) : '';
        $source = is_string($source) ? strtoupper(trim($source)) : '';

        $items = collect();

        if ($source === '' || $source === 'USER_REPORT') {
            $items = $items->concat($this->loadUserReportViolations($trangThai, $baiDangId, $limit));
        }

        if ($source === '' || in_array($source, ['AI_POST', 'AI_USER', 'AI_CAMPAIGN'], true)) {
            $items = $items->concat($this->loadFraudAlertViolations($trangThai, $baiDangId, $chienDichId, $source, $limit));
        }

        return $items
            ->sortByDesc('created_at')
            ->take($limit)
            ->values();
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function loadUserReportViolations(string $trangThai, ?int $baiDangId, int $limit): Collection
    {
        $query = BaoCaoBaiDang::query()
            ->with([
                'baiDang:id,nguoi_dung_id,tieu_de,loai_bai,trang_thai',
                'nguoiToCao:id,ho_ten,email',
            ])
            ->orderByDesc('created_at');

        if (in_array($trangThai, ['CHO_XU_LY', 'DA_XU_LY', 'TU_CHOI'], true)) {
            $query->where('trang_thai', $trangThai);
        }

        if ($baiDangId !== null && $baiDangId > 0) {
            $query->where('bai_dang_id', $baiDangId);
        }

        return $query->limit($limit)->get()->map(function (BaoCaoBaiDang $report) {
            $reasonMeta = $this->getReportReasonMeta((string) $report->ly_do);

            return [
                'id' => 'report_' . (int) $report->id,
                'source' => 'USER_REPORT',
                'target_type' => 'POST',
                'target_id' => (int) $report->bai_dang_id,
                'report_id' => (int) $report->id,
                'alert_id' => $this->findUserReportAlertId((int) $report->bai_dang_id),
                'reason_code' => $report->ly_do,
                'reason_title' => $reasonMeta['title'],
                'reason_text' => $reasonMeta['description'],
                'mo_ta' => $report->mo_ta,
                'trang_thai' => $report->trang_thai,
                'created_at' => $report->created_at?->toIso8601String(),
                'updated_at' => $report->updated_at?->toIso8601String(),
                'bai_dang' => $report->baiDang ? [
                    'id' => (int) $report->baiDang->id,
                    'tieu_de' => $report->baiDang->tieu_de,
                    'loai_bai' => $report->baiDang->loai_bai,
                    'trang_thai' => $report->baiDang->trang_thai,
                    'nguoi_dung_id' => (int) $report->baiDang->nguoi_dung_id,
                ] : null,
                'chien_dich' => null,
                'nguoi_to_cao' => $report->nguoiToCao ? [
                    'id' => (int) $report->nguoiToCao->id,
                    'ho_ten' => $report->nguoiToCao->ho_ten,
                    'email' => $report->nguoiToCao->email,
                ] : null,
            ];
        });
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function loadFraudAlertViolations(
        string $trangThai,
        ?int $baiDangId,
        ?int $chienDichId,
        string $source,
        int $limit
    ): Collection {
        $query = CanhBaoGianLan::query()->orderByDesc('created_at');

        if (in_array($trangThai, ['CHO_XU_LY', 'DA_KIEM_TRA', 'CANH_BAO_SAI'], true)) {
            $query->where('trang_thai', $trangThai);
        }

        if ($chienDichId !== null && $chienDichId > 0) {
            $query->where('chien_dich_id', $chienDichId);
        }

        if ($baiDangId !== null && $baiDangId > 0) {
            $query->where('mo_ta', 'like', 'USER_REPORT|post:' . $baiDangId . '|%');
        }

        if ($source === 'AI_CAMPAIGN') {
            $query->whereNotNull('chien_dich_id');
        } elseif ($source === 'AI_USER') {
            $query->whereNull('chien_dich_id')
                ->where('mo_ta', 'not like', 'USER_REPORT|post:%');
        } elseif ($source === 'AI_POST') {
            $query->where('mo_ta', 'like', 'USER_REPORT|post:%');
        }

        $alerts = $query->limit($limit)->get();
        $postIds = [];

        if ($baiDangId !== null && $baiDangId > 0) {
            $postIds[] = $baiDangId;
        }

        foreach ($alerts as $alert) {
            $postId = $this->extractPostIdFromMeta((string) ($alert->mo_ta ?? ''));
            if ($postId !== null) {
                $postIds[] = $postId;
            }
        }

        $posts = BaiDang::query()
            ->whereIn('id', array_values(array_unique(array_filter($postIds))))
            ->get(['id', 'nguoi_dung_id', 'tieu_de', 'loai_bai', 'trang_thai'])
            ->keyBy('id');

        $campaigns = ChienDichGayQuy::query()
            ->whereIn('id', $alerts->pluck('chien_dich_id')->filter()->unique()->values())
            ->get(['id', 'to_chuc_id', 'ten_chien_dich', 'trang_thai'])
            ->keyBy('id');

        return $alerts->map(function (CanhBaoGianLan $alert) use ($posts, $campaigns) {
            $meta = $this->parseAlertMeta((string) ($alert->mo_ta ?? ''));
            $post = $meta['post_id'] ? $posts->get($meta['post_id']) : null;
            $campaign = $alert->chien_dich_id ? $campaigns->get((int) $alert->chien_dich_id) : null;
            $itemSource = $meta['post_id'] ? 'AI_POST' : ($alert->chien_dich_id ? 'AI_CAMPAIGN' : 'AI_USER');

            return [
                'id' => 'alert_' . (int) $alert->id,
                'source' => $itemSource,
                'target_type' => $meta['post_id'] ? 'POST' : ($alert->chien_dich_id ? 'CAMPAIGN' : 'USER'),
                'target_id' => $meta['post_id'] ?: ($alert->chien_dich_id ? (int) $alert->chien_dich_id : (int) $alert->nguoi_dung_id),
                'report_id' => $meta['report_id'],
                'alert_id' => (int) $alert->id,
                'reason_code' => null,
                'reason_title' => $alert->loai_gian_lan,
                'reason_text' => $alert->loai_gian_lan,
                'mo_ta' => $meta['user_description'] ?? ($meta['raw_description'] ?: $alert->mo_ta),
                'trang_thai' => $alert->trang_thai,
                'created_at' => $alert->created_at?->toIso8601String(),
                'updated_at' => null,
                'bai_dang' => $post ? [
                    'id' => (int) $post->id,
                    'tieu_de' => $post->tieu_de,
                    'loai_bai' => $post->loai_bai,
                    'trang_thai' => $post->trang_thai,
                    'nguoi_dung_id' => (int) $post->nguoi_dung_id,
                ] : null,
                'chien_dich' => $campaign ? [
                    'id' => (int) $campaign->id,
                    'ten_chien_dich' => $campaign->ten_chien_dich,
                    'trang_thai' => $campaign->trang_thai,
                    'to_chuc_id' => (int) $campaign->to_chuc_id,
                ] : null,
                'nguoi_to_cao' => null,
                'user_id' => (int) $alert->nguoi_dung_id,
                'muc_rui_ro' => ((float) $alert->diem_rui_ro >= 70.0) ? 'HIGH' : 'LOW',
                'diem_rui_ro' => round((float) $alert->diem_rui_ro, 2),
            ];
        });
    }

    /**
     * @return array{post_id:?int,report_id:?int,user_description:?string,raw_description:?string}
     */
    private function parseAlertMeta(string $rawMeta): array
    {
        if (!str_starts_with($rawMeta, 'USER_REPORT|')) {
            return [
                'post_id' => null,
                'report_id' => null,
                'user_description' => null,
                'raw_description' => $rawMeta,
            ];
        }

        $parts = explode('|', $rawMeta);
        $parsed = [
            'post_id' => null,
            'report_id' => null,
            'user_description' => null,
            'raw_description' => null,
        ];

        foreach ($parts as $part) {
            if (str_starts_with($part, 'post:')) {
                $parsed['post_id'] = (int) substr($part, 5);
            } elseif (str_starts_with($part, 'report:')) {
                $parsed['report_id'] = (int) substr($part, 7);
            } elseif (str_starts_with($part, 'mo_ta:')) {
                $parsed['user_description'] = substr($part, 6);
            }
        }

        return $parsed;
    }

    private function extractPostIdFromMeta(string $rawMeta): ?int
    {
        $meta = $this->parseAlertMeta($rawMeta);
        return $meta['post_id'];
    }

    private function findUserReportAlertId(int $postId): ?int
    {
        $id = CanhBaoGianLan::query()
            ->whereNull('chien_dich_id')
            ->where('mo_ta', 'like', 'USER_REPORT|post:' . $postId . '|%')
            ->orderByDesc('id')
            ->value('id');

        return $id ? (int) $id : null;
    }

    /**
     * @return array{title:string,description:string}
     */
    private function getReportReasonMeta(string $code): array
    {
        return self::REPORT_REASON_LABELS[$code] ?? [
            'title' => $code,
            'description' => $code,
        ];
    }

    private function notifyAdmins(
        CanhBaoGianLan $canhBao,
        int $postId,
        string $source,
        string $reasonLabel,
        ?string $description
    ): void {
        $admins = User::query()
            ->whereHas('roles', fn ($q) => $q->where('ten_vai_tro', 'ADMIN'))
            ->get();

        foreach ($admins as $admin) {
            $admin->notify(new AdminViolationDetectedNotification(
                source: $source,
                canhBaoId: (int) $canhBao->id,
                userId: (int) $canhBao->nguoi_dung_id,
                campaignId: null,
                postId: $postId,
                reason: $reasonLabel,
                description: $description
            ));
        }
    }
}
