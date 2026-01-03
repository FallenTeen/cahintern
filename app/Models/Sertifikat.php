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
        'approval_status',
        'approved_at',
        'approved_by',
    ];

    protected $casts = [
        'tanggal_terbit' => 'date',
        'is_published' => 'boolean',
        'approved_at' => 'datetime',
        'approval_status' => 'string',
    ];

    public function pesertaProfile()
    {
        return $this->belongsTo(PesertaProfile::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function getFile(): ?string
    {
        return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }

    public static function generateCertificateNumber(): string
    {
        return self::generateNomorSertifikat();
    }

    // public static function generateNomorSertifikat(): string
    // {
    //     $year = date('Y');
    //     $month = date('m');

    //     $existingNumbers = self::whereYear('tanggal_terbit', $year)
    //         ->whereMonth('tanggal_terbit', $month)
    //         ->where('nomor_sertifikat', 'like', '%/CERT-MAGANG/%')
    //         ->pluck('nomor_sertifikat');

    //     $maxSequence = 0;

    //     foreach ($existingNumbers as $nomor) {
    //         if (preg_match('/^(\d{1,3})\/CERT-MAGANG\//', $nomor, $matches)) {
    //             $seq = (int) $matches[1];
    //             if ($seq > $maxSequence) {
    //                 $maxSequence = $seq;
    //             }
    //         }
    //     }

    //     $sequence = $maxSequence + 1;

    //     return sprintf('%03d/CERT-MAGANG/%s/%s', $sequence, $month, $year);
    // }

    public static function generateNomorSertifikat(): string
    {
        $now = Carbon::now();

        $year = $now->year;
        $month = $now->month;

        $bulanRomawi = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV',
            5 => 'V', 6 => 'VI', 7 => 'VII', 8 => 'VIII',
            9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII',
        ];

        $bulan = $bulanRomawi[$month];

        // Ambil nomor sertifikat bulan & tahun yang sama
        $existingNumbers = self::whereYear('tanggal_terbit', $year)
            ->whereMonth('tanggal_terbit', $month)
            ->where('nomor_sertifikat', 'like', 'B/400.14.5.4/%')
            ->pluck('nomor_sertifikat');

        $maxSequence = 0;

        foreach ($existingNumbers as $nomor) {
            /**
             * Cocokkan:
             * B/400.14.5.4/{urut}/{bulan}/{tahun}
             */
            if (preg_match(
                '#^B/400\.14\.5\.4/(\d+)/[IVXLCDM]+/\d{4}$#',
                $nomor,
                $matches
            )) {
                $seq = (int) $matches[1];
                if ($seq > $maxSequence) {
                    $maxSequence = $seq;
                }
            }
        }

        $sequence = $maxSequence + 1;

        return sprintf(
            'B/400.14.5.4/%d/%s/%d',
            $sequence,
            $bulan,
            $year
        );
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
        $this->update([
            'is_published' => true,
            'approval_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $approver->id,
        ]);

        Notifikasi::create([
            'user_id' => $this->pesertaProfile->user_id,
            'judul' => 'Sertifikat Disetujui',
            'pesan' => "Sertifikat magang Anda dengan nomor {$this->nomor_sertifikat} telah disetujui dan dapat diunduh.",
            'tipe' => 'success',
            'dibaca' => false,
        ]);

        return true;
    }

    public function reject(User $rejector, string $reason = ''): bool
    {
        $this->update([
            'is_published' => false,
            'approval_status' => 'rejected',
            'approved_at' => now(),
            'approved_by' => $rejector->id,
        ]);

        Notifikasi::create([
            'user_id' => $this->pesertaProfile->user_id,
            'judul' => 'Sertifikat Ditolak',
            'pesan' => "Sertifikat magang Anda dengan nomor {$this->nomor_sertifikat} telah ditolak. Alasan: {$reason}",
            'tipe' => 'error',
            'dibaca' => false,
        ]);

        return true;
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function scopeRejected($query)
    {
        return $query->where('approval_status', 'rejected');
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
