<?php

namespace App\Http\Controllers;

use App\Models\Izin;
use App\Models\Absensi;
use App\Models\PesertaProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class IzinController extends Controller
{
    public function index()
    {
        $search = request('search');
        $jenis = request('jenis');
        $start = request('start');
        $end = request('end');

        $query = Izin::with(['pesertaProfile.user', 'approvedBy']);

        if ($search) {
            $query->whereHas('pesertaProfile.user', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            });
        }
        if ($jenis && $jenis !== 'semua') {
            $query->where('jenis', $jenis);
        }
        if ($start) {
            $query->whereDate('tanggal', '>=', $start);
        }
        if ($end) {
            $query->whereDate('tanggal', '<=', $end);
        }

        $izins = $query->orderBy('tanggal', 'desc')->paginate(10)->through(function ($izin) {
            return [
                'id' => $izin->id,
                'nama_peserta' => $izin->pesertaProfile->user->name,
                'tanggal' => $izin->tanggal->format('Y-m-d'),
                'jenis' => $izin->jenis,
                'keterangan' => $izin->keterangan,
                'status' => $izin->status,
                'lokasi' => $izin->lokasi,
                'waktu_mulai' => $izin->waktu_mulai,
                'waktu_selesai' => $izin->waktu_selesai,
                'project_url' => $izin->project_url,
                'surat_tugas' => $izin->surat_tugas ? asset('storage/' . $izin->surat_tugas) : null,
            ];
        });

        $participants = PesertaProfile::with('user')
            ->get(['id', 'user_id'])
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'nama' => $p->user->name,
                ];
            });

        $rekap = Izin::selectRaw('peserta_profile_id, count(*) as total')
            ->when($start, function ($q) use ($start) { $q->whereDate('tanggal', '>=', $start); })
            ->when($end, function ($q) use ($end) { $q->whereDate('tanggal', '<=', $end); })
            ->groupBy('peserta_profile_id')
            ->get()
            ->map(function ($r) {
                $p = PesertaProfile::with('user')->find($r->peserta_profile_id);
                return [
                    'peserta_profile_id' => $r->peserta_profile_id,
                    'nama' => $p ? $p->user->name : '-',
                    'total' => $r->total,
                ];
            });

        return Inertia::render('izin/index', [
            'izins' => $izins,
            'participants' => $participants,
            'rekap' => $rekap,
            'filters' => [
                'search' => $search,
                'jenis' => $jenis,
                'start' => $start,
                'end' => $end,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'peserta_ids' => 'required|array|min:1',
            'peserta_ids.*' => 'integer|exists:peserta_profiles,id',
            'tanggal' => 'required|date',
            'jenis' => 'required|in:dinas_luar,sakit,terlambat,lainnya',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:pending,disetujui,ditolak',
            'lokasi' => 'nullable|string',
            'waktu_mulai' => 'nullable|date_format:H:i',
            'waktu_selesai' => 'nullable|date_format:H:i|after:waktu_mulai',
            'project_url' => 'nullable|url',
            'surat_tugas' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $path = null;
        if ($request->file('surat_tugas')) {
            $path = $request->file('surat_tugas')->store('surat_tugas', 'public');
        }

        $tanggal = $validated['tanggal'];
        $createdBy = Auth::id();

        foreach ($validated['peserta_ids'] as $pid) {
            $absensi = Absensi::where('peserta_profile_id', $pid)
                ->whereDate('tanggal', $tanggal)
                ->first();
            $existingIzinQuery = Izin::where('peserta_profile_id', $pid)
                ->whereDate('tanggal', $tanggal);
            if (!empty($validated['waktu_mulai']) && !empty($validated['waktu_selesai'])) {
                $existingIzinQuery->where(function ($q) use ($validated, $tanggal) {
                    $q->whereBetween('waktu_mulai', [$validated['waktu_mulai'], $validated['waktu_selesai']])
                      ->orWhereBetween('waktu_selesai', [$validated['waktu_mulai'], $validated['waktu_selesai']]);
                });
            }
            $existingIzin = $existingIzinQuery->first();

            if ($existingIzin) {
                return back()->with('error', 'Konflik izin dengan data yang sudah ada');
            }
            if ($absensi && in_array($absensi->status, ['hadir', 'terlambat'])) {
                return back()->with('error', 'Konflik dengan absensi hadir pada tanggal yang sama');
            }

            Izin::create([
                'peserta_profile_id' => $pid,
                'tanggal' => $tanggal,
                'jenis' => $validated['jenis'],
                'keterangan' => $validated['keterangan'] ?? null,
                'status' => $validated['status'],
                'lokasi' => $validated['lokasi'] ?? null,
                'waktu_mulai' => $validated['waktu_mulai'] ?? null,
                'waktu_selesai' => $validated['waktu_selesai'] ?? null,
                'project_url' => $validated['project_url'] ?? null,
                'surat_tugas' => $path,
                'created_by' => $createdBy,
                'approved_by' => $validated['status'] === 'disetujui' ? $createdBy : null,
                'approved_at' => $validated['status'] === 'disetujui' ? now() : null,
            ]);
        }

        return back()->with('success', 'Izin berhasil dibuat');
    }

    public function approve(Izin $izin)
    {
        $izin->update([
            'status' => 'disetujui',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);
        return back()->with('success', 'Izin disetujui');
    }

    public function reject(Request $request, Izin $izin)
    {
        $validated = $request->validate([
            'keterangan' => 'required|string|min:10',
        ]);
        $izin->update([
            'status' => 'ditolak',
            'keterangan' => $validated['keterangan'],
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);
        return back()->with('success', 'Izin ditolak');
    }
}

