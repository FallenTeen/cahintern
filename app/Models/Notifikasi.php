<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Notifikasi extends Model
{
    use HasFactory;

    protected $table = 'notifikasi';

    protected $fillable = [
        'user_id',
        'judul',
        'pesan',
        'tipe',
        'dibaca',
        'dibaca_pada',
    ];

    protected $casts = [
        'dibaca' => 'boolean',
        'dibaca_pada' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function markAsRead(): bool
    {
        if (!$this->dibaca) {
            $this->update([
                'dibaca' => true,
                'dibaca_pada' => now(),
            ]);
            return true;
        }
        return false;
    }

    public function markAsUnread(): bool
    {
        if ($this->dibaca) {
            $this->update([
                'dibaca' => false,
                'dibaca_pada' => null,
            ]);
            return true;
        }
        return false;
    }

    public function scopeUnread($query)
    {
        return $query->where('dibaca', false);
    }

    public function scopeRead($query)
    {
        return $query->where('dibaca', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('tipe', $type);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public static function sendDeadlineReminders(): int
    {
        $count = 0;
        $upcomingLogbooks = Logbook::where('tanggal', '=', now()->addDays(3)->toDateString())
            ->where('status', 'pending')
            ->with('pesertaProfile.user')
            ->get();

        foreach ($upcomingLogbooks as $logbook) {
            self::create([
                'user_id' => $logbook->pesertaProfile->user_id,
                'judul' => 'Pengingat Logbook',
                'pesan' => 'Jangan lupa mengisi logbook untuk tanggal ' . $logbook->tanggal->format('d M Y'),
                'tipe' => 'warning',
                'dibaca' => false,
            ]);
            $count++;
        }
        $endingProfiles = PesertaProfile::where('tanggal_selesai', '=', now()->addDays(7)->toDateString())
            ->whereNotNull('diterima_pada')
            ->with('user')
            ->get();

        foreach ($endingProfiles as $profile) {
            self::create([
                'user_id' => $profile->user_id,
                'judul' => 'Magang Akan Berakhir',
                'pesan' => 'Magang Anda akan berakhir dalam 7 hari. Pastikan semua tugas telah diselesaikan.',
                'tipe' => 'info',
                'dibaca' => false,
            ]);
            $count++;
        }

        return $count;
    }

    public static function getStatisticsForUser(User $user): array
    {
        $notifications = self::where('user_id', $user->id);

        return [
            'total' => $notifications->count(),
            'unread' => $notifications->clone()->unread()->count(),
            'read' => $notifications->clone()->read()->count(),
            'recent' => $notifications->clone()->recent()->count(),
            'by_type' => $notifications->clone()
                ->selectRaw('tipe, COUNT(*) as count')
                ->groupBy('tipe')
                ->pluck('count', 'tipe')
                ->toArray(),
        ];
    }
}
