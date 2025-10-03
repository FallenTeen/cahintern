<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Absensi extends Model
{
    use HasFactory;

    protected $table = 'absensi';

    protected $fillable = [
        'pengajuan_magang_id',
        'tanggal',
        'jam_masuk',
        'jam_keluar',
        'status',
        'keterangan',
        'foto_masuk',
        'foto_keluar',
        'lokasi_masuk',
        'lokasi_keluar',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jam_masuk' => 'datetime',
        'jam_keluar' => 'datetime',
        'approved_at' => 'datetime',
    ];

    /**
     * Relationship: Absensi belongs to PengajuanMagang
     */
    public function pengajuanMagang()
    {
        return $this->belongsTo(PengajuanMagang::class);
    }

    /**
     * Relationship: Absensi belongs to User (approved by)
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get working hours
     */
    public function getWorkingHoursAttribute(): float
    {
        if (!$this->jam_masuk || !$this->jam_keluar) {
            return 0;
        }
        
        return round($this->jam_masuk->diffInHours($this->jam_keluar, true), 2);
    }

    /**
     * Get working minutes
     */
    public function getWorkingMinutesAttribute(): int
    {
        if (!$this->jam_masuk || !$this->jam_keluar) {
            return 0;
        }
        
        return $this->jam_masuk->diffInMinutes($this->jam_keluar);
    }

    /**
     * Get formatted working time
     */
    public function getFormattedWorkingTimeAttribute(): string
    {
        if (!$this->jam_masuk || !$this->jam_keluar) {
            return '0 jam 0 menit';
        }
        
        $hours = floor($this->working_minutes / 60);
        $minutes = $this->working_minutes % 60;
        
        return "{$hours} jam {$minutes} menit";
    }

    /**
     * Get status badge class
     */
    public function getStatusBadgeClassAttribute(): string
    {
        return match($this->status) {
            'hadir' => 'badge-success',
            'izin' => 'badge-warning',
            'sakit' => 'badge-info',
            'alpha' => 'badge-danger',
            'terlambat' => 'badge-warning',
            default => 'badge-secondary'
        };
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'hadir' => 'Hadir',
            'izin' => 'Izin',
            'sakit' => 'Sakit',
            'alpha' => 'Alpha',
            'terlambat' => 'Terlambat',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get foto masuk URL
     */
    public function getFotoMasukUrlAttribute(): ?string
    {
        return $this->foto_masuk ? asset('storage/' . $this->foto_masuk) : null;
    }

    /**
     * Get foto keluar URL
     */
    public function getFotoKeluarUrlAttribute(): ?string
    {
        return $this->foto_keluar ? asset('storage/' . $this->foto_keluar) : null;
    }

    /**
     * Check if attendance is late
     */
    public function isLate(): bool
    {
        if (!$this->jam_masuk) {
            return false;
        }
        
        // Assuming work starts at 08:00
        $workStartTime = Carbon::parse($this->tanggal->format('Y-m-d') . ' 08:00:00');
        return $this->jam_masuk->gt($workStartTime);
    }

    /**
     * Check if attendance is early leave
     */
    public function isEarlyLeave(): bool
    {
        if (!$this->jam_keluar) {
            return false;
        }
        
        // Assuming work ends at 17:00
        $workEndTime = Carbon::parse($this->tanggal->format('Y-m-d') . ' 17:00:00');
        return $this->jam_keluar->lt($workEndTime);
    }

    /**
     * Check if attendance is complete (has both check-in and check-out)
     */
    public function isComplete(): bool
    {
        return !is_null($this->jam_masuk) && !is_null($this->jam_keluar);
    }

    /**
     * Check if attendance needs approval
     */
    public function needsApproval(): bool
    {
        return in_array($this->status, ['izin', 'sakit']) && is_null($this->approved_by);
    }

    /**
     * Validate attendance time
     */
    public function validateAttendanceTime(): array
    {
        $errors = [];
        
        // Check if date is not in the future
        if ($this->tanggal->gt(Carbon::today())) {
            $errors[] = 'Tanggal absensi tidak boleh di masa depan';
        }
        
        // Check if jam_keluar is after jam_masuk
        if ($this->jam_masuk && $this->jam_keluar && $this->jam_keluar->lte($this->jam_masuk)) {
            $errors[] = 'Jam keluar harus setelah jam masuk';
        }
        
        // Check working hours (max 12 hours)
        if ($this->working_hours > 12) {
            $errors[] = 'Jam kerja tidak boleh lebih dari 12 jam';
        }
        
        // Check if attendance is on weekend (assuming Saturday and Sunday are weekends)
        if ($this->tanggal->isWeekend()) {
            $errors[] = 'Absensi pada hari weekend memerlukan persetujuan khusus';
        }
        
        return $errors;
    }

    /**
     * Approve attendance
     */
    public function approve(User $approver): bool
    {
        if (!$this->needsApproval()) {
            return false;
        }
        
        $this->update([
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]);
        
        return true;
    }

    /**
     * Check in
     */
    public function checkIn(string $foto = null, string $lokasi = null): bool
    {
        if ($this->jam_masuk) {
            return false; // Already checked in
        }
        
        $now = now();
        $status = $this->isLate() ? 'terlambat' : 'hadir';
        
        $this->update([
            'jam_masuk' => $now,
            'status' => $status,
            'foto_masuk' => $foto,
            'lokasi_masuk' => $lokasi,
        ]);
        
        return true;
    }

    /**
     * Check out
     */
    public function checkOut(string $foto = null, string $lokasi = null): bool
    {
        if (!$this->jam_masuk || $this->jam_keluar) {
            return false; // Not checked in or already checked out
        }
        
        $this->update([
            'jam_keluar' => now(),
            'foto_keluar' => $foto,
            'lokasi_keluar' => $lokasi,
        ]);
        
        return true;
    }

    /**
     * Mark as absent with reason
     */
    public function markAbsent(string $status, string $keterangan = null): bool
    {
        if (!in_array($status, ['izin', 'sakit', 'alpha'])) {
            return false;
        }
        
        $this->update([
            'status' => $status,
            'keterangan' => $keterangan,
        ]);
        
        return true;
    }

    /**
     * Scope: Only present attendances
     */
    public function scopePresent($query)
    {
        return $query->whereIn('status', ['hadir', 'terlambat']);
    }

    /**
     * Scope: Only absent attendances
     */
    public function scopeAbsent($query)
    {
        return $query->whereIn('status', ['izin', 'sakit', 'alpha']);
    }

    /**
     * Scope: Only late attendances
     */
    public function scopeLate($query)
    {
        return $query->where('status', 'terlambat');
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
     * Scope: Needs approval
     */
    public function scopeNeedsApproval($query)
    {
        return $query->whereIn('status', ['izin', 'sakit'])
            ->whereNull('approved_by');
    }

    /**
     * Scope: Complete attendances (has both check-in and check-out)
     */
    public function scopeComplete($query)
    {
        return $query->whereNotNull('jam_masuk')
            ->whereNotNull('jam_keluar');
    }

    /**
     * Get attendance summary for a period
     */
    public static function getSummaryForPeriod($pengajuanMagangId, $startDate, $endDate): array
    {
        $attendances = self::where('pengajuan_magang_id', $pengajuanMagangId)
            ->byDateRange($startDate, $endDate)
            ->get();
        
        return [
            'total_days' => $attendances->count(),
            'present_days' => $attendances->where('status', 'hadir')->count(),
            'late_days' => $attendances->where('status', 'terlambat')->count(),
            'absent_days' => $attendances->whereIn('status', ['izin', 'sakit', 'alpha'])->count(),
            'total_working_hours' => $attendances->sum('working_hours'),
            'average_working_hours' => $attendances->avg('working_hours') ?: 0,
            'attendance_rate' => $attendances->count() > 0 
                ? round(($attendances->whereIn('status', ['hadir', 'terlambat'])->count() / $attendances->count()) * 100, 2)
                : 0,
        ];
    }
}