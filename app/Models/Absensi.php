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
        'peserta_profile_id',
        'tanggal',
        'jam_masuk',
        'jam_keluar',
        'status',
        'keterangan',
        'foto_masuk',
        'foto_keluar',
        'lokasi_masuk',
        'lokasi_keluar',
        'disetujui_oleh',
        'disetujui_pada',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jam_masuk' => 'datetime',
        'jam_keluar' => 'datetime',
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

    public function getStatusLabel(): string
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

    public function getFotoMasuk(): ?string
    {
        return $this->foto_masuk ? asset('storage/' . $this->foto_masuk) : null;
    }

    public function getFotoKeluarUrl(): ?string
    {
        return $this->foto_keluar ? asset('storage/' . $this->foto_keluar) : null;
    }

    public function isTelat(): bool
    {
        if (!$this->jam_masuk) {
            return false;
        }

        $workStartTime = Carbon::parse($this->tanggal->format('Y-m-d') . ' 08:00:00');
        return $this->jam_masuk->gt($workStartTime);
    }

    public function isPulangGasik(): bool
    {
        if (!$this->jam_keluar) {
            return false;
        }
        $workEndTime = Carbon::parse($this->tanggal->format('Y-m-d') . ' 17:00:00');
        return $this->jam_keluar->lt($workEndTime);
    }

    public function isBenar(): bool
    {
        return !is_null($this->jam_masuk) && !is_null($this->jam_keluar);
    }

    public function needsApproval(): bool
    {
        return in_array($this->status, ['izin', 'sakit']) && is_null($this->disetujui_oleh);
    }

    public function validasiWaktuKehadiran(): array
    {
        $errors = [];
        if ($this->tanggal->gt(Carbon::today())) {
            $errors[] = 'Tanggal absensi tidak boleh di masa depan';
        }
        if ($this->jam_masuk && $this->jam_keluar && $this->jam_keluar->lte($this->jam_masuk)) {
            $errors[] = 'Jam keluar harus setelah jam masuk';
        }
        if ($this->tanggal->isWeekend()) {
            $errors[] = 'Absensi pada hari weekend memerlukan persetujuan khusus';
        }

        return $errors;
    }

    public function approve(User $approver): bool
    {
        if (!$this->needsApproval()) {
            return false;
        }

        $this->update([
            'disetujui_oleh' => $approver->id,
            'disetujui_pada' => now(),
        ]);

        return true;
    }

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

    public function scopeByMonth($query, $year, $month)
    {
        return $query->whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month);
    }

    public function scopeNeedsApproval($query)
    {
        return $query->whereIn('status', ['izin', 'sakit'])
            ->whereNull('disetujui_oleh');
    }
}
