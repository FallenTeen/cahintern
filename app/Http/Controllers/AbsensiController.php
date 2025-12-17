<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\PesertaProfile;
use App\Models\JadwalAbsensi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AbsensiController extends Controller
{
    public function index()
    {
        $search = request('search');
        $status = request('status');
        $tanggal = request('tanggal');

        $query = Absensi::with('pesertaProfile.user');

        if ($search) {
            $query->whereHas('pesertaProfile.user', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            });
        }

        if ($status && $status !== 'semua') {
            $query->where('status', $status);
        }

        if ($tanggal) {
            $query->whereDate('tanggal', $tanggal);
        }

        $absensiData = $query->paginate(10)->through(function ($absensi) {
            return [
                'id' => $absensi->id,
                'nama_peserta' => $absensi->pesertaProfile->user->name,
                'tanggal' => $absensi->tanggal->format('d F Y'),
                'jam_masuk' => $absensi->jam_masuk ? $absensi->jam_masuk->format('H:i') : null,
                'jam_keluar' => $absensi->jam_keluar ? $absensi->jam_keluar->format('H:i') : null,
                'status' => $absensi->status,
                'status_label' => $absensi->getStatusLabel(),
                'keterangan' => $absensi->keterangan,
                'foto_masuk' => $absensi->getFotoMasuk(),
                'foto_keluar' => $absensi->getFotoKeluarUrl(),
            ];
        });

        $schedule = JadwalAbsensi::activeForDate(Carbon::today());

        return Inertia::render('absensi/index', [
            'absensiData' => $absensiData,
            'schedule' => $schedule ? [
                'jam_buka' => Carbon::parse($schedule->jam_buka)->format('H:i'),
                'jam_tutup' => Carbon::parse($schedule->jam_tutup)->format('H:i'),
                'toleransi_menit' => $schedule->toleransi_menit,
                'effective_start_date' => $schedule->effective_start_date->format('Y-m-d'),
                'effective_end_date' => $schedule->effective_end_date ? $schedule->effective_end_date->format('Y-m-d') : null,
            ] : null,
        ]);
    }

