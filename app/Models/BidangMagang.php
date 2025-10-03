<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BidangMagang extends Model
{
    use HasFactory;

    protected $table = 'bidang_magang';

    protected $fillable = [
        'nama_bidang',
        'deskripsi',
        'requirements',
        'kuota',
        'durasi_bulan',
        'mentor',
        'lokasi',
        'status',
        'skills_required',
        'benefits',
        'jadwal_kerja',
        'contact_person',
        'contact_email',
        'contact_phone',
    ];

    protected $casts = [
        'requirements' => 'array',
        'skills_required' => 'array',
        'benefits' => 'array',
        'jadwal_kerja' => 'array',
    ];

    /**
     * Relationship: BidangMagang has many PengajuanMagang
     */
    public function pengajuanMagang()
    {
        return $this->hasMany(PengajuanMagang::class);
    }

    /**
     * Get approved pengajuan count
     */
    public function getApprovedPengajuanCountAttribute(): int
    {
        return $this->pengajuanMagang()
            ->where('status', 'approved')
            ->count();
    }

    /**
     * Get pending pengajuan count
     */
    public function getPendingPengajuanCountAttribute(): int
    {
        return $this->pengajuanMagang()
            ->where('status', 'pending')
            ->count();
    }

    /**
     * Get available slots
     */
    public function getAvailableSlotsAttribute(): int
    {
        return max(0, $this->kuota - $this->approved_pengajuan_count);
    }

    /**
     * Check if bidang is full
     */
    public function isFull(): bool
    {
        return $this->available_slots <= 0;
    }

    /**
     * Check if bidang is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get formatted requirements as string
     */
    public function getFormattedRequirementsAttribute(): string
    {
        if (is_array($this->requirements)) {
            return implode(', ', $this->requirements);
        }
        return $this->requirements ?? '';
    }

    /**
     * Get formatted skills required as string
     */
    public function getFormattedSkillsRequiredAttribute(): string
    {
        if (is_array($this->skills_required)) {
            return implode(', ', $this->skills_required);
        }
        return $this->skills_required ?? '';
    }

    /**
     * Get formatted benefits as string
     */
    public function getFormattedBenefitsAttribute(): string
    {
        if (is_array($this->benefits)) {
            return implode(', ', $this->benefits);
        }
        return $this->benefits ?? '';
    }

    /**
     * Get short description (truncated)
     */
    public function getShortDescriptionAttribute(): string
    {
        return strlen($this->deskripsi) > 100 
            ? substr($this->deskripsi, 0, 100) . '...' 
            : $this->deskripsi;
    }

    /**
     * Scope: Only active bidang
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: Available bidang (not full)
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'active')
            ->whereRaw('kuota > (
                SELECT COUNT(*) 
                FROM pengajuan_magang 
                WHERE bidang_magang_id = bidang_magang.id 
                AND status = "approved"
            )');
    }

    /**
     * Scope: Filter by duration
     */
    public function scopeByDuration($query, $duration)
    {
        return $query->where('durasi_bulan', $duration);
    }

    /**
     * Scope: Filter by location
     */
    public function scopeByLocation($query, $location)
    {
        return $query->where('lokasi', 'like', '%' . $location . '%');
    }

    /**
     * Scope: Search by name or description
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nama_bidang', 'like', '%' . $search . '%')
              ->orWhere('deskripsi', 'like', '%' . $search . '%')
              ->orWhere('mentor', 'like', '%' . $search . '%');
        });
    }

    /**
     * Get popularity score based on applications
     */
    public function getPopularityScoreAttribute(): int
    {
        return $this->pengajuanMagang()->count();
    }

    /**
     * Get success rate (approved/total applications)
     */
    public function getSuccessRateAttribute(): float
    {
        $total = $this->pengajuanMagang()->count();
        if ($total === 0) return 0;
        
        $approved = $this->pengajuanMagang()->where('status', 'approved')->count();
        return round(($approved / $total) * 100, 2);
    }

    /**
     * Check if user can apply to this bidang
     */
    public function canUserApply(User $user): bool
    {
        // Check if bidang is active
        if (!$this->isActive()) {
            return false;
        }

        // Check if bidang is full
        if ($this->isFull()) {
            return false;
        }

        // Check if user already has pending/approved application for this bidang
        $existingApplication = $this->pengajuanMagang()
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        return !$existingApplication;
    }

    /**
     * Get current active participants
     */
    public function getCurrentParticipants()
    {
        return $this->pengajuanMagang()
            ->with('user.pesertaProfile')
            ->where('status', 'approved')
            ->get();
    }
}