<?php

namespace App\Http\Controllers;

use App\Models\PenilaianAkhir;
use App\Models\PesertaProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PenilaianController extends Controller
{
    public function index(){
        $search = request('search');
        $status = request('status');
        $predikat = request('predikat');

        $query = PenilaianAkhir::with('pesertaProfile.user');

        if ($search) {
            $query->whereHas('pesertaProfile.user', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            });
        }

        if ($status && $status !== 'semua') {
            $query->where('status', $status);
        }

        if ($predikat && $predikat !== 'semua') {
            $query->where('predikat', $predikat);
        }

        $penilaianData = $query->paginate(10)->through(function ($penilaian) {
            return [
                'id' => $penilaian->id,
                'nama_peserta' => $penilaian->pesertaProfile->user->name,
                'tanggal_penilaian' => $penilaian->tanggal_penilaian->format('d F Y'),
                'nilai_disiplin' => $penilaian->nilai_disiplin,
                'nilai_kerjasama' => $penilaian->nilai_kerjasama,
                'nilai_inisiatif' => $penilaian->nilai_inisiatif,
                'nilai_komunikasi' => $penilaian->nilai_komunikasi,
                'nilai_teknis' => $penilaian->nilai_teknis,
                'nilai_kreativitas' => $penilaian->nilai_kreativitas,
                'nilai_tanggung_jawab' => $penilaian->nilai_tanggung_jawab,
                'nilai_kehadiran' => $penilaian->nilai_kehadiran,
                'nilai_total' => $penilaian->nilai_total,
                'predikat' => $penilaian->predikat,
                'komentar' => $penilaian->komentar,
                'status' => $penilaian->status,
            ];
        });

        return Inertia::render('penilaianSertifikat/index', [
            'penilaianData' => $penilaianData,
        ]);
    }
}
