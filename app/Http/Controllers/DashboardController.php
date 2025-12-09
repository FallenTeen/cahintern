<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Absensi;
use App\Models\Logbook;
use App\Models\PesertaProfile;
use App\Models\Sertifikat;
use App\Models\Notifikasi;
use App\Models\JadwalAbsensi;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $dataPengguna = auth()->user();

        if ($dataPengguna && $dataPengguna->role === 'peserta') {
            $profile = PesertaProfile::with('user')->where('user_id', $dataPengguna->id)->first();

            $absensi30 = Absensi::where('peserta_profile_id', optional($profile)->id)
                ->whereBetween('tanggal', [Carbon::now()->subDays(30), Carbon::now()])
                ->selectRaw("
                    SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) as hadir,
                    SUM(CASE WHEN status = 'izin' THEN 1 ELSE 0 END) as izin,
                    SUM(CASE WHEN status = 'sakit' THEN 1 ELSE 0 END) as sakit,
                    SUM(CASE WHEN status = 'terlambat' THEN 1 ELSE 0 END) as terlambat
                ")
                ->first();

            $recentAbsensi = Absensi::where('peserta_profile_id', optional($profile)->id)
                ->orderBy('tanggal', 'desc')
                ->take(7)
                ->get()
                ->map(function ($a) {
                    return [
                        'tanggal' => $a->tanggal->format('d/m/Y'),
                        'jam_masuk' => $a->jam_masuk ? $a->jam_masuk->format('H:i') : '-',
                        'jam_keluar' => $a->jam_keluar ? $a->jam_keluar->format('H:i') : '-',
                        'status' => $a->getStatusLabel(),
                    ];
                });

            $unread = Notifikasi::forUser($dataPengguna->id)->unread()->count();
            $latestNotif = Notifikasi::forUser($dataPengguna->id)
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(['judul', 'pesan', 'tipe', 'dibaca', 'created_at'])
                ->map(function ($n) {
                    return [
                        'judul' => $n->judul,
                        'pesan' => $n->pesan,
                        'tipe' => $n->tipe,
                        'dibaca' => $n->dibaca,
                        'waktu' => $n->created_at->format('d/m/Y H:i'),
                    ];
                });

            $schedule = JadwalAbsensi::activeForDate(Carbon::today());

            $logbookWindowStart = Carbon::now()->subDays(30);
            $logbookWindowEnd = Carbon::now();
            $logbookApproved = Logbook::where('peserta_profile_id', optional($profile)->id)
                ->whereBetween('tanggal', [$logbookWindowStart, $logbookWindowEnd])
                ->where('status', 'disetujui')
                ->count();
            $logbookTotal = Logbook::where('peserta_profile_id', optional($profile)->id)
                ->whereBetween('tanggal', [$logbookWindowStart, $logbookWindowEnd])
                ->count();
            $logbookProgress = $logbookTotal > 0 ? round(($logbookApproved / $logbookTotal) * 100) : 0;

            $recentLogbooks = Logbook::where('peserta_profile_id', optional($profile)->id)
                ->orderBy('tanggal', 'desc')
                ->take(5)
                ->get()
                ->map(function ($l) {
                    return [
                        'tanggal' => $l->tanggal->format('d/m/Y'),
                        'judul' => $l->kegiatan,
                        'status' => $l->status_label,
                    ];
                });

            $tasks = [];
            $today = Carbon::today();
            $hasTodayAbsensi = Absensi::where('peserta_profile_id', optional($profile)->id)->whereDate('tanggal', $today)->exists();
            if (!$hasTodayAbsensi) {
                $tasks[] = 'Absen hari ini belum tercatat';
            }
            $hasTodayLogbook = Logbook::where('peserta_profile_id', optional($profile)->id)->whereDate('tanggal', $today)->exists();
            if (!$hasTodayLogbook) {
                $tasks[] = 'Logbook hari ini belum diisi';
            }
            $needRevision = Logbook::where('peserta_profile_id', optional($profile)->id)->where('status', 'revision')->count();
            if ($needRevision > 0) {
                $tasks[] = 'Ada ' . $needRevision . ' logbook perlu revisi';
            }

            return Inertia::render('dashboard', [
                'mode' => 'peserta',
                'peserta' => $profile ? [
                    'nama' => $profile->user->name,
                    'asal_instansi' => $profile->asal_instansi,
                    'nim_nisn' => $profile->nim_nisn,
                    'tanggal_mulai' => $profile->tanggal_mulai ? $profile->tanggal_mulai->format('d F Y') : null,
                    'tanggal_selesai' => $profile->tanggal_selesai ? $profile->tanggal_selesai->format('d F Y') : null,
                ] : null,
                'schedule' => $schedule ? [
                    'jam_buka' => Carbon::parse($schedule->jam_buka)->format('H:i'),
                    'jam_tutup' => Carbon::parse($schedule->jam_tutup)->format('H:i'),
                ] : null,
                'notifikasi' => [
                    'unread' => $unread,
                    'list' => $latestNotif,
                ],
                'absensiStats' => [
                    'hadir' => $absensi30->hadir ?? 0,
                    'izin' => $absensi30->izin ?? 0,
                    'sakit' => $absensi30->sakit ?? 0,
                    'terlambat' => $absensi30->terlambat ?? 0,
                ],
                'recentAbsensi' => $recentAbsensi,
                'logbookProgress' => $logbookProgress,
                'recentLogbooks' => $recentLogbooks,
                'tasks' => $tasks,
            ]);
        }

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

        $absensiDaily = Absensi::whereBetween('tanggal', [Carbon::now()->subDays(6), Carbon::now()])
            ->selectRaw("TO_CHAR(tanggal, 'YYYY-MM-DD') as day, SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) as hadir, SUM(CASE WHEN status = 'izin' THEN 1 ELSE 0 END) as izin, SUM(CASE WHEN status = 'sakit' THEN 1 ELSE 0 END) as sakit, SUM(CASE WHEN status = 'terlambat' THEN 1 ELSE 0 END) as terlambat")
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $absensiWeekly = Absensi::whereBetween('tanggal', [Carbon::now()->subWeeks(8), Carbon::now()])
            ->selectRaw("'W' || EXTRACT(WEEK FROM tanggal) as week, SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) as hadir, SUM(CASE WHEN status = 'izin' THEN 1 ELSE 0 END) as izin, SUM(CASE WHEN status = 'sakit' THEN 1 ELSE 0 END) as sakit, SUM(CASE WHEN status = 'terlambat' THEN 1 ELSE 0 END) as terlambat")
            ->groupByRaw("EXTRACT(WEEK FROM tanggal)")
            ->orderByRaw("EXTRACT(WEEK FROM tanggal)")
            ->get();

        $absensiMonthly = Absensi::whereBetween('tanggal', [Carbon::now()->subMonths(6), Carbon::now()])
            ->selectRaw("TO_CHAR(tanggal, 'YYYY-MM') as month, SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) as hadir, SUM(CASE WHEN status = 'izin' THEN 1 ELSE 0 END) as izin, SUM(CASE WHEN status = 'sakit' THEN 1 ELSE 0 END) as sakit, SUM(CASE WHEN status = 'terlambat' THEN 1 ELSE 0 END) as terlambat")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $logbookApprovedTotal = Logbook::whereBetween('tanggal', [Carbon::now()->subMonths(1), Carbon::now()])->where('status', 'disetujui')->count();
        $logbookTotalLastMonth = Logbook::whereBetween('tanggal', [Carbon::now()->subMonths(1), Carbon::now()])->count();
        $logbookCompletionPercent = $logbookTotalLastMonth > 0 ? round(($logbookApprovedTotal / $logbookTotalLastMonth) * 100) : 0;

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
            'absensiChart' => [
                'daily' => $absensiDaily,
                'weekly' => $absensiWeekly,
                'monthly' => $absensiMonthly,
            ],
            'logbookCompletionPercent' => $logbookCompletionPercent,
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
            ],
            'quickActions' => [
                ['label' => 'Verifikasi Pendaftaran', 'href' => '/pendaftaran'],
                ['label' => 'Validasi Logbook', 'href' => '/logbook-mahasiswa'],
                ['label' => 'Kelola Jadwal Absensi', 'href' => '/absen-mahasiswa'],
                ['label' => 'Kelola Izin', 'href' => '/izin'],
            ]
        ]);
    }
}
