<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Notifikasi extends Model
{
    use HasFactory;

    protected $table = 'notifikasi';

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'data',
        'is_read',
        'read_at',
        'action_url',
        'action_text',
        'priority',
        'expires_at',
        'category',
        'sender_id',
        'related_model_type',
        'related_model_id',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'expires_at' => 'datetime',
        'priority' => 'integer',
    ];

    /**
     * Relationship: Notifikasi belongs to User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: Notifikasi belongs to User (sender)
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Polymorphic relationship to related model
     */
    public function relatedModel()
    {
        return $this->morphTo('related_model', 'related_model_type', 'related_model_id');
    }

    /**
     * Get priority label
     */
    public function getPriorityLabelAttribute(): string
    {
        return match($this->priority) {
            1 => 'Rendah',
            2 => 'Normal',
            3 => 'Tinggi',
            4 => 'Urgent',
            default => 'Normal'
        };
    }

    /**
     * Get priority class for styling
     */
    public function getPriorityClassAttribute(): string
    {
        return match($this->priority) {
            1 => 'priority-low',
            2 => 'priority-normal',
            3 => 'priority-high',
            4 => 'priority-urgent',
            default => 'priority-normal'
        };
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'application_submitted' => 'Pengajuan Dikirim',
            'application_approved' => 'Pengajuan Disetujui',
            'application_rejected' => 'Pengajuan Ditolak',
            'internship_started' => 'Magang Dimulai',
            'internship_completed' => 'Magang Selesai',
            'attendance_reminder' => 'Pengingat Absensi',
            'logbook_reminder' => 'Pengingat Logbook',
            'logbook_approved' => 'Logbook Disetujui',
            'logbook_rejected' => 'Logbook Ditolak',
            'evaluation_available' => 'Evaluasi Tersedia',
            'evaluation_completed' => 'Evaluasi Selesai',
            'certificate_generated' => 'Sertifikat Dibuat',
            'certificate_approved' => 'Sertifikat Disetujui',
            'certificate_rejected' => 'Sertifikat Ditolak',
            'certificate_revoked' => 'Sertifikat Dicabut',
            'deadline_approaching' => 'Mendekati Deadline',
            'system_announcement' => 'Pengumuman Sistem',
            'maintenance_notice' => 'Pemberitahuan Maintenance',
            default => 'Notifikasi'
        };
    }

    /**
     * Get type icon
     */
    public function getTypeIconAttribute(): string
    {
        return match($this->type) {
            'application_submitted' => 'fas fa-paper-plane',
            'application_approved' => 'fas fa-check-circle',
            'application_rejected' => 'fas fa-times-circle',
            'internship_started' => 'fas fa-play-circle',
            'internship_completed' => 'fas fa-flag-checkered',
            'attendance_reminder' => 'fas fa-clock',
            'logbook_reminder' => 'fas fa-book',
            'logbook_approved' => 'fas fa-thumbs-up',
            'logbook_rejected' => 'fas fa-thumbs-down',
            'evaluation_available' => 'fas fa-clipboard-check',
            'evaluation_completed' => 'fas fa-star',
            'certificate_generated' => 'fas fa-certificate',
            'certificate_approved' => 'fas fa-award',
            'certificate_rejected' => 'fas fa-ban',
            'certificate_revoked' => 'fas fa-exclamation-triangle',
            'deadline_approaching' => 'fas fa-hourglass-half',
            'system_announcement' => 'fas fa-bullhorn',
            'maintenance_notice' => 'fas fa-tools',
            default => 'fas fa-bell'
        };
    }

    /**
     * Get category label
     */
    public function getCategoryLabelAttribute(): string
    {
        return match($this->category) {
            'application' => 'Pengajuan',
            'internship' => 'Magang',
            'attendance' => 'Absensi',
            'logbook' => 'Logbook',
            'evaluation' => 'Evaluasi',
            'certificate' => 'Sertifikat',
            'reminder' => 'Pengingat',
            'system' => 'Sistem',
            'announcement' => 'Pengumuman',
            default => 'Umum'
        };
    }

    /**
     * Get time ago format
     */
    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Get formatted created date
     */
    public function getFormattedDateAttribute(): string
    {
        return $this->created_at->format('d M Y, H:i');
    }

    /**
     * Check if notification is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if notification is urgent
     */
    public function isUrgent(): bool
    {
        return $this->priority >= 4;
    }

    /**
     * Check if notification is high priority
     */
    public function isHighPriority(): bool
    {
        return $this->priority >= 3;
    }

    /**
     * Check if notification has action
     */
    public function hasAction(): bool
    {
        return !empty($this->action_url) && !empty($this->action_text);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(): bool
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
            return true;
        }
        return false;
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread(): bool
    {
        if ($this->is_read) {
            $this->update([
                'is_read' => false,
                'read_at' => null,
            ]);
            return true;
        }
        return false;
    }

    /**
     * Get short message (truncated)
     */
    public function getShortMessageAttribute(): string
    {
        return strlen($this->message) > 100 
            ? substr($this->message, 0, 100) . '...' 
            : $this->message;
    }

    /**
     * Create notification for user
     */
    public static function createForUser(
        User $user, 
        string $title, 
        string $message, 
        string $type = 'general',
        array $options = []
    ): self {
        return self::create([
            'user_id' => $user->id,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $options['data'] ?? null,
            'action_url' => $options['action_url'] ?? null,
            'action_text' => $options['action_text'] ?? null,
            'priority' => $options['priority'] ?? 2,
            'expires_at' => $options['expires_at'] ?? null,
            'category' => $options['category'] ?? 'general',
            'sender_id' => $options['sender_id'] ?? null,
            'related_model_type' => $options['related_model_type'] ?? null,
            'related_model_id' => $options['related_model_id'] ?? null,
        ]);
    }

    /**
     * Create bulk notifications
     */
    public static function createBulk(array $users, string $title, string $message, string $type = 'general', array $options = []): int
    {
        $notifications = [];
        $timestamp = now();
        
        foreach ($users as $user) {
            $userId = is_object($user) ? $user->id : $user;
            
            $notifications[] = [
                'user_id' => $userId,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'data' => isset($options['data']) ? json_encode($options['data']) : null,
                'action_url' => $options['action_url'] ?? null,
                'action_text' => $options['action_text'] ?? null,
                'priority' => $options['priority'] ?? 2,
                'expires_at' => $options['expires_at'] ?? null,
                'category' => $options['category'] ?? 'general',
                'sender_id' => $options['sender_id'] ?? null,
                'related_model_type' => $options['related_model_type'] ?? null,
                'related_model_id' => $options['related_model_id'] ?? null,
                'is_read' => false,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }
        
        return self::insert($notifications) ? count($notifications) : 0;
    }

    /**
     * Create reminder notification
     */
    public static function createReminder(
        User $user,
        string $title,
        string $message,
        Carbon $reminderTime,
        array $options = []
    ): self {
        return self::createForUser($user, $title, $message, 'reminder', array_merge($options, [
            'category' => 'reminder',
            'priority' => $options['priority'] ?? 3,
            'expires_at' => $reminderTime->addDays(7), // Expire after 7 days
        ]));
    }

    /**
     * Create system announcement
     */
    public static function createSystemAnnouncement(
        string $title,
        string $message,
        array $options = []
    ): int {
        $users = User::active()->get();
        
        return self::createBulk($users, $title, $message, 'system_announcement', array_merge($options, [
            'category' => 'announcement',
            'priority' => $options['priority'] ?? 3,
        ]));
    }

    /**
     * Send deadline reminder notifications
     */
    public static function sendDeadlineReminders(): int
    {
        $count = 0;
        
        // Logbook deadline reminders (3 days before)
        $upcomingLogbooks = Logbook::where('tanggal', '=', now()->addDays(3)->toDateString())
            ->where('status', 'pending')
            ->with('pengajuanMagang.user')
            ->get();
        
        foreach ($upcomingLogbooks as $logbook) {
            self::createReminder(
                $logbook->pengajuanMagang->user,
                'Pengingat Logbook',
                'Jangan lupa mengisi logbook untuk tanggal ' . $logbook->tanggal->format('d M Y'),
                now(),
                [
                    'type' => 'logbook_reminder',
                    'category' => 'reminder',
                    'action_url' => route('logbook.create', $logbook->pengajuan_magang_id),
                    'action_text' => 'Isi Logbook',
                    'related_model_type' => Logbook::class,
                    'related_model_id' => $logbook->id,
                ]
            );
            $count++;
        }
        
        // Internship ending reminders (7 days before)
        $endingInternships = PengajuanMagang::where('tanggal_selesai', '=', now()->addDays(7)->toDateString())
            ->where('status', 'approved')
            ->with('user')
            ->get();
        
        foreach ($endingInternships as $internship) {
            self::createReminder(
                $internship->user,
                'Magang Akan Berakhir',
                'Magang Anda akan berakhir dalam 7 hari. Pastikan semua tugas telah diselesaikan.',
                now(),
                [
                    'type' => 'deadline_approaching',
                    'category' => 'internship',
                    'priority' => 3,
                    'related_model_type' => PengajuanMagang::class,
                    'related_model_id' => $internship->id,
                ]
            );
            $count++;
        }
        
        return $count;
    }

    /**
     * Clean up expired notifications
     */
    public static function cleanupExpired(): int
    {
        return self::where('expires_at', '<', now())->delete();
    }

    /**
     * Clean up old read notifications (older than 30 days)
     */
    public static function cleanupOldRead(int $days = 30): int
    {
        return self::where('is_read', true)
            ->where('read_at', '<', now()->subDays($days))
            ->delete();
    }

    /**
     * Scope: Unread notifications
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope: Read notifications
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * Scope: By type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: By category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope: High priority
     */
    public function scopeHighPriority($query)
    {
        return $query->where('priority', '>=', 3);
    }

    /**
     * Scope: Urgent
     */
    public function scopeUrgent($query)
    {
        return $query->where('priority', '>=', 4);
    }

    /**
     * Scope: Not expired
     */
    public function scopeNotExpired($query)
    {
        return $query->where(function($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    /**
     * Scope: Recent notifications (within specified days)
     */
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope: For user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Get notification statistics for user
     */
    public static function getStatisticsForUser(User $user): array
    {
        $notifications = self::where('user_id', $user->id);
        
        return [
            'total' => $notifications->count(),
            'unread' => $notifications->clone()->unread()->count(),
            'read' => $notifications->clone()->read()->count(),
            'high_priority' => $notifications->clone()->highPriority()->count(),
            'urgent' => $notifications->clone()->urgent()->count(),
            'recent' => $notifications->clone()->recent()->count(),
            'by_category' => $notifications->clone()
                ->selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->pluck('count', 'category')
                ->toArray(),
            'by_type' => $notifications->clone()
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
        ];
    }

    /**
     * Get system notification statistics
     */
    public static function getSystemStatistics(): array
    {
        return [
            'total_notifications' => self::count(),
            'unread_notifications' => self::unread()->count(),
            'high_priority_notifications' => self::highPriority()->count(),
            'urgent_notifications' => self::urgent()->count(),
            'notifications_today' => self::whereDate('created_at', today())->count(),
            'notifications_this_week' => self::where('created_at', '>=', now()->startOfWeek())->count(),
            'notifications_this_month' => self::where('created_at', '>=', now()->startOfMonth())->count(),
            'most_active_users' => self::selectRaw('user_id, COUNT(*) as notification_count')
                ->groupBy('user_id')
                ->orderByDesc('notification_count')
                ->limit(10)
                ->with('user:id,name')
                ->get()
                ->map(function($item) {
                    return [
                        'user' => $item->user->name,
                        'count' => $item->notification_count
                    ];
                }),
            'notification_types' => self::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->orderByDesc('count')
                ->pluck('count', 'type')
                ->toArray(),
        ];
    }
}