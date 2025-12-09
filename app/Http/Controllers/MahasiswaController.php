<?php

namespace App\Http\Controllers;

use App\Models\PesertaProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class MahasiswaController extends Controller
{
    public function index(){
        $search = request('search');
        $status = request('status');
        $query = PesertaProfile::with('user', 'penilaianAkhir', 'sertifikat');

        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            })->orWhere('nim_nisn', 'like', '%' . $search . '%')
              ->orWhere('asal_instansi', 'like', '%' . $search . '%');
        }

        $query->whereHas('user', function ($q) {
            $q->where('status', 'diterima');
        });


        $mahasiswaData = $query->paginate(10)->through(function ($peserta) {
            $start = Carbon::parse($peserta->tanggal_mulai);
            $end = Carbon::parse($peserta->tanggal_selesai);
            $weeks = round($start->diffInWeeks($end));

            $statusLabels = [
                'pending' => 'Menunggu Verifikasi',
                'diterima' => 'Aktif',
                'ditolak' => 'Ditolak',
            ];

            return [
                'id' => $peserta->id,
                'nama_lengkap' => $peserta->user->name,
                'email' => $peserta->user->email,
                'nim_nisn' => $peserta->nim_nisn,
                'asal_instansi' => $peserta->asal_instansi,
                'jurusan' => $peserta->jurusan,
                'tanggal_mulai' => $peserta->tanggal_mulai->format('d F Y'),
                'tanggal_selesai' => $peserta->tanggal_selesai->format('d F Y'),
                'waktu' => $weeks . ' Minggu',
                'status' => $statusLabels[$peserta->user->status] ?? 'Tidak Diketahui',
                'nilai_akhir' => $peserta->penilaianAkhir ? $peserta->penilaianAkhir->nilai_total : null,
                'predikat' => $peserta->penilaianAkhir ? $peserta->penilaianAkhir->predikat : null,
                'sertifikat' => $peserta->sertifikat ? $peserta->sertifikat->getFile() : null,
            ];
        });
        return Inertia::render('mahasiswa/index', [
            'mahasiswaData' => $mahasiswaData,
        ]);
    }

    public function show($id){
        $peserta = PesertaProfile::with('user', 'penilaianAkhir', 'sertifikat')->findOrFail($id);
        if (! $peserta->user || ($peserta->user->status ?? null) !== 'diterima') {
            abort(404);
        }

        $start = Carbon::parse($peserta->tanggal_mulai);
        $end = Carbon::parse($peserta->tanggal_selesai);
        $weeks = round($start->diffInWeeks($end));

        $statusLabels = [
            'pending' => 'Menunggu Verifikasi',
            'diterima' => 'Aktif',
            'ditolak' => 'Ditolak',
        ];

        $data = [
            'id' => $peserta->id,
            'nama_lengkap' => $peserta->user->name,
            'email' => $peserta->user->email,
            'phone' => $peserta->user->phone ?? '',
            'tempat_lahir' => $peserta->tempat_lahir ?? '',
            'tanggal_lahir' => $peserta->tanggal_lahir ? $peserta->tanggal_lahir->format('d F Y') : '',
            'jenis_kelamin' => $peserta->jenis_kelamin ?? '',
            'alamat' => $peserta->alamat ?? '',
            'kota' => $peserta->kota ?? '',
            'provinsi' => $peserta->provinsi ?? '',
            'jenis_peserta' => $peserta->jenis_peserta ?? '',
            'nim_nisn' => $peserta->nim_nisn,
            'asal_instansi' => $peserta->asal_instansi,
            'jurusan' => $peserta->jurusan,
            'semester_kelas' => $peserta->semester_kelas ?? '',
            'nama_pembimbing' => $peserta->nama_pembimbing_sekolah ?? '',
            'no_hp_pembimbing' => $peserta->no_hp_pembimbing_sekolah ?? '',
            'tanggal_mulai' => $peserta->tanggal_mulai ? $peserta->tanggal_mulai->toDateString() : null,
            'tanggal_selesai' => $peserta->tanggal_selesai ? $peserta->tanggal_selesai->toDateString() : null,
            'waktu' => $weeks . ' Minggu',
            'status' => $statusLabels[$peserta->user->status] ?? 'Tidak Diketahui',
            'cv' => $peserta->getCv(),
            'surat_pengantar' => $peserta->getSuratPengantar(),
            'alasan_tolak' => $peserta->alasan_tolak ?? '',
            'nilai_akhir' => $peserta->penilaianAkhir ? $peserta->penilaianAkhir->nilai_total : null,
            'predikat' => $peserta->penilaianAkhir ? $peserta->penilaianAkhir->predikat : null,
            'sertifikat' => $peserta->sertifikat ? $peserta->sertifikat->getFile() : null,
            'logbook_count' => $peserta->logbook()->count(),
            'logbook_link' => route('logbook.mahasiswa.show', ['pesertaProfileId' => $peserta->id]),
        ];

        return Inertia::render('mahasiswa/show', [
            'pendaftar' => $data,
        ]);
    }
}
