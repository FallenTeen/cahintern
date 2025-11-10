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
        'kuota',
        'is_active',
        'gambar_utama',
        'gambar_deskriptif',
        'slug',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'gambar_deskriptif' => 'array',
    ];
    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function pesertaProfiles()
    {
        return $this->hasMany(PesertaProfile::class);
    }

    public function getJumlahPesertaAktif(): int
    {
        return $this->pesertaProfiles()
            ->whereNotNull('diterima_pada')
            ->whereDate('tanggal_mulai', '<=', now())
            ->whereDate('tanggal_selesai', '>=', now())
            ->count();
    }

    public function getJumlahPesertaPending(): int
    {
        return $this->pesertaProfiles()
            ->whereNull('diterima_pada')
            ->count();
    }

    public function getSlotTersedia(): int
    {
        $terpakai = $this->getJumlahPesertaAktif();
        return max(0, $this->kuota - $terpakai);
    }

    public function isPenuh(): bool
    {
        return $this->getSlotTersedia() <= 0;
    }

    public function isAktif(): bool
    {
        return $this->is_active === true;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAdaSlot($query)
    {
        return $query->where('is_active', true)
            ->whereRaw('(SELECT COUNT(*) FROM peserta_profiles
                WHERE peserta_profiles.bidang_magang_id = bidang_magang.id
                AND peserta_profiles.diterima_pada IS NOT NULL
                AND peserta_profiles.tanggal_mulai <= NOW()
                AND peserta_profiles.tanggal_selesai >= NOW()) < bidang_magang.kuota');
    }
}
