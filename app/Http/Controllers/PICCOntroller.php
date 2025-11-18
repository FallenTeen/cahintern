<?php

namespace App\Http\Controllers;

use App\Models\PesertaProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PICCOntroller extends Controller
{
    public function index(){
        $search = request('search');
        $status = request('status');
        $bidang = request('bidang');

        $query = PesertaProfile::with('user', 'bidangMagang', 'absensis', 'logbooks', 'penilaianAkhir');

        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            })->orWhere('nim_nisn', 'like', '%' . $search . '%');
        }

        if ($status && $status !== 'semua') {
            $query->whereHas('user', function ($q) use ($status) {
                $q->where('status', $status);
            });
        }

        if ($bidang && $bidang !== 'semua') {
            $query->where('bidang_magang_id', $bidang);
        }

        $picData = $query->paginate(10)->through(function ($peserta) {
            $start = Carbon::parse($peserta->tanggal_mulai);
            $end = Carbon::parse($peserta->tanggal_selesai);
            $weeks = round($start->diffInWeeks($end));

            $statusLabels = [
                'pending' => 'Menunggu Verifikasi',
                'diterima' => 'Aktif',
                'ditolak' => 'Ditolak',
            ];

            $absensiCount = $peserta->absensis->count();
            $logbookCount = $peserta->logbooks->count();
            $logbookApproved = $peserta->logbooks->where('status', 'disetujui')->count();

            return [
                'id' => $peserta->id,
                'nama_lengkap' => $peserta->user->name,
                'email' => $peserta->user->email,
                'nim_nisn' => $peserta->nim_nisn,
                'asal_instansi' => $peserta->asal_instansi,
                'bidang_magang' => $peserta->bidangMagang->nama_bidang,
                'tanggal_mulai' => $peserta->tanggal_mulai->format('d F Y'),
                'tanggal_selesai' => $peserta->tanggal_selesai->format('d F Y'),
                'waktu' => $weeks . ' Minggu',
                'status' => $statusLabels[$peserta->user->status] ?? 'Tidak Diketahui',
                'absensi_count' => $absensiCount,
                'logbook_count' => $logbookCount,
                'logbook_approved' => $logbookApproved,
                'nilai_akhir' => $peserta->penilaianAkhir ? $peserta->penilaianAkhir->nilai_total : null,
                'predikat' => $peserta->penilaianAkhir ? $peserta->penilaianAkhir->predikat : null,
            ];
        });

        $bidangOptions = \App\Models\BidangMagang::select('id', 'nama_bidang')->get();

        return Inertia::render('pic/index', [
            'picData' => $picData,
            'bidangOptions' => $bidangOptions,
        ]);
    }
}
