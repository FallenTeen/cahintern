<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'asal_instansi',
        'status',
        'password',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Relationship: User has one peserta profile
     */
    public function pesertaProfile()
    {
        return $this->hasOne(PesertaProfile::class);
    }

    /**
     * Relationship: User has many pengajuan magang
     */
    public function pengajuanMagang()
    {
        return $this->hasMany(PengajuanMagang::class);
    }

    /**
     * Relationship: User has many approved pengajuan magang (as admin)
     */
    public function approvedPengajuan()
    {
        return $this->hasMany(PengajuanMagang::class, 'approved_by');
    }

    /**
     * Relationship: User has many notifications
     */
    public function notifikasi()
    {
        return $this->hasMany(Notifikasi::class);
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is peserta
     */
    public function isPeserta(): bool
    {
        return $this->role === 'peserta';
    }

    /**
     * Check if user is guest
     */
    public function isGuest(): bool
    {
        return $this->role === 'guest';
    }

    /**
     * Check if user is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get user's full name with role
     */
    public function getFullNameWithRoleAttribute(): string
    {
        return $this->name . ' (' . ucfirst($this->role) . ')';
    }

    /**
     * Get user's avatar URL
     */
    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }
        
        // Default avatar using initials
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=7F9CF5&background=EBF4FF';
    }

    /**
     * Scope: Only active users
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: Only admin users
     */
    public function scopeAdmin($query)
    {
        return $query->where('role', 'admin');
    }

    /**
     * Scope: Only peserta users
     */
    public function scopePeserta($query)
    {
        return $query->where('role', 'peserta');
    }

    /**
     * Get unread notifications count
     */
    public function getUnreadNotificationsCountAttribute(): int
    {
        return $this->notifikasi()->where('is_read', false)->count();
    }

    /**
     * Mark all notifications as read
     */
    public function markAllNotificationsAsRead(): void
    {
        $this->notifikasi()
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now()
            ]);
    }

    /**
     * Get active pengajuan magang
     */
    public function getActivePengajuanMagang()
    {
        return $this->pengajuanMagang()
            ->whereIn('status', ['approved', 'completed'])
            ->latest()
            ->first();
    }
}