public function absensiPeserta()
{
    $user = Auth::user();

    $profileId = $user->pesertaProfile->id;

    $absensiData = Absensi::where('peserta_profile_id', $profileId)
        ->orderBy('tanggal', 'desc')
        ->paginate(5);

    $schedule = JadwalAbsensi::activeForDate(Carbon::today());

    $formattedAbsensi = $absensiData->through(function ($log) {
        return [
            'id' => $log->id,
            'tanggal' => $log->tanggal->format('Y-m-d'),
            'jam_masuk' => $log->jam_masuk
                ? Carbon::parse($log->jam_masuk)->format('H:i')
                : null,
            'jam_keluar' => $log->jam_keluar
                ? Carbon::parse($log->jam_keluar)->format('H:i')
                : null,
            'keterangan' => $log->keterangan,
            'status' => $log->status,
        ];
    });

    return Inertia::render('user/absensiPeserta', [
        'schedule' => $schedule ? [
            'jam_buka' => Carbon::parse($schedule->jam_buka)->format('H:i'),
            'jam_tutup' => Carbon::parse($schedule->jam_tutup)->format('H:i'),
            'toleransi_menit' => $schedule->toleransi_menit,
        ] : null,
        'absensiData' => $formattedAbsensi,
    ]);
}



    public function storeSchedule(Request $request)
    {
        $validated = $request->validate([
            'jam_buka' => 'required|date_format:H:i',
            'jam_tutup' => 'required|date_format:H:i|after:jam_buka',
            'toleransi_menit' => 'nullable|integer|min:0',
        ]);

        $schedule = JadwalAbsensi::first();

        if (!$schedule) {
            JadwalAbsensi::create([
                'jam_buka' => $validated['jam_buka'],
                'jam_tutup' => $validated['jam_tutup'],
                'toleransi_menit' => $validated['toleransi_menit'] ?? 0,
                'effective_start_date' => Carbon::now()->toDateString(),
                'effective_end_date' => Carbon::now()->toDateString(),
            ]);
        } else {
            $schedule->update([
                'jam_buka' => $validated['jam_buka'],
                'jam_tutup' => $validated['jam_tutup'],
                'toleransi_menit' => $validated['toleransi_menit'] ?? 0,
                'effective_start_date' => Carbon::now()->toDateString(),
                'effective_end_date' => Carbon::now()->toDateString(),
            ]);
        }

        return back()->with('success', 'Jadwal absensi berhasil diperbarui');
    }


    public function checkIn(Request $request)
    {
        $user = $request->user();
        $profile = PesertaProfile::where('user_id', $user->id)->firstOrFail();

        $now = Carbon::now();
        $tanggal = $now->toDateString();

        $schedule = JadwalAbsensi::activeForDate($tanggal);

        // Tidak ada jadwal atau jam buka / tutup kosong
        if (!$schedule || empty($schedule->jam_buka) || empty($schedule->jam_tutup)) {
            return back()->with('error', 'Absensi belum dibuka. Jadwal belum tersedia.');
        }

        // Tidak bisa absen tanggal lampau
        if ($tanggal < Carbon::now()->toDateString()) {
            return back()->with('error', 'Tidak bisa absen untuk tanggal lampau.');
        }

        $open = Carbon::parse($tanggal . ' ' . $schedule->jam_buka);
        $tolerance = (int) ($schedule->toleransi_menit ?? 0);
        $statusMasuk = $now->gt($open->copy()->addMinutes($tolerance)) ? 'terlambat' : 'hadir';

        $absensi = Absensi::firstOrNew([
            'peserta_profile_id' => $profile->id,
            'tanggal' => $tanggal,
        ]);

        // izin / sakit tidak boleh check-in
        if (in_array($absensi->status, ['izin', 'sakit'])) {
            return back()->with(
                'error',
                'Anda berstatus ' . strtoupper($absensi->status) . ', tidak bisa absen datang.'
            );
        }

        // Sudah check-in
        if ($absensi->jam_masuk) {
            return back()->with('error', 'Sudah absen datang.');
        }

        $absensi->jam_masuk = $now;
        $absensi->status = $statusMasuk;
        $absensi->save();

        return back()->with('success', 'Absen datang tercatat. Status ' . $absensi->status);
    }



    public function checkOut(Request $request)
    {
        $user = $request->user();
        $profile = PesertaProfile::where('user_id', $user->id)->firstOrFail();

        $now = Carbon::now();
        $tanggal = $now->toDateString();

        $schedule = JadwalAbsensi::activeForDate($tanggal);

        // Tidak ada jadwal atau jam buka / tutup kosong
        if (!$schedule || empty($schedule->jam_buka) || empty($schedule->jam_tutup)) {
            return back()->with('error', 'Absensi belum dibuka. Jadwal belum tersedia.');
        }

        // Tidak bisa absen tanggal lampau
        if ($tanggal < Carbon::now()->toDateString()) {
            return back()->with(
                'error',
                'Tidak bisa absen untuk tanggal lampau.'
            );
        }

        $absensi = Absensi::where('peserta_profile_id', $profile->id)
            ->where('tanggal', $tanggal)
            ->first();

        // Belum ada absensi
        if (!$absensi) {
            return back()->with('error', 'Belum absen datang.');
        }

        // izin / sakit tidak boleh check-out
        if (in_array($absensi->status, ['izin', 'sakit'])) {
            return back()->with(
                'error',
                'Anda berstatus ' . strtoupper($absensi->status) . ', tidak bisa absen pulang.'
            );
        }

        // Belum check-in
        if (!$absensi->jam_masuk) {
            return back()->with('error', 'Anda belum melakukan absen datang.');
        }

        // Sudah check-out
        if ($absensi->jam_keluar) {
            return back()->with('error', 'Sudah absen pulang.');
        }

        $absensi->jam_keluar = $now;
        $absensi->save();

        return back()->with('success', 'Absen pulang tercatat.');
    }



    public function requestIzin(Request $request)
    {
        // Validasi awal
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'tipe' => 'required|in:izin,sakit',
            'keterangan' => 'required|string',
        ]);

        $user = $request->user();
        $profile = PesertaProfile::where('user_id', $user->id)->firstOrFail();

        // Cek absensi existing
        $absensi = Absensi::where('peserta_profile_id', $profile->id)
            ->whereDate('tanggal', $validated['tanggal'])
            ->first();

        // Sudah hadir → tidak boleh izin/sakit
        if ($absensi && in_array($absensi->status, ['hadir', 'terlambat'])) {
            return back()->with('error', 'Anda sudah absen hadir pada tanggal ini, tidak bisa mengajukan izin atau sakit.');
        }

        // Sudah izin/sakit → tidak boleh submit lagi
        if ($absensi && in_array($absensi->status, ['izin', 'sakit'])) {
            return back()->with('error', 'Anda sudah mengajukan ' . strtoupper($absensi->status) . ' pada tanggal ini.');
        }

        // Validasi file conditional (HARUS SEBELUM SIMPAN)
        $rules = [];
        if ($request->tipe === 'sakit') {
            $rules['surat'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:2048';
        } else {
            $rules['surat'] = 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048';
        }

        $validated = $request->validate($rules, [
            'surat.required' => 'Surat dokter wajib dilampirkan untuk sakit',
            'surat.file' => 'File harus berupa dokumen',
            'surat.mimes' => 'File harus berformat PDF, JPG, JPEG, atau PNG',
            'surat.max' => 'Ukuran file maksimal 2MB',
        ]);

        // Upload file jika ada
        $suratPath = null;
        if ($request->hasFile('surat')) {
            $suratPath = $request->file('surat')->store('surat-keterangan', 'public');
        }

        // Simpan izin/sakit (CREATE baru, bukan update)
        Absensi::create([
            'peserta_profile_id' => $profile->id,
            'tanggal' => $request->tanggal,
            'status' => $request->tipe,
            'keterangan' => $request->keterangan,
            'surat' => $suratPath,
            'jam_masuk' => null,
            'jam_keluar' => null,
        ]);

        return back()->with('success', 'Pengajuan ' . strtoupper($request->tipe) . ' berhasil dikirim!');
    }
}
