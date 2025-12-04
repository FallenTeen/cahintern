<?php

namespace App\Http\Controllers;

use App\Models\Logbook;
use App\Models\PesertaProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class LogbookController extends Controller
{
    public function index()
    {
        $search = request('search');
        $status = request('status');
        $tanggal = request('tanggal');
        $pesertaId = request('peserta_id');

        $query = Logbook::with('pesertaProfile.user', 'pesertaProfile.bidangMagang');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('pesertaProfile.user', function ($subQ) use ($search) {
                    $subQ->where('name', 'like', '%' . $search . '%');
                })->orWhereHas('pesertaProfile.bidangMagang', function ($subQ) use ($search) {
                    $subQ->where('nama_bidang', 'like', '%' . $search . '%');
                })->orWhere('kegiatan', 'like', '%' . $search . '%');
            });
        }

        if ($status && $status !== 'semua') {
            $query->where('status', $status);
        }

        if ($tanggal) {
            $query->whereDate('tanggal', $tanggal);
        }

        if ($pesertaId) {
            $query->where('peserta_profile_id', $pesertaId);
        }

        $statisticsQuery = clone $query;
        $allLogbooks = $statisticsQuery->get();
        $statistics = [
            'pending' => $allLogbooks->where('status', 'pending')->count(),
            'disetujui' => $allLogbooks->where('status', 'disetujui')->count(),
            'revision' => $allLogbooks->where('status', 'revision')->count(),
            'ditolak' => $allLogbooks->where('status', 'ditolak')->count(),
        ];

        $logbookData = $query->orderBy('tanggal', 'desc')->paginate(10)->through(function ($logbook) {
            return [
                'id' => $logbook->id,
                'peserta_profile_id' => $logbook->peserta_profile_id,
                'nama_peserta' => $logbook->pesertaProfile->user->name,
                'bidang_magang' => $logbook->pesertaProfile->bidangMagang->nama_bidang,
                'tanggal' => $logbook->tanggal->format('d F Y'),
                'kegiatan' => $logbook->kegiatan,
                'deskripsi' => $logbook->deskripsi,
                'jam_mulai' => $logbook->jam_mulai ? $logbook->jam_mulai->format('H:i') : null,
                'jam_selesai' => $logbook->jam_selesai ? $logbook->jam_selesai->format('H:i') : null,
                'durasi' => $logbook->formatted_duration,
                'status' => $logbook->status,
                'status_label' => $logbook->status_label,
                'catatan_pembimbing' => $logbook->catatan_pembimbing,
                'dokumentasi' => $logbook->dokumentasi ? asset('storage/' . $logbook->dokumentasi) : null,
            ];
        });

        return Inertia::render('logbook/index', [
            'logbookData' => $logbookData,
            'statistics' => $statistics,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'tanggal' => $tanggal,
                'peserta_id' => $pesertaId,
            ],
        ]);
    }

    public function showLogbookMahasiswa($pesertaProfileId)
    {
        $pesertaProfile = PesertaProfile::with('user', 'bidangMagang')->findOrFail($pesertaProfileId);

        $search = request('search');
        $status = request('status');
        $bulan = request('bulan');
        $tahun = request('tahun', date('Y'));

        \Log::info('Logbook Filter Debug', [
            'peserta_id' => $pesertaProfileId,
            'search' => $search,
            'status' => $status,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'bulan_type' => gettype($bulan),
            'tahun_type' => gettype($tahun),
        ]);

        $query = Logbook::where('peserta_profile_id', $pesertaProfileId)
            ->with('approvedBy');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('kegiatan', 'like', '%' . $search . '%')
                  ->orWhere('deskripsi', 'like', '%' . $search . '%');
            });
        }

        if ($status && $status !== 'semua') {
            $query->where('status', $status);
        }

        if (!empty($bulan)) {
            $bulanInt = (int) $bulan;
            \Log::info('Applying month filter', ['bulan' => $bulanInt]);
            $query->whereMonth('tanggal', $bulanInt);
        }

        if (!empty($tahun)) {
            $tahunInt = (int) $tahun;
            \Log::info('Applying year filter', ['tahun' => $tahunInt]);
            $query->whereYear('tanggal', $tahunInt);
        }

        $statisticsQuery = Logbook::where('peserta_profile_id', $pesertaProfileId);

        if ($search) {
            $statisticsQuery->where(function($q) use ($search) {
                $q->where('kegiatan', 'like', '%' . $search . '%')
                  ->orWhere('deskripsi', 'like', '%' . $search . '%');
            });
        }

        if (!empty($bulan)) {
            $statisticsQuery->whereMonth('tanggal', (int) $bulan);
        }

        if (!empty($tahun)) {
            $statisticsQuery->whereYear('tanggal', (int) $tahun);
        }

        $allLogbooksForStats = $statisticsQuery->get();

        $statistics = [
            'total_entries' => $allLogbooksForStats->count(),
            'approved_entries' => $allLogbooksForStats->where('status', 'disetujui')->count(),
            'pending_entries' => $allLogbooksForStats->where('status', 'pending')->count(),
            'rejected_entries' => $allLogbooksForStats->where('status', 'ditolak')->count(),
            'revision_entries' => $allLogbooksForStats->where('status', 'revision')->count(),
            'total_hours' => $allLogbooksForStats->sum('duration_in_hours'),
            'approval_rate' => $allLogbooksForStats->count() > 0
                ? round(($allLogbooksForStats->where('status', 'disetujui')->count() / $allLogbooksForStats->count()) * 100, 1)
                : 0,
        ];

        \Log::info('Statistics Result', $statistics);

        $logbooks = $query->orderBy('tanggal', 'desc')->paginate(50)->through(function ($logbook) {
            return [
                'id' => $logbook->id,
                'tanggal' => $logbook->tanggal->format('d F Y'),
                'tanggal_raw' => $logbook->tanggal->format('Y-m-d'),
                'kegiatan' => $logbook->kegiatan,
                'deskripsi' => substr($logbook->deskripsi, 0, 100) . (strlen($logbook->deskripsi) > 100 ? '...' : ''),
                'jam_mulai' => $logbook->jam_mulai ? $logbook->jam_mulai->format('H:i') : null,
                'jam_selesai' => $logbook->jam_selesai ? $logbook->jam_selesai->format('H:i') : null,
                'durasi' => $logbook->formatted_duration,
                'status' => $logbook->status,
                'status_label' => $logbook->status_label,
                'status_badge_class' => $logbook->status_badge_class,
                'has_dokumentasi' => $logbook->dokumentasi ? true : false,
                'has_catatan' => $logbook->catatan_pembimbing ? true : false,
            ];
        });

        return Inertia::render('logbook/showLogbookMahasiswa', [
            'pesertaProfile' => [
                'id' => $pesertaProfile->id,
                'nama' => $pesertaProfile->user->name,
                'nim_nisn' => $pesertaProfile->nim_nisn,
                'bidang_magang' => $pesertaProfile->bidangMagang->nama_bidang,
                'asal_instansi' => $pesertaProfile->asal_instansi,
                'tanggal_mulai' => $pesertaProfile->tanggal_mulai ? $pesertaProfile->tanggal_mulai->format('d F Y') : null,
                'tanggal_selesai' => $pesertaProfile->tanggal_selesai ? $pesertaProfile->tanggal_selesai->format('d F Y') : null,
                'status' => $pesertaProfile->getStatus(),
            ],
            'logbooks' => $logbooks,
            'statistics' => $statistics,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'bulan' => $bulan,
                'tahun' => $tahun,
            ],
        ]);
    }

    public function showDetailLogbook(Logbook $logbook)
    {
        $logbook->load('pesertaProfile.user', 'pesertaProfile.bidangMagang', 'approvedBy');

        $logbookDetail = [
            'id' => $logbook->id,
            'peserta' => [
                'id' => $logbook->pesertaProfile->id,
                'nama' => $logbook->pesertaProfile->user->name,
                'nim_nisn' => $logbook->pesertaProfile->nim_nisn,
                'email' => $logbook->pesertaProfile->user->email,
                'bidang_magang' => $logbook->pesertaProfile->bidangMagang->nama_bidang,
                'asal_instansi' => $logbook->pesertaProfile->asal_instansi,
            ],
            'tanggal' => $logbook->tanggal->format('d F Y'),
            'tanggal_raw' => $logbook->tanggal->format('Y-m-d'),
            'hari' => $logbook->tanggal->locale('id')->dayName,
            'kegiatan' => $logbook->kegiatan,
            'deskripsi' => $logbook->deskripsi,
            'jam_mulai' => $logbook->jam_mulai ? $logbook->jam_mulai->format('H:i') : null,
            'jam_selesai' => $logbook->jam_selesai ? $logbook->jam_selesai->format('H:i') : null,
            'durasi' => $logbook->formatted_duration,
            'durasi_jam' => $logbook->duration_in_hours,
            'status' => $logbook->status,
            'status_label' => $logbook->status_label,
            'status_badge_class' => $logbook->status_badge_class,
            'catatan_pembimbing' => $logbook->catatan_pembimbing,
            'masalah' => $logbook->masalah,
            'solusi' => $logbook->solusi,
            'dokumentasi' => $logbook->dokumentasi ? asset('storage/' . $logbook->dokumentasi) : null,
            'is_editable' => $logbook->isEditable(),
            'needs_approval' => $logbook->needsApproval(),
            'is_overdue' => $logbook->isOverdue(),
            'approved_by' => $logbook->approvedBy ? [
                'nama' => $logbook->approvedBy->name,
                'email' => $logbook->approvedBy->email,
            ] : null,
            'disetujui_pada' => $logbook->disetujui_pada ? $logbook->disetujui_pada->format('d F Y H:i') : null,
            'created_at' => $logbook->created_at->format('d F Y H:i'),
            'updated_at' => $logbook->updated_at->format('d F Y H:i'),
        ];

        $previousLogbook = Logbook::where('peserta_profile_id', $logbook->peserta_profile_id)
            ->where('tanggal', '<', $logbook->tanggal)
            ->orderBy('tanggal', 'desc')
            ->first();

        $nextLogbook = Logbook::where('peserta_profile_id', $logbook->peserta_profile_id)
            ->where('tanggal', '>', $logbook->tanggal)
            ->orderBy('tanggal', 'asc')
            ->first();

        return Inertia::render('logbook/detail', [
            'logbook' => $logbookDetail,
            'navigation' => [
                'previous' => $previousLogbook ? [
                    'id' => $previousLogbook->id,
                    'tanggal' => $previousLogbook->tanggal->format('d F Y'),
                    'kegiatan' => $previousLogbook->kegiatan,
                ] : null,
                'next' => $nextLogbook ? [
                    'id' => $nextLogbook->id,
                    'tanggal' => $nextLogbook->tanggal->format('d F Y'),
                    'kegiatan' => $nextLogbook->kegiatan,
                ] : null,
            ],
            'canManage' => Auth::user()->isAdmin(),
        ]);
    }

    public function show(Logbook $logbook)
    {
        return $this->showDetailLogbook($logbook);
    }

    public function showDetail(Logbook $logbook)
    {
        return $this->showDetailLogbook($logbook);
    }

    public function approve(Request $request, Logbook $logbook)
    {
        if (!Auth::user()->isAdmin()) {
            return back()->with('error', 'Anda tidak memiliki akses untuk menyetujui logbook');
        }
        if ($logbook->status !== 'pending') {
            return back()->with('error', 'Logbook ini sudah diproses sebelumnya');
        }
        $validated = $request->validate([
            'catatan_pembimbing' => 'nullable|string|max:1000',
        ]);

        try {
            $logbook->approve(
                Auth::user(),
                $validated['catatan_pembimbing'] ?? null
            );

            return back()->with('success', 'Logbook berhasil disetujui');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menyetujui logbook: ' . $e->getMessage());
        }
    }

    public function reject(Request $request, Logbook $logbook)
    {
        if (!Auth::user()->isAdmin()) {
            return back()->with('error', 'Anda tidak memiliki akses untuk menolak logbook');
        }
        if ($logbook->status !== 'pending') {
            return back()->with('error', 'Logbook ini sudah diproses sebelumnya');
        }
        $validated = $request->validate([
            'catatan_pembimbing' => 'required|string|min:10|max:1000',
        ], [
            'catatan_pembimbing.required' => 'Alasan penolakan wajib diisi',
            'catatan_pembimbing.min' => 'Alasan penolakan minimal 10 karakter',
        ]);

        try {
            $logbook->reject(
                Auth::user(),
                $validated['catatan_pembimbing']
            );

            return back()->with('success', 'Logbook berhasil ditolak');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menolak logbook: ' . $e->getMessage());
        }
    }

    public function requestRevision(Request $request, Logbook $logbook)
    {
        if (!Auth::user()->isAdmin()) {
            return back()->with('error', 'Anda tidak memiliki akses untuk meminta revisi logbook');
        }
        if ($logbook->status !== 'pending') {
            return back()->with('error', 'Logbook ini sudah diproses sebelumnya');
        }
        $validated = $request->validate([
            'catatan_pembimbing' => 'required|string|min:10|max:1000',
        ], [
            'catatan_pembimbing.required' => 'Catatan revisi wajib diisi',
            'catatan_pembimbing.min' => 'Catatan revisi minimal 10 karakter',
        ]);

        try {
            $logbook->requestRevision(
                Auth::user(),
                $validated['catatan_pembimbing']
            );

            return back()->with('success', 'Permintaan revisi berhasil dikirim');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal meminta revisi: ' . $e->getMessage());
        }
    }
}
