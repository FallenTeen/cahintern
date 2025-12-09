<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'status',
        'password',
        'email_verified_at',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
    public function pesertaProfile()
    {
        return $this->hasOne(PesertaProfile::class);
    }

    public function notifikasi()
    {
        return $this->hasMany(Notifikasi::class);
    }
    

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isPeserta(): bool
    {
        return $this->role === 'peserta';
    }

    public function isGuest(): bool
    {
        return $this->role === 'guest';
    }

    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    public function isActive(): bool
    {
        return $this->status === 'diterima';
    }

    public function getAvatar(): string
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }

        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=7F9CF5&background=EBF4FF';
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'diterima');
    }

    public function getUnreadNotificationsCountAttribute(): int
    {
        return $this->notifikasi()->where('dibaca', false)->count();
    }

    public function markAllNotificationsAsRead(): void
    {
        $this->notifikasi()
            ->where('dibaca', false)
            ->update([
                'dibaca' => true,
                'dibaca_pada' => now()
            ]);
    }

    public function getPfpAktif()
    {
        return $this->pesertaProfile()
            ->whereNotNull('diterima_pada')
            ->whereDate('tanggal_mulai', '<=', now())
            ->whereDate('tanggal_selesai', '>=', now())
            ->first();
    }

}
