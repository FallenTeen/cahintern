<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Logbook extends Model
{
    use HasFactory;

    protected $table = 'logbook';

    protected $fillable = [
        'pengajuan_magang_id',
        'tanggal',
        'kegiatan',
        'deskripsi',
        'jam_mulai',
        'jam_selesai',
        'status',
        'feedback',
        'approved_by',
        'approved_at',
        'attachments',
        'learning_outcomes',
        'challenges',
        'solutions',
        'rating',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jam_mulai' => 'datetime',
        'jam_selesai' => 'datetime',
        'approved_at' => 'datetime',
        'attachments' => 'array',
        'learning_outcomes' => 'array',
        'challenges' => 'array',
        'solutions' => 'array',
        'rating' => 'integer',
    ];

    /**
     * Relationship: Logbook belongs to PengajuanMagang
     */
    public function pengajuanMagang()
    {
        return $this->belongsTo(PengajuanMagang::class);
    }

    /**
     * Relationship: Logbook belongs to User (approved by)
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get duration in hours
     */
    public function getDurationInHoursAttribute(): float
    {
        if (!$this->jam_mulai || !$this->jam_selesai) {
            return 0;
        }
        
        return round($this->jam_mulai->diffInHours($this->jam_selesai, true), 2);
    }

    /**
     * Get duration in minutes
     */
    public function getDurationInMinutesAttribute(): int
    {
        if (!$this->jam_mulai || !$this->jam_selesai) {
            return 0;
        }
        
        return $this->jam_mulai->diffInMinutes($this->jam_selesai);
    }

    /**
     * Get formatted duration
     */
    public function getFormattedDurationAttribute(): string
    {
        if (!$this->jam_mulai || !$this->jam_selesai) {
            return '0 jam 0 menit';
        }
        
        $hours = floor($this->duration_in_minutes / 60);
        $minutes = $this->duration_in_minutes % 60;
        
        return "{$hours} jam {$minutes} menit";
    }

    /**
     * Get status badge class
     */
    public function getStatusBadgeClassAttribute(): string
    {
        return match($this->status) {
            'pending' => 'badge-warning',
            'approved' => 'badge-success',
            'rejected' => 'badge-danger',
            'revision' => 'badge-info',
            default => 'badge-secondary'
        };
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Menunggu Persetujuan',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'revision' => 'Perlu Revisi',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get attachment URLs
     */
    public function getAttachmentUrlsAttribute(): array
    {
        if (!is_array($this->attachments)) {
            return [];
        }
        
        return array_map(function($attachment) {
            return asset('storage/' . $attachment);
        }, $this->attachments);
    }

    /**
     * Get short description
     */
    public function getShortDescriptionAttribute(): string
    {
        return strlen($this->deskripsi) > 100 
            ? substr($this->deskripsi, 0, 100) . '...' 
            : $this->deskripsi;
    }

    /**
     * Get rating stars
     */
    public function getRatingStarsAttribute(): string
    {
        if (!$this->rating) return '';
        
        $stars = '';
        for ($i = 1; $i <= 5; $i++) {
            $stars .= $i <= $this->rating ? '★' : '☆';
        }
        
        return $stars;
    }

    /**
     * Check if logbook is editable
     */
    public function isEditable(): bool
    {
        return in_array($this->status, ['pending', 'revision']);
    }

    /**
     * Check if logbook needs approval
     */
    public function needsApproval(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if logbook is overdue (submitted late)
     */
    public function isOverdue(): bool
    {
        // Assuming logbook should be submitted within 2 days of the activity
        $deadline = $this->tanggal->addDays(2);
        return $this->created_at->gt($deadline);
    }

    /**
     * Validate logbook data
     */
    public function validateLogbook(): array
    {
        $errors = [];
        
        // Check if date is not in the future
        if ($this->tanggal->gt(Carbon::today())) {
            $errors[] = 'Tanggal kegiatan tidak boleh di masa depan';
        }
        
        // Check if jam_selesai is after jam_mulai
        if ($this->jam_mulai && $this->jam_selesai && $this->jam_selesai->lte($this->jam_mulai)) {
            $errors[] = 'Jam selesai harus setelah jam mulai';
        }
        
        // Check duration (max 12 hours)
        if ($this->duration_in_hours > 12) {
            $errors[] = 'Durasi kegiatan tidak boleh lebih dari 12 jam';
        }
        
        // Check minimum description length
        if (strlen($this->deskripsi) < 50) {
            $errors[] = 'Deskripsi kegiatan minimal 50 karakter';
        }
        
        // Check if kegiatan is not empty
        if (empty(trim($this->kegiatan))) {
            $errors[] = 'Nama kegiatan tidak boleh kosong';
        }
        
        return $errors;
    }

    /**
     * Approve logbook
     */
    public function approve(User $approver, string $feedback = null, int $rating = null): bool
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'feedback' => $feedback,
            'rating' => $rating,
        ]);
        
        // Create notification for user
        Notifikasi::create([
            'user_id' => $this->pengajuanMagang->user_id,
            'title' => 'Logbook Disetujui',
            'message' => "Logbook Anda untuk tanggal {$this->tanggal->format('d/m/Y')} telah disetujui.",
            'type' => 'logbook_approval',
            'is_read' => false,
        ]);
        
        return true;
    }

    /**
     * Reject logbook
     */
    public function reject(User $rejector, string $feedback): bool
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $rejector->id,
            'approved_at' => now(),
            'feedback' => $feedback,
        ]);
        
        // Create notification for user
        Notifikasi::create([
            'user_id' => $this->pengajuanMagang->user_id,
            'title' => 'Logbook Ditolak',
            'message' => "Logbook Anda untuk tanggal {$this->tanggal->format('d/m/Y')} ditolak. Feedback: {$feedback}",
            'type' => 'logbook_rejection',
            'is_read' => false,
        ]);
        
        return true;
    }

    /**
     * Request revision
     */
    public function requestRevision(User $reviewer, string $feedback): bool
    {
        $this->update([
            'status' => 'revision',
            'approved_by' => $reviewer->id,
            'approved_at' => now(),
            'feedback' => $feedback,
        ]);
        
        // Create notification for user
        Notifikasi::create([
            'user_id' => $this->pengajuanMagang->user_id,
            'title' => 'Logbook Perlu Revisi',
            'message' => "Logbook Anda untuk tanggal {$this->tanggal->format('d/m/Y')} perlu direvisi. Feedback: {$feedback}",
            'type' => 'logbook_revision',
            'is_read' => false,
        ]);
        
        return true;
    }

    /**
     * Submit for review (change status from revision to pending)
     */
    public function submitForReview(): bool
    {
        if ($this->status !== 'revision') {
            return false;
        }
        
        $this->update([
            'status' => 'pending',
            'approved_by' => null,
            'approved_at' => null,
        ]);
        
        return true;
    }

    /**
     * Get productivity score based on duration and rating
     */
    public function getProductivityScoreAttribute(): float
    {
        if (!$this->rating || $this->duration_in_hours === 0) {
            return 0;
        }
        
        // Score = (rating / 5) * (duration / 8) * 100
        // Assuming 8 hours is the standard working day
        $ratingScore = $this->rating / 5;
        $durationScore = min($this->duration_in_hours / 8, 1); // Cap at 1 for 8+ hours
        
        return round($ratingScore * $durationScore * 100, 2);
    }

    /**
     * Scope: Only pending logbooks
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Only approved logbooks
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope: Only rejected logbooks
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope: Needs revision
     */
    public function scopeNeedsRevision($query)
    {
        return $query->where('status', 'revision');
    }

    /**
     * Scope: Filter by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal', [$startDate, $endDate]);
    }

    /**
     * Scope: Filter by month
     */
    public function scopeByMonth($query, $year, $month)
    {
        return $query->whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month);
    }

    /**
     * Scope: Overdue logbooks
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'pending')
            ->whereRaw('created_at > DATE_ADD(tanggal, INTERVAL 2 DAY)');
    }

    /**
     * Scope: High rated logbooks
     */
    public function scopeHighRated($query, $minRating = 4)
    {
        return $query->where('rating', '>=', $minRating);
    }

    /**
     * Get logbook statistics for a period
     */
    public static function getStatisticsForPeriod($pengajuanMagangId, $startDate, $endDate): array
    {
        $logbooks = self::where('pengajuan_magang_id', $pengajuanMagangId)
            ->byDateRange($startDate, $endDate)
            ->get();
        
        return [
            'total_entries' => $logbooks->count(),
            'approved_entries' => $logbooks->where('status', 'approved')->count(),
            'pending_entries' => $logbooks->where('status', 'pending')->count(),
            'rejected_entries' => $logbooks->where('status', 'rejected')->count(),
            'revision_entries' => $logbooks->where('status', 'revision')->count(),
            'total_hours' => $logbooks->sum('duration_in_hours'),
            'average_rating' => $logbooks->where('rating', '>', 0)->avg('rating') ?: 0,
            'approval_rate' => $logbooks->count() > 0 
                ? round(($logbooks->where('status', 'approved')->count() / $logbooks->count()) * 100, 2)
                : 0,
            'average_productivity_score' => $logbooks->avg('productivity_score') ?: 0,
        ];
    }
}