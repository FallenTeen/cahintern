<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Sertifikat extends Model
{
    use HasFactory;

    protected $table = 'sertifikats';

    protected $fillable = [
        'peserta_profile_id',
        'nomor_sertifikat',
        'tanggal_terbit',
        'file_path',
        'qr_code',
        'is_published',
    ];

    protected $casts = [
        'tanggal_terbit' => 'date',
        'is_published' => 'boolean',
    ];

    public function pesertaProfile()
    {
        return $this->belongsTo(PesertaProfile::class);
    }

    public function getFile(): ?string
    {
        return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }

    public static function generateNomorSertifikat(): string
    {
        $year = date('Y');
        $month = date('m');

        $lastCertificate = self::whereYear('tanggal_terbit', $year)
            ->whereMonth('tanggal_terbit', $month)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = 1;
        if ($lastCertificate && $lastCertificate->nomor_sertifikat) {
            $parts = explode('/', $lastCertificate->nomor_sertifikat);
            if (count($parts) >= 2) {
                $sequence = intval($parts[0]) + 1;
            }
        }

        return sprintf('%03d/CERT-MAGANG/%s/%s', $sequence, $month, $year);
    }

    public function getDataSertifikat(): array
    {
        $profile = $this->pesertaProfile;
        $user = $profile->user;
        $penilaian = $profile->penilaianAkhir;

        return [
            'participant_name' => $user->name,
            'nim' => $profile->nim_nisn ?? '',
            'institution' => $profile->asal_instansi ?? '',
            'major' => $profile->jurusan ?? '',
            'internship_field' => '',
            'start_date' => $profile->tanggal_mulai ? $profile->tanggal_mulai->format('d F Y') : '',
            'end_date' => $profile->tanggal_selesai ? $profile->tanggal_selesai->format('d F Y') : '',
            'certificate_number' => $this->nomor_sertifikat,
            'issue_date' => $this->tanggal_terbit->format('d F Y'),
            'grade' => $penilaian->predikat ?? 'N/A',
            'score' => $penilaian->nilai_total ?? 0,
        ];
    }

    public function generateSertifikat(User $generator, string $template = 'default'): bool
    {
        try {
            if (!$this->nomor_sertifikat) {
                $this->nomor_sertifikat = self::generateCertificateNumber();
            }

            $this->tanggal_terbit = now()->toDateString();
            $this->is_published = false;

            $fileName = 'certificates/' . $this->peserta_profile_id . '_' . time() . '.pdf';
            $this->file_path = $fileName;

            $this->save();

            Notifikasi::create([
                'user_id' => $this->pesertaProfile->user_id,
                'judul' => 'Sertifikat Dibuat',
                'pesan' => "Sertifikat magang Anda telah dibuat dengan nomor {$this->nomor_sertifikat}.",
                'tipe' => 'success',
                'dibaca' => false,
            ]);

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function approve(User $approver): bool
    {
        $this->update(['is_published' => true]);

        Notifikasi::create([
            'user_id' => $this->pesertaProfile->user_id,
            'judul' => 'Sertifikat Disetujui',
            'pesan' => "Sertifikat magang Anda dengan nomor {$this->nomor_sertifikat} telah disetujui dan dapat diunduh.",
            'tipe' => 'success',
            'dibaca' => false,
        ]);

        return true;
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeByYear($query, $year)
    {
        return $query->whereYear('tanggal_terbit', $year);
    }

    public function scopeByMonth($query, $year, $month)
    {
        return $query->whereYear('tanggal_terbit', $year)
            ->whereMonth('tanggal_terbit', $month);
    }
}
