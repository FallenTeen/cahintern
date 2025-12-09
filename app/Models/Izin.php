<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Izin extends Model
{
    use HasFactory;

    protected $table = 'izins';

    protected $fillable = [
        'peserta_profile_id',
        'tanggal',
        'jenis',
        'keterangan',
        'status',
        'lokasi',
        'waktu_mulai',
        'waktu_selesai',
        'project_url',
        'surat_tugas',
        'created_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'waktu_mulai' => 'time',
        'waktu_selesai' => 'time',
        'approved_at' => 'datetime',
    ];

    public function pesertaProfile()
    {
        return $this->belongsTo(PesertaProfile::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function overlapsWith(Izin $other): bool
    {
        if ($this->tanggal->ne($other->tanggal)) {
            return false;
        }
        if (!$this->waktu_mulai || !$this->waktu_selesai || !$other->waktu_mulai || !$other->waktu_selesai) {
            return false;
        }
        $aStart = Carbon::parse($this->tanggal->format('Y-m-d') . ' ' . $this->waktu_mulai);
        $aEnd = Carbon::parse($this->tanggal->format('Y-m-d') . ' ' . $this->waktu_selesai);
        $bStart = Carbon::parse($other->tanggal->format('Y-m-d') . ' ' . $other->waktu_mulai);
        $bEnd = Carbon::parse($other->tanggal->format('Y-m-d') . ' ' . $other->waktu_selesai);
        return $aStart < $bEnd && $bStart < $aEnd;
    }

    public function conflictsWithAbsensi(?Absensi $absensi): bool
    {
        if (!$absensi) {
            return false;
        }
        if ($absensi->tanggal->ne($this->tanggal)) {
            return false;
        }
        if (!$absensi->jam_masuk) {
            return false;
        }
        return in_array($absensi->status, ['hadir', 'terlambat']);
    }
}

