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
        'nim',
        'jurusan',
        'universitas',
        'semester',
        'ipk',
        'cv',
        'surat_pengantar',
        'foto',
        'alamat',
        'tanggal_lahir',
        'jenis_kelamin',
        'no_hp',
        'emergency_contact',
        'emergency_phone',
        'skills',
        'motivasi',
        'pengalaman',
        'sertifikat_pendukung',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'skills' => 'array',
        'pengalaman' => 'array',
        'sertifikat_pendukung' => 'array',
    ];

    /**
     * Relationship: PesertaProfile belongs to User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get age from tanggal_lahir
     */
    public function getAgeAttribute(): int
    {
        return $this->tanggal_lahir ? Carbon::parse($this->tanggal_lahir)->age : 0;
    }

    /**
     * Get CV URL
     */
    public function getCvUrlAttribute(): ?string
    {
        return $this->cv ? asset('storage/' . $this->cv) : null;
    }

    /**
     * Get surat pengantar URL
     */
    public function getSuratPengantarUrlAttribute(): ?string
    {
        return $this->surat_pengantar ? asset('storage/' . $this->surat_pengantar) : null;
    }

    /**
     * Get foto URL
     */
    public function getFotoUrlAttribute(): ?string
    {
        return $this->foto ? asset('storage/' . $this->foto) : null;
    }

    /**
     * Get formatted IPK
     */
    public function getFormattedIpkAttribute(): string
    {
        return number_format($this->ipk, 2);
    }

    /**
     * Get full name from user relationship
     */
    public function getFullNameAttribute(): string
    {
        return $this->user->name ?? '';
    }

    /**
     * Get email from user relationship
     */
    public function getEmailAttribute(): string
    {
        return $this->user->email ?? '';
    }

    /**
     * Check if profile is complete
     */
    public function isComplete(): bool
    {
        $requiredFields = [
            'nim', 'jurusan', 'universitas', 'semester', 'ipk',
            'cv', 'surat_pengantar', 'foto', 'alamat', 'tanggal_lahir',
            'jenis_kelamin', 'no_hp', 'emergency_contact', 'emergency_phone'
        ];

        foreach ($requiredFields as $field) {
            if (empty($this->$field)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get completion percentage
     */
    public function getCompletionPercentage(): int
    {
        $requiredFields = [
            'nim', 'jurusan', 'universitas', 'semester', 'ipk',
            'cv', 'surat_pengantar', 'foto', 'alamat', 'tanggal_lahir',
            'jenis_kelamin', 'no_hp', 'emergency_contact', 'emergency_phone',
            'skills', 'motivasi'
        ];

        $completedFields = 0;
        foreach ($requiredFields as $field) {
            if (!empty($this->$field)) {
                $completedFields++;
            }
        }

        return round(($completedFields / count($requiredFields)) * 100);
    }

    /**
     * Get missing required fields
     */
    public function getMissingFields(): array
    {
        $requiredFields = [
            'nim' => 'NIM',
            'jurusan' => 'Jurusan',
            'universitas' => 'Universitas',
            'semester' => 'Semester',
            'ipk' => 'IPK',
            'cv' => 'CV',
            'surat_pengantar' => 'Surat Pengantar',
            'foto' => 'Foto',
            'alamat' => 'Alamat',
            'tanggal_lahir' => 'Tanggal Lahir',
            'jenis_kelamin' => 'Jenis Kelamin',
            'no_hp' => 'No HP',
            'emergency_contact' => 'Kontak Darurat',
            'emergency_phone' => 'Telepon Darurat'
        ];

        $missingFields = [];
        foreach ($requiredFields as $field => $label) {
            if (empty($this->$field)) {
                $missingFields[] = $label;
            }
        }

        return $missingFields;
    }

    /**
     * Scope: Complete profiles only
     */
    public function scopeComplete($query)
    {
        return $query->whereNotNull('nim')
            ->whereNotNull('jurusan')
            ->whereNotNull('universitas')
            ->whereNotNull('semester')
            ->whereNotNull('ipk')
            ->whereNotNull('cv')
            ->whereNotNull('surat_pengantar')
            ->whereNotNull('foto')
            ->whereNotNull('alamat')
            ->whereNotNull('tanggal_lahir')
            ->whereNotNull('jenis_kelamin')
            ->whereNotNull('no_hp')
            ->whereNotNull('emergency_contact')
            ->whereNotNull('emergency_phone');
    }

    /**
     * Scope: Filter by university
     */
    public function scopeByUniversity($query, $university)
    {
        return $query->where('universitas', 'like', '%' . $university . '%');
    }

    /**
     * Scope: Filter by jurusan
     */
    public function scopeByJurusan($query, $jurusan)
    {
        return $query->where('jurusan', 'like', '%' . $jurusan . '%');
    }

    /**
     * Scope: Filter by minimum IPK
     */
    public function scopeMinimumIpk($query, $minIpk)
    {
        return $query->where('ipk', '>=', $minIpk);
    }
}