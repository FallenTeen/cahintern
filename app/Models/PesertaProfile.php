<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PesertaProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bidang_magang_id',
        'jenis_peserta',
        'nim_nisn',
        'asal_instansi',
        'jurusan',
        'semester_kelas',
        'alamat',
        'kota',
        'provinsi',
        'tanggal_lahir',
        'jenis_kelamin',
        'nama_pembimbing_sekolah',
        'no_hp_pembimbing_sekolah',

        'diterima_pada',
        'diterima_oleh',
        'alasan_tolak',
        'tanggal_mulai',
        'tanggal_selesai',
        'catatan_admin',

        'pengalaman',

        'cv',
        'surat_pengantar',
        'sertifikat_pendukung',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'diterima_pada' => 'date',
        'pengalaman' => 'array',
        'sertifikat_pendukung' => 'array',
    ];

    // Existing relationship
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // NEW: Add these relationships
    public function bidangMagang()
    {
        return $this->belongsTo(BidangMagang::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'diterima_oleh');
    }

    // NEW: Relationships to child tables
    public function absensi()
    {
        return $this->hasMany(Absensi::class);
    }

    public function logbook()
    {
        return $this->hasMany(Logbook::class);
    }

    public function penilaianAkhir()
    {
        return $this->hasOne(PenilaianAkhir::class);
    }

    public function sertifikat()
    {
        return $this->hasOne(Sertifikat::class);
    }

    // Existing methods
    public function getCv(): ?string
    {
        return $this->cv ? asset('storage/' . $this->cv) : null;
    }

    public function getSuratPengantar(): ?string
    {
        return $this->surat_pengantar ? asset('storage/' . $this->surat_pengantar) : null;
    }

    public function getEmail(): string
    {
        return $this->user->email ?? '';
    }

    public function isActive(): bool
    {
        if (!$this->tanggal_mulai || !$this->tanggal_selesai) {
            return false;
        }

        $now = Carbon::now();
        return $now->between($this->tanggal_mulai, $this->tanggal_selesai);
    }

    public function isCompleted(): bool
    {
        if (!$this->tanggal_selesai) {
            return false;
        }

        return Carbon::now()->gt($this->tanggal_selesai);
    }

    public function getStatus(): string
    {
        if (!$this->diterima_pada) {
            return 'pending';
        }

        if ($this->isCompleted()) {
            return 'selesai';
        }

        if ($this->isActive()) {
            return 'aktif';
        }

        if ($this->tanggal_mulai && Carbon::now()->lt($this->tanggal_mulai)) {
            return 'diterima';
        }

        return 'pending';
    }

    public function scopeActive($query)
    {
        return $query->whereNotNull('tanggal_mulai')
            ->whereNotNull('tanggal_selesai')
            ->whereDate('tanggal_mulai', '<=', Carbon::now())
            ->whereDate('tanggal_selesai', '>=', Carbon::now());
    }

    public function scopeCompleted($query)
    {
        return $query->whereNotNull('tanggal_selesai')
            ->whereDate('tanggal_selesai', '<', Carbon::now());
    }

    public function scopeApproved($query)
    {
        return $query->whereNotNull('diterima_pada');
    }

    public function scopePending($query)
    {
        return $query->whereNull('diterima_pada');
    }

    public function scopeByUniversitas($query, $university)
    {
        return $query->where('asal_instansi', 'like', '%' . $university . '%');
    }

    public function scopeByBidang($query, $bidangId)
    {
        return $query->where('bidang_magang_id', $bidangId);
    }
}
