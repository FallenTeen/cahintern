<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Absensi;
use App\Models\Logbook;
use App\Models\PesertaProfile;
use App\Models\Sertifikat;
use App\Models\BidangMagang;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $dataPengguna = auth()->user();

        $totalPendaftar = User::whereIn('role', ['peserta', 'user'])->count();

        $pesertaAktif = PesertaProfile::whereNotNull('diterima_pada')
            ->whereDate('tanggal_mulai', '<=', Carbon::now())
            ->whereDate('tanggal_selesai', '>=', Carbon::now())
            ->count();

        $logbookHariIni = Logbook::whereDate('tanggal', Carbon::today())->count();

        $sertifikatTerbit = Sertifikat::where('is_published', true)->count();

        $absensiMingguIni = Absensi::whereBetween('tanggal', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        ])
        ->selectRaw("
            TO_CHAR(tanggal, 'Dy') as day,
            SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) as hadir,
            SUM(CASE WHEN status = 'izin' THEN 1 ELSE 0 END) as izin,
            SUM(CASE WHEN status = 'sakit' THEN 1 ELSE 0 END) as sakit,
            SUM(CASE WHEN status = 'terlambat' THEN 1 ELSE 0 END) as terlambat
        ")
        ->groupBy('day')
        ->get();

        $logbookMingguan = Logbook::whereBetween('tanggal', [
            Carbon::now()->subWeeks(3),
            Carbon::now()
        ])
        ->selectRaw("
            'W' || EXTRACT(WEEK FROM tanggal) as week,
            SUM(CASE WHEN status IN ('pending', 'disetujui', 'ditolak', 'revision') THEN 1 ELSE 0 END) as submitted,
            SUM(CASE WHEN status = 'disetujui' THEN 1 ELSE 0 END) as validated,
            SUM(CASE WHEN status = 'revision' THEN 1 ELSE 0 END) as revision
        ")
        ->groupByRaw("EXTRACT(WEEK FROM tanggal)")
        ->get();

        $absensiHariIni = Absensi::whereDate('tanggal', Carbon::today())
            ->selectRaw("
                SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) as hadir,
                SUM(CASE WHEN status = 'izin' THEN 1 ELSE 0 END) as izin,
                SUM(CASE WHEN status = 'sakit' THEN 1 ELSE 0 END) as sakit,
                SUM(CASE WHEN status = 'terlambat' THEN 1 ELSE 0 END) as terlambat
            ")
            ->first();

        $belumAbsen = $pesertaAktif - ($absensiHariIni->hadir + $absensiHariIni->izin + $absensiHariIni->sakit + $absensiHariIni->terlambat);

        $pendaftarBaru = User::whereIn('role', ['peserta', 'user'])
            ->whereNull('email_verified_at')
            ->count();

        $logbookPending = Logbook::where('status', 'pending')->count();

        return Inertia::render('dashboard', [
            'jesonResponse' => $dataPengguna,
            'statistik' => [
                'totalPendaftar' => $totalPendaftar,
                'pesertaAktif' => $pesertaAktif,
                'logbookHariIni' => $logbookHariIni,
                'sertifikatTerbit' => $sertifikatTerbit,
            ],
            'absensiMingguIni' => $absensiMingguIni,
            'logbookMingguan' => $logbookMingguan,
            'absensiHariIni' => [
                'hadir' => $absensiHariIni->hadir ?? 0,
                'izin' => $absensiHariIni->izin ?? 0,
                'sakit' => $absensiHariIni->sakit ?? 0,
                'terlambat' => $absensiHariIni->terlambat ?? 0,
                'belumAbsen' => $belumAbsen,
            ],
            'notifikasi' => [
                'pendaftarBaru' => $pendaftarBaru,
                'logbookPending' => $logbookPending,
            ]
        ]);
    }
}
