<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class JadwalAbsensi extends Model
{
    use HasFactory;

    protected $table = 'jadwal_absensis';

    protected $fillable = [
        'jam_buka',
        'jam_tutup',
        'toleransi_menit',
        'effective_start_date',
        'effective_end_date',
    ];

    protected $casts = [
        'effective_start_date' => 'date',
        'effective_end_date' => 'date',
    ];

    public static function activeForDate($date): ?self
    {
        $d = $date instanceof Carbon ? $date->toDateString() : Carbon::parse($date)->toDateString();
        return self::whereDate('effective_start_date', '<=', $d)
            ->where(function ($q) use ($d) {
                $q->whereNull('effective_end_date')
                    ->orWhereDate('effective_end_date', '>=', $d);
            })
            ->orderBy('effective_start_date', 'desc')
            ->first();
    }
}

