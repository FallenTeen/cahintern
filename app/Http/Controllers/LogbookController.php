<?php

namespace App\Http\Controllers;

use App\Models\Logbook;
use App\Models\PesertaProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\LogbookHistory;
use App\Models\Notifikasi;
use Illuminate\Support\Facades\Log;

class LogbookController extends Controller
{
    public function index()
    {
        $search = request('search');
        $status = request('status');
        $tanggal = request('tanggal');
        $start = request('start');
        $end = request('end');
        $pesertaId = request('peserta_id');

        $query = Logbook::with('pesertaProfile.user');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('pesertaProfile.user', function ($subQ) use ($search) {
                    $subQ->where('name', 'like', '%' . $search . '%');
                })->orWhere('kegiatan', 'like', '%' . $search . '%');
            });
        }

        if ($status && $status !== 'semua') {
            $query->where('status', $status);
        }

        if ($tanggal) {
            $query->whereDate('tanggal', $tanggal);
        }
        if ($start) {
            $query->whereDate('tanggal', '>=', $start);
        }
        if ($end) {
            $query->whereDate('tanggal', '<=', $end);
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
                'start' => $start,
                'end' => $end,
                'peserta_id' => $pesertaId,
            ],
        ]);
    }

    public function userIndex(Request $request)
    {
        $profile = PesertaProfile::where('user_id', Auth::id())->firstOrFail();
        $logbooks = Logbook::where('peserta_profile_id', $profile->id);

        if ($request->tanggal) {
            $logbooks->whereDate('tanggal', $request->tanggal);
        }

        $logbooks = $logbooks
            ->orderBy('tanggal', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($logbook) {
                return [
                    'id' => $logbook->id,
                    'tanggal' => $logbook->tanggal->format('d M Y'),
                    'tanggal_raw' => $logbook->tanggal->format('Y-m-d'),
                    'kegiatan' => $logbook->kegiatan,
                    'deskripsi' => $logbook->deskripsi,
                    'jam_mulai' => $logbook->jam_mulai ? $logbook->jam_mulai->format('H:i') : null,
                    'jam_selesai' => $logbook->jam_selesai ? $logbook->jam_selesai->format('H:i') : null,
                    'hasil' => $logbook->hasil,
                    'dokumentasi' => $logbook->dokumentasi ? basename($logbook->dokumentasi) : null,
                    'status' => $logbook->status_label,
                ];
            });

        return Inertia::render('user/logBook', [
            'logbooks' => $logbooks,
            'filters' => $request->only(['tanggal']),
        ]);
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'kegiatan' => 'required|string|max:255',
            'deskripsi' => 'required|string|min:50',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'hasil' => 'required|string|min:3',
            'dokumentasi' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $profile = PesertaProfile::where('user_id', Auth::id())->firstOrFail();

        $path = null;
        if ($request->file('dokumentasi')) {
            $path = $request->file('dokumentasi')->store('logbook', 'public');
        }

        $logbook = Logbook::create([
            'peserta_profile_id' => $profile->id,
            'tanggal' => $validated['tanggal'],
            'kegiatan' => $validated['kegiatan'],
            'deskripsi' => $validated['deskripsi'],
            'jam_mulai' => $validated['jam_mulai'] . ':00',
            'jam_selesai' => $validated['jam_selesai'] . ':00',
            'hasil' => $validated['hasil'],
            'status' => 'pending',
            'dokumentasi' => $path,
        ]);
        LogbookHistory::create([
            'logbook_id' => $logbook->id,
            'user_id' => Auth::id(),
            'action' => 'create',
            'note' => null,
        ]);

        return back()->with('success', 'Logbook berhasil dikirim');
    }

    public function updateUser(Request $request, Logbook $logbook)
    {
        $profile = PesertaProfile::where('user_id', Auth::id())->firstOrFail();

        if ($logbook->peserta_profile_id !== $profile->id) {
            return back()->with('error', 'Tidak diizinkan');
        }

        // HANYA revision & ditolak yang boleh edit
        if (!in_array($logbook->status, ['revision', 'ditolak'])) {
            return back()->with('error', 'Logbook tidak dapat diedit');
        }

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'kegiatan' => 'required|string|max:255',
            'deskripsi' => 'required|string|min:50',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'hasil' => 'required|string|min:3',
            'dokumentasi' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($request->hasFile('dokumentasi')) {
            $logbook->dokumentasi = $request
                ->file('dokumentasi')
                ->store('logbook', 'public');
        }

        $logbook->update([
            'tanggal' => $validated['tanggal'],
            'kegiatan' => $validated['kegiatan'],
            'deskripsi' => $validated['deskripsi'],
            'jam_mulai' => $validated['jam_mulai'] . ':00',
            'jam_selesai' => $validated['jam_selesai'] . ':00',
            'hasil' => $validated['hasil'],
            'status' => 'pending',
        ]);

        LogbookHistory::create([
            'logbook_id' => $logbook->id,
            'user_id' => Auth::id(),
            'action' => 'update',
            'note' => null,
        ]);

        return back()->with('success', 'Logbook berhasil direvisi dan menunggu persetujuan');
    }


    public function destroyUser(Logbook $logbook)
    {
        $profile = PesertaProfile::where('user_id', Auth::id())->firstOrFail();
        if ($logbook->peserta_profile_id !== $profile->id) {
            return back()->with('error', 'Tidak diizinkan');
        }
        if (!in_array($logbook->status, ['pending', 'revision'])) {
            return back()->with('error', 'Tidak dapat menghapus logbook yang sudah diproses');
        }

        $id = $logbook->id;
        $logbook->delete();

        LogbookHistory::create([
            'logbook_id' => $id,
            'user_id' => Auth::id(),
            'action' => 'delete',
            'note' => null,
        ]);

        return back()->with('success', 'Logbook dihapus');
    }

    public function exportCsv(Request $request)
    {
        $query = Logbook::with('pesertaProfile.user');
        if ($request->filled('status') && $request->status !== 'semua') {
            $query->where('status', $request->status);
        }
        if ($request->filled('start')) {
            $query->whereDate('tanggal', '>=', $request->start);
        }
        if ($request->filled('end')) {
            $query->whereDate('tanggal', '<=', $request->end);
        }
        if ($request->filled('peserta_id')) {
            $query->where('peserta_profile_id', $request->peserta_id);
        }
        $rows = $query->orderBy('tanggal', 'desc')->get();
        $csv = "Nama,Tanggal,Jam Mulai,Jam Selesai,Durasi,Judul,Deskripsi,Status\n";
        foreach ($rows as $r) {
            $csv .= sprintf(
                "%s,%s,%s,%s,%s,%s,%s,%s\n",
                $r->pesertaProfile->user->name,
                $r->tanggal->format('d/m/Y'),
                $r->jam_mulai ? $r->jam_mulai->format('H:i') : '',
                $r->jam_selesai ? $r->jam_selesai->format('H:i') : '',
                $r->formatted_duration,
                str_replace(["\n", ","], [' ', ' '], $r->kegiatan),
                str_replace(["\n", ","], [' ', ' '], $r->deskripsi),
                $r->status_label
            );
        }
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="logbook_export.csv"',
        ]);
    }

    public function exportUserCsv(Request $request)
    {
        $profile = PesertaProfile::where('user_id', Auth::id())->firstOrFail();
        $query = Logbook::where('peserta_profile_id', $profile->id);
        if ($request->filled('start')) {
            $query->whereDate('tanggal', '>=', $request->start);
        }
        if ($request->filled('end')) {
            $query->whereDate('tanggal', '<=', $request->end);
        }
        $rows = $query->orderBy('tanggal', 'desc')->get();
        $csv = "Tanggal,Jam Mulai,Jam Selesai,Durasi,Judul,Deskripsi,Status\n";
        foreach ($rows as $r) {
            $csv .= sprintf(
                "%s,%s,%s,%s,%s,%s,%s\n",
                $r->tanggal->format('d/m/Y'),
                $r->jam_mulai ? $r->jam_mulai->format('H:i') : '',
                $r->jam_selesai ? $r->jam_selesai->format('H:i') : '',
                $r->formatted_duration,
                str_replace(["\n", ","], [' ', ' '], $r->kegiatan),
                str_replace(["\n", ","], [' ', ' '], $r->deskripsi),
                $r->status_label
            );
        }
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="logbook_saya.csv"',
        ]);
    }

    public function showLogbookMahasiswa($pesertaProfileId)
    {
        $pesertaProfile = PesertaProfile::with('user')->findOrFail($pesertaProfileId);

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
            $query->where(function ($q) use ($search) {
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
            $statisticsQuery->where(function ($q) use ($search) {
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
        $logbook->load('pesertaProfile.user', 'approvedBy');

        $logbookDetail = [
            'id' => $logbook->id,
            'peserta' => [
                'id' => $logbook->pesertaProfile->id,
                'nama' => $logbook->pesertaProfile->user->name,
                'nim_nisn' => $logbook->pesertaProfile->nim_nisn,
                'email' => $logbook->pesertaProfile->user->email,
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
            'hasil' => $logbook->hasil,
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
            LogbookHistory::create([
                'logbook_id' => $logbook->id,
                'user_id' => Auth::id(),
                'action' => 'approve',
                'note' => $validated['catatan_pembimbing'] ?? null,
            ]);
            Notifikasi::create([
                'user_id' => $logbook->pesertaProfile->user_id,
                'judul' => 'Logbook Disetujui',
                'pesan' => 'Logbook tanggal ' . $logbook->tanggal->format('d M Y') . ' telah disetujui.',
                'tipe' => 'success',
                'dibaca' => false,
            ]);

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
            LogbookHistory::create([
                'logbook_id' => $logbook->id,
                'user_id' => Auth::id(),
                'action' => 'reject',
                'note' => $validated['catatan_pembimbing'],
            ]);
            Notifikasi::create([
                'user_id' => $logbook->pesertaProfile->user_id,
                'judul' => 'Logbook Ditolak',
                'pesan' => 'Logbook tanggal ' . $logbook->tanggal->format('d M Y') . ' ditolak. Alasan: ' . $validated['catatan_pembimbing'],
                'tipe' => 'warning',
                'dibaca' => false,
            ]);

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
            LogbookHistory::create([
                'logbook_id' => $logbook->id,
                'user_id' => Auth::id(),
                'action' => 'revision',
                'note' => $validated['catatan_pembimbing'],
            ]);
            Notifikasi::create([
                'user_id' => $logbook->pesertaProfile->user_id,
                'judul' => 'Logbook Perlu Revisi',
                'pesan' => 'Logbook tanggal ' . $logbook->tanggal->format('d M Y') . ' memerlukan revisi. Catatan: ' . $validated['catatan_pembimbing'],
                'tipe' => 'info',
                'dibaca' => false,
            ]);

            return back()->with('success', 'Permintaan revisi berhasil dikirim');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal meminta revisi: ' . $e->getMessage());
        }
    }
}
