<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PengajuanMagang extends Model
{
    use HasFactory;

    protected $table = 'pengajuan_magang';

    protected $fillable = [
        'user_id',
        'bidang_magang_id',
        'tanggal_mulai',
        'tanggal_selesai',
        'status',
        'alasan_pengajuan',
        'dokumen_pendukung',
        'approved_by',
        'approved_at',
        'rejected_reason',
        'notes',
        'priority_level',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'approved_at' => 'datetime',
        'dokumen_pendukung' => 'array',
    ];

    /**
     * Relationship: PengajuanMagang belongs to User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: PengajuanMagang belongs to BidangMagang
     */
    public function bidangMagang()
    {
        return $this->belongsTo(BidangMagang::class);
    }

    /**
     * Relationship: PengajuanMagang belongs to User (approved by)
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Relationship: PengajuanMagang has many Absensi
     */
    public function absensi()
    {
        return $this->hasMany(Absensi::class);
    }

    /**
     * Relationship: PengajuanMagang has many Logbook
     */
    public function logbook()
    {
        return $this->hasMany(Logbook::class);
    }

    /**
     * Relationship: PengajuanMagang has one PenilaianAkhir
     */
    public function penilaianAkhir()
    {
        return $this->hasOne(PenilaianAkhir::class);
    }

    /**
     * Relationship: PengajuanMagang has one Sertifikat
     */
    public function sertifikat()
    {
        return $this->hasOne(Sertifikat::class);
    }

    /**
     * Get duration in days
     */
    public function getDurationInDaysAttribute(): int
    {
        if (!$this->tanggal_mulai || !$this->tanggal_selesai) {
            return 0;
        }
        
        return $this->tanggal_mulai->diffInDays($this->tanggal_selesai) + 1;
    }

    /**
     * Get duration in months
     */
    public function getDurationInMonthsAttribute(): float
    {
        if (!$this->tanggal_mulai || !$this->tanggal_selesai) {
            return 0;
        }
        
        return round($this->tanggal_mulai->diffInMonths($this->tanggal_selesai, true), 1);
    }

    /**
     * Get remaining days
     */
    public function getRemainingDaysAttribute(): int
    {
        if (!$this->tanggal_selesai || $this->status !== 'approved') {
            return 0;
        }
        
        $today = Carbon::today();
        if ($today->gt($this->tanggal_selesai)) {
            return 0;
        }
        
        return $today->diffInDays($this->tanggal_selesai);
    }

    /**
     * Get progress percentage
     */
    public function getProgressPercentageAttribute(): float
    {
        if (!$this->tanggal_mulai || !$this->tanggal_selesai || $this->status !== 'approved') {
            return 0;
        }
        
        $today = Carbon::today();
        $totalDays = $this->duration_in_days;
        
        if ($today->lt($this->tanggal_mulai)) {
            return 0;
        }
        
        if ($today->gt($this->tanggal_selesai)) {
            return 100;
        }
        
        $daysPassed = $this->tanggal_mulai->diffInDays($today) + 1;
        return round(($daysPassed / $totalDays) * 100, 2);
    }

    /**
     * Check if internship is active
     */
    public function isActive(): bool
    {
        if ($this->status !== 'approved') {
            return false;
        }
        
        $today = Carbon::today();
        return $today->between($this->tanggal_mulai, $this->tanggal_selesai);
    }

    /**
     * Check if internship is completed
     */
    public function isCompleted(): bool
    {
        if ($this->status !== 'approved') {
            return false;
        }
        
        return Carbon::today()->gt($this->tanggal_selesai);
    }

    /**
     * Check if internship is upcoming
     */
    public function isUpcoming(): bool
    {
        if ($this->status !== 'approved') {
            return false;
        }
        
        return Carbon::today()->lt($this->tanggal_mulai);
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
            'completed' => 'badge-info',
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
            'completed' => 'Selesai',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get dokumen pendukung URLs
     */
    public function getDokumenPendukungUrlsAttribute(): array
    {
        if (!is_array($this->dokumen_pendukung)) {
            return [];
        }
        
        return array_map(function($doc) {
            return asset('storage/' . $doc);
        }, $this->dokumen_pendukung);
    }

    /**
     * Approve pengajuan
     */
    public function approve(User $approver, string $notes = null): bool
    {
        // Check if bidang still has available slots
        if ($this->bidangMagang->isFull()) {
            return false;
        }
        
        $this->update([
            'status' => 'approved',
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'notes' => $notes,
        ]);
        
        // Create notification for user
        Notifikasi::create([
            'user_id' => $this->user_id,
            'title' => 'Pengajuan Magang Disetujui',
            'message' => "Pengajuan magang Anda untuk bidang {$this->bidangMagang->nama_bidang} telah disetujui.",
            'type' => 'approval',
            'is_read' => false,
        ]);
        
        return true;
    }

    /**
     * Reject pengajuan
     */
    public function reject(User $rejector, string $reason): bool
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $rejector->id,
            'approved_at' => now(),
            'rejected_reason' => $reason,
        ]);
        
        // Create notification for user
        Notifikasi::create([
            'user_id' => $this->user_id,
            'title' => 'Pengajuan Magang Ditolak',
            'message' => "Pengajuan magang Anda untuk bidang {$this->bidangMagang->nama_bidang} ditolak. Alasan: {$reason}",
            'type' => 'rejection',
            'is_read' => false,
        ]);
        
        return true;
    }

    /**
     * Complete pengajuan
     */
    public function complete(): bool
    {
        if (!$this->isCompleted()) {
            return false;
        }
        
        $this->update(['status' => 'completed']);
        
        // Create notification for user
        Notifikasi::create([
            'user_id' => $this->user_id,
            'title' => 'Magang Selesai',
            'message' => "Selamat! Magang Anda di bidang {$this->bidangMagang->nama_bidang} telah selesai.",
            'type' => 'completion',
            'is_read' => false,
        ]);
        
        return true;
    }

    /**
     * Get attendance rate
     */
    public function getAttendanceRateAttribute(): float
    {
        $totalDays = $this->absensi()->count();
        if ($totalDays === 0) return 0;
        
        $presentDays = $this->absensi()->where('status', 'hadir')->count();
        return round(($presentDays / $totalDays) * 100, 2);
    }

    /**
     * Get logbook completion rate
     */
    public function getLogbookCompletionRateAttribute(): float
    {
        $totalLogbooks = $this->logbook()->count();
        if ($totalLogbooks === 0) return 0;
        
        $approvedLogbooks = $this->logbook()->where('status', 'approved')->count();
        return round(($approvedLogbooks / $totalLogbooks) * 100, 2);
    }

    /**
     * Scope: Only pending applications
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Only approved applications
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope: Only rejected applications
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope: Only completed applications
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope: Active internships
     */
    public function scopeActive($query)
    {
        $today = Carbon::today();
        return $query->where('status', 'approved')
            ->where('tanggal_mulai', '<=', $today)
            ->where('tanggal_selesai', '>=', $today);
    }

    /**
     * Scope: Upcoming internships
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', 'approved')
            ->where('tanggal_mulai', '>', Carbon::today());
    }

    /**
     * Scope: Filter by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_mulai', [$startDate, $endDate]);
    }

    /**
     * Scope: Filter by bidang
     */
    public function scopeByBidang($query, $bidangId)
    {
        return $query->where('bidang_magang_id', $bidangId);
    }
}