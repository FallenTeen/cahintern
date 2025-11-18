<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\PesertaProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AbsensiController extends Controller
{
    public function index(){
        $search = request('search');
        $status = request('status');
        $tanggal = request('tanggal');

        $query = Absensi::with('pesertaProfile.user', 'pesertaProfile.bidangMagang');

        if ($search) {
            $query->whereHas('pesertaProfile.user', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            })->orWhereHas('pesertaProfile.bidangMagang', function ($q) use ($search) {
                $q->where('nama_bidang', 'like', '%' . $search . '%');
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
                'bidang_magang' => $absensi->pesertaProfile->bidangMagang->nama_bidang,
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

        return Inertia::render('absensi/index', [
            'absensiData' => $absensiData,
        ]);
    }
}
