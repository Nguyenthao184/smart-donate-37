<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class AdminViolationDetectedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $source,
        private readonly int $canhBaoId,
        private readonly int $userId,
        private readonly ?int $campaignId,
        private readonly ?int $postId,
        private readonly string $reason,
        private readonly ?string $description = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'loai' => 'admin_violation_detected',
            'message' => $this->source . ': ' . $this->reason,
            'source' => $this->source,
            'canh_bao_id' => $this->canhBaoId,
            'user_id' => $this->userId,
            'campaign_id' => $this->campaignId,
            'post_id' => $this->postId,
            'reason' => $this->reason,
            'mo_ta' => $this->description,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toDatabase($notifiable));
    }
}
