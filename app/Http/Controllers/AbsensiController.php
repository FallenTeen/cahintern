<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\PesertaProfile;
use App\Models\JadwalAbsensi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AbsensiController extends Controller
{
    public function index(){
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

    public function absensiPeserta (){
        $schedule = JadwalAbsensi::activeForDate(Carbon::today());
        return Inertia::render('user/absensiPeserta', [
            'schedule' => $schedule ? [
                'jam_buka' => Carbon::parse($schedule->jam_buka)->format('H:i'),
                'jam_tutup' => Carbon::parse($schedule->jam_tutup)->format('H:i'),
                'toleransi_menit' => $schedule->toleransi_menit,
            ] : null,
        ]);
    }

    public function updateSchedule(Request $request)
    {
        $validated = $request->validate([
            'jam_buka' => 'required|date_format:H:i',
            'jam_tutup' => 'required|date_format:H:i|after:jam_buka',
            'toleransi_menit' => 'nullable|integer|min:0',
            'effective_start_date' => 'required|date',
            'effective_end_date' => 'nullable|date|after_or_equal:effective_start_date',
        ]);

        $schedule = JadwalAbsensi::create([
            'jam_buka' => $validated['jam_buka'] . ':00',
            'jam_tutup' => $validated['jam_tutup'] . ':00',
            'toleransi_menit' => $validated['toleransi_menit'] ?? 0,
            'effective_start_date' => $validated['effective_start_date'],
            'effective_end_date' => $validated['effective_end_date'] ?? null,
        ]);

        return redirect()->route('absenMahasiswa')->with('success', 'Jadwal absensi diperbarui');
    }

    public function checkIn(Request $request)
    {
        $user = $request->user();
        $profile = PesertaProfile::where('user_id', $user->id)->firstOrFail();
        $now = Carbon::now();
        $tanggal = $now->toDateString();
        $schedule = JadwalAbsensi::activeForDate($tanggal);
        $open = $schedule ? Carbon::parse($tanggal . ' ' . $schedule->jam_buka) : Carbon::parse($tanggal . ' 08:00:00');
        $tolerance = $schedule ? (int) $schedule->toleransi_menit : 0;
        $status = $now->gt($open->copy()->addMinutes($tolerance)) ? 'terlambat' : 'hadir';

        $absensi = Absensi::firstOrNew([
            'peserta_profile_id' => $profile->id,
            'tanggal' => $tanggal,
        ]);

        if ($absensi->jam_masuk) {
            return response()->json(['message' => 'Sudah absen datang'], 400);
        }

        $absensi->jam_masuk = $now;
        if (!$absensi->status) {
            $absensi->status = $status;
        }
        $absensi->save();

        return response()->json(['message' => 'Absen datang tercatat', 'status' => $absensi->status]);
    }

    public function checkOut(Request $request)
    {
        $user = $request->user();
        $profile = PesertaProfile::where('user_id', $user->id)->firstOrFail();
        $now = Carbon::now();
        $tanggal = $now->toDateString();

        $absensi = Absensi::where('peserta_profile_id', $profile->id)
            ->whereDate('tanggal', $tanggal)
            ->first();

        if (!$absensi) {
            return response()->json(['message' => 'Belum absen datang'], 400);
        }

        if ($absensi->jam_keluar) {
            return response()->json(['message' => 'Sudah absen pulang'], 400);
        }

        $absensi->jam_keluar = $now;
        $absensi->save();

        return response()->json(['message' => 'Absen pulang tercatat']);
    }

    public function requestIzin(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'tipe' => 'required|in:izin,sakit',
            'keterangan' => 'nullable|string',
        ]);

        $user = $request->user();
        $profile = PesertaProfile::where('user_id', $user->id)->firstOrFail();

        $absensi = Absensi::firstOrNew([
            'peserta_profile_id' => $profile->id,
            'tanggal' => $validated['tanggal'],
        ]);

        $absensi->status = $validated['tipe'];
        $absensi->keterangan = $validated['keterangan'] ?? null;
        $absensi->save();

        return back()->with('success', 'Pengajuan ' . strtoupper($validated['tipe']) . ' dikirim');
    }
}
