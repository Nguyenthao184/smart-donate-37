<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApprovalNotification extends Notification
{
    use Queueable;
    protected $type;
    protected $name;
    protected $reason;

    /**
     * Create a new notification instance.
     */
    public function __construct($type, $name, $reason = null)
    {
        $this->type = $type;
        $this->name = $name;
        $this->reason = $reason;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'message' => match($this->type) {
                'approve' => "{$this->name} đã được duyệt",
                'reject' => "{$this->name} đã bị từ chối",
                'lock' => "{$this->name} đã bị khóa",
                default => 'Thông báo'
            },
            'ly_do' => $this->reason,
        ];
    }
}
