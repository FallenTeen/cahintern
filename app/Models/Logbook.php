<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Logbook extends Model
{
    use HasFactory;

    protected $table = 'logbooks';

    protected $fillable = [
        'peserta_profile_id',
        'tanggal',
        'kegiatan',
        'deskripsi',
        'jam_mulai',
        'jam_selesai',
        'status',
        'dokumentasi',
        'catatan_pembimbing',
        'disetujui_oleh',
        'disetujui_pada',
        'masalah',
        'solusi',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jam_mulai' => 'datetime',
        'jam_selesai' => 'datetime',
        'disetujui_pada' => 'datetime',
    ];
    public function pesertaProfile()
    {
        return $this->belongsTo(PesertaProfile::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }

    public function getDurationInHoursAttribute(): float
    {
        if (!$this->jam_mulai || !$this->jam_selesai) {
            return 0;
        }

        return round($this->jam_mulai->diffInHours($this->jam_selesai, true), 2);
    }

    public function getDurationInMinutesAttribute(): int
    {
        if (!$this->jam_mulai || !$this->jam_selesai) {
            return 0;
        }

        return $this->jam_mulai->diffInMinutes($this->jam_selesai);
    }

    public function getFormattedDurationAttribute(): string
    {
        if (!$this->jam_mulai || !$this->jam_selesai) {
            return '0 jam 0 menit';
        }

        $hours = floor($this->duration_in_minutes / 60);
        $minutes = $this->duration_in_minutes % 60;

        return "{$hours} jam {$minutes} menit";
    }

    public function getStatusBadgeClassAttribute(): string
    {
        return match($this->status) {
            'pending' => 'badge-warning',
            'disetujui' => 'badge-success',
            'ditolak' => 'badge-danger',
            'revision' => 'badge-info',
            default => 'badge-secondary'
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Menunggu Persetujuan',
            'disetujui' => 'Disetujui',
            'ditolak' => 'Ditolak',
            'revision' => 'Perlu Revisi',
            default => 'Tidak Diketahui'
        };
    }

    public function isEditable(): bool
    {
        return in_array($this->status, ['pending', 'revision']);
    }

    public function needsApproval(): bool
    {
        return $this->status === 'pending';
    }

    public function isOverdue(): bool
    {
        $deadline = $this->tanggal->addDays(2);
        return $this->created_at->gt($deadline);
    }

    public function validateLogbook(): array
    {
        $errors = [];

        if ($this->tanggal->gt(Carbon::today())) {
            $errors[] = 'Tanggal kegiatan tidak boleh di masa depan';
        }

        if ($this->jam_mulai && $this->jam_selesai && $this->jam_selesai->lte($this->jam_mulai)) {
            $errors[] = 'Jam selesai harus setelah jam mulai';
        }

        if ($this->duration_in_hours > 12) {
            $errors[] = 'Durasi kegiatan tidak boleh lebih dari 12 jam';
        }

        if (strlen($this->deskripsi) < 50) {
            $errors[] = 'Deskripsi kegiatan minimal 50 karakter';
        }

        if (empty(trim($this->kegiatan))) {
            $errors[] = 'Nama kegiatan tidak boleh kosong';
        }

        return $errors;
    }

    public function approve(User $approver, string $feedback = null, int $rating = null): bool
    {
        $this->update([
            'status' => 'disetujui',
            'disetujui_oleh' => $approver->id,
            'disetujui_pada' => now(),
            'catatan_pembimbing' => $feedback,
        ]);
        Notifikasi::create([
            'user_id' => $this->pesertaProfile->user_id,
            'judul' => 'Logbook Disetujui',
            'pesan' => "Logbook Anda untuk tanggal {$this->tanggal->format('d/m/Y')} telah disetujui.",
            'tipe' => 'success',
            'dibaca' => false,
        ]);

        return true;
    }

    public function reject(User $rejector, string $feedback): bool
    {
        $this->update([
            'status' => 'ditolak',
            'disetujui_oleh' => $rejector->id,
            'disetujui_pada' => now(),
            'catatan_pembimbing' => $feedback,
        ]);
        Notifikasi::create([
            'user_id' => $this->pesertaProfile->user_id,
            'judul' => 'Logbook Ditolak',
            'pesan' => "Logbook Anda untuk tanggal {$this->tanggal->format('d/m/Y')} ditolak. Feedback: {$feedback}",
            'tipe' => 'danger',
            'dibaca' => false,
        ]);

        return true;
    }

    public function requestRevision(User $reviewer, string $feedback): bool
    {
        $this->update([
            'status' => 'revision',
            'disetujui_oleh' => $reviewer->id,
            'disetujui_pada' => now(),
            'catatan_pembimbing' => $feedback,
        ]);
        Notifikasi::create([
            'user_id' => $this->pesertaProfile->user_id,
            'judul' => 'Logbook Perlu Revisi',
            'pesan' => "Logbook Anda untuk tanggal {$this->tanggal->format('d/m/Y')} perlu direvisi. Feedback: {$feedback}",
            'tipe' => 'warning',
            'dibaca' => false,
        ]);

        return true;
    }

    public function submitForReview(): bool
    {
        if ($this->status !== 'revision') {
            return false;
        }

        $this->update([
            'status' => 'pending',
            'disetujui_oleh' => null,
            'disetujui_pada' => null,
        ]);

        return true;
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'disetujui');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'ditolak');
    }

    public function scopeNeedsRevision($query)
    {
        return $query->where('status', 'revision');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal', [$startDate, $endDate]);
    }

    public function scopeByMonth($query, $year, $month)
    {
        return $query->whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month);
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'pending')
            ->whereRaw('created_at > DATE_ADD(tanggal, INTERVAL 2 DAY)');
    }

    public static function getStatisticsForPeriod($pesertaProfileId, $startDate, $endDate): array
    {
        $logbooks = self::where('peserta_profile_id', $pesertaProfileId)
            ->byDateRange($startDate, $endDate)
            ->get();

        return [
            'total_entries' => $logbooks->count(),
            'approved_entries' => $logbooks->where('status', 'disetujui')->count(),
            'pending_entries' => $logbooks->where('status', 'pending')->count(),
            'rejected_entries' => $logbooks->where('status', 'ditolak')->count(),
            'revision_entries' => $logbooks->where('status', 'revision')->count(),
            'total_hours' => $logbooks->sum('duration_in_hours'),
            'approval_rate' => $logbooks->count() > 0
                ? round(($logbooks->where('status', 'disetujui')->count() / $logbooks->count()) * 100, 2)
                : 0,
        ];
    }
}
