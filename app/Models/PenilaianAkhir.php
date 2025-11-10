<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PenilaianAkhir extends Model
{
    use HasFactory;

    protected $table = 'penilaian_akhirs';

    protected $fillable = [
        'peserta_profile_id',
        'tanggal_penilaian',
        'nilai_disiplin',
        'nilai_kerjasama',
        'nilai_inisiatif',
        'nilai_komunikasi',
        'nilai_teknis',
        'nilai_kreativitas',
        'nilai_tanggung_jawab',
        'nilai_kehadiran',
        'nilai_total',
        'predikat',
        'komentar',
        'rekomendasi',
        'status',
        'disetujui_oleh',
        'disetujui_pada',
        'catatan'
    ];

    protected $casts = [
        'tanggal_penilaian' => 'date',
        'nilai_disiplin' => 'integer',
        'nilai_kerjasama' => 'integer',
        'nilai_inisiatif' => 'integer',
        'nilai_komunikasi' => 'integer',
        'nilai_teknis' => 'integer',
        'nilai_kreativitas' => 'integer',
        'nilai_tanggung_jawab' => 'integer',
        'nilai_kehadiran' => 'integer',
        'nilai_total' => 'decimal:2',
        'disetujui_pada' => 'date',
    ];
    public function pesertaProfile()
    {
        return $this->belongsTo(PesertaProfile::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }

    public function hitungBobot(): float
    {
        $components = [
            'nilai_disiplin' => 0.15,
            'nilai_kerjasama' => 0.15,
            'nilai_inisiatif' => 0.10,
            'nilai_komunikasi' => 0.15,
            'nilai_teknis' => 0.20,
            'nilai_kreativitas' => 0.10,
            'nilai_tanggung_jawab' => 0.10,
            'nilai_kehadiran' => 0.05,
        ];

        $totalScore = 0;
        foreach ($components as $component => $weight) {
            $totalScore += ($this->$component ?? 0) * $weight;
        }

        return round($totalScore, 2);
    }

    public function beriPredikat(): string
    {
        $score = $this->nilai_total ?? $this->hitungBobot();

        return match(true) {
            $score >= 90 => 'A',
            $score >= 80 => 'B',
            $score >= 70 => 'C',
            $score >= 60 => 'D',
            default => 'E'
        };
    }

    public function getDeskripsiPredikat(): string
    {
        return match($this->predikat) {
            'A' => 'Sangat Baik (90-100)',
            'B' => 'Baik (80-89)',
            'C' => 'Cukup (70-79)',
            'D' => 'Kurang (60-69)',
            'E' => 'Sangat Kurang (<60)',
            default => 'Belum Dinilai'
        };
    }

    public function submit(): bool
    {
        $this->nilai_total = $this->hitungBobot();
        $this->predikat = $this->beriPredikat();
        $this->status = 'pending';
        $this->save();

        Notifikasi::create([
            'user_id' => $this->disetujui_oleh,
            'judul' => 'Penilaian Akhir Disubmit',
            'pesan' => "Penilaian akhir untuk {$this->pesertaProfile->user->name} telah disubmit dan menunggu persetujuan.",
            'tipe' => 'info',
            'dibaca' => false,
        ]);

        return true;
    }
}
