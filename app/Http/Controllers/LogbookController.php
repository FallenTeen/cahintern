<?php

namespace App\Http\Controllers;

use App\Models\Logbook;
use App\Models\PesertaProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class LogbookController extends Controller
{
    public function index(){
        $search = request('search');
        $status = request('status');
        $tanggal = request('tanggal');

        $query = Logbook::with('pesertaProfile.user', 'pesertaProfile.bidangMagang');

        if ($search) {
            $query->whereHas('pesertaProfile.user', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            })->orWhereHas('pesertaProfile.bidangMagang', function ($q) use ($search) {
                $q->where('nama_bidang', 'like', '%' . $search . '%');
            })->orWhere('kegiatan', 'like', '%' . $search . '%');
        }

        if ($status && $status !== 'semua') {
            $query->where('status', $status);
        }

        if ($tanggal) {
            $query->whereDate('tanggal', $tanggal);
        }

        $logbookData = $query->paginate(10)->through(function ($logbook) {
            return [
                'id' => $logbook->id,
                'nama_peserta' => $logbook->pesertaProfile->user->name,
                'bidang_magang' => $logbook->pesertaProfile->bidangMagang->nama_bidang,
                'tanggal' => $logbook->tanggal->format('d F Y'),
                'kegiatan' => $logbook->kegiatan,
                'deskripsi' => $logbook->deskripsi,
                'jam_mulai' => $logbook->jam_mulai ? $logbook->jam_mulai->format('H:i') : null,
                'jam_selesai' => $logbook->jam_selesai ? $logbook->jam_selesai->format('H:i') : null,
                'durasi' => $logbook->getFormattedDurationAttribute(),
                'status' => $logbook->status,
                'status_label' => $logbook->getStatusLabelAttribute(),
                'catatan_pembimbing' => $logbook->catatan_pembimbing,
                'dokumentasi' => $logbook->dokumentasi ? asset('storage/' . $logbook->dokumentasi) : null,
            ];
        });

        return Inertia::render('logbook/index', [
            'logbookData' => $logbookData,
        ]);
    }
}
