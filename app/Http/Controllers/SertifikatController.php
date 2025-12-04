<?php

namespace App\Http\Controllers;

use App\Models\Sertifikat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SertifikatController extends Controller
{
    public function index()
    {
        return inertia::render('user/sertifikat');
    }

    public function adminIndex()
    {
        $sertifikatData = Sertifikat::with(['pesertaProfile.user', 'pesertaProfile.bidangMagang'])
            ->paginate(10)
            ->through(function ($s) {
                $status = 'belum';
                if ($s->file_path) {
                    $status = $s->is_published ? 'terbit' : 'proses';
                }

                return [
                    'id' => $s->id,
                    'nama_peserta' => $s->pesertaProfile->user->name ?? '',
                    'bidang_magang' => optional($s->pesertaProfile->bidangMagang)->nama_bidang ?? '',
                    'tanggal_terbit' => $s->tanggal_terbit ? $s->tanggal_terbit->format('d F Y') : '-',
                    'nomor_sertifikat' => $s->nomor_sertifikat,
                    'file_path' => $s->file_path,
                    'status' => $status,
                ];
            });

        return Inertia::render('penilaianSertifikat/index', [
            'sertifikatData' => $sertifikatData,
        ]);
    }

    public function picIndex()
    {
        $sertifikatData = Sertifikat::with(['pesertaProfile.user', 'pesertaProfile.bidangMagang'])
            ->paginate(10)
            ->through(function ($s) {
                $status = 'belum';
                if ($s->file_path) {
                    $status = $s->is_published ? 'terbit' : 'proses';
                }

                return [
                    'id' => $s->id,
                    'nama_peserta' => $s->pesertaProfile->user->name ?? '',
                    'bidang_magang' => optional($s->pesertaProfile->bidangMagang)->nama_bidang ?? '',
                    'tanggal_terbit' => $s->tanggal_terbit ? $s->tanggal_terbit->format('d F Y') : '-',
                    'nomor_sertifikat' => $s->nomor_sertifikat,
                    'file_path' => $s->file_path,
                    'status' => $status,
                ];
            });

        return Inertia::render('penilaianSertifikat/index', [
            'sertifikatData' => $sertifikatData,
        ]);
    }

    public function download(Sertifikat $sertifikat)
    {
        $path = $sertifikat->file_path;
        if (!$path) {
            abort(404, 'File sertifikat tidak tersedia.');
        }

        $fullPath = storage_path('app/public/' . $path);
        if (!file_exists($fullPath)) {
            abort(404, 'File sertifikat tidak ditemukan.');
        }

        return response()->download($fullPath, basename($fullPath));
    }

    public function regenerate(Request $request, Sertifikat $sertifikat)
    {
        $sertifikat->nomor_sertifikat = Sertifikat::generateNomorSertifikat();
        $sertifikat->tanggal_terbit = now()->toDateString();
        $sertifikat->is_published = false;

        $sertifikat->file_path = 'certificates/' . $sertifikat->peserta_profile_id . '_' . time() . '.pdf';
        $sertifikat->save();

        return response()->json([
            'message' => 'Sertifikat berhasil diregenerasi.',
            'sertifikat' => $sertifikat->only(['id','nomor_sertifikat','tanggal_terbit','file_path','is_published']),
        ]);
    }

    public function validateCertificate(Request $request, Sertifikat $sertifikat)
    {
        $sertifikat->is_published = true;
        $sertifikat->save();

        return response()->json([
            'message' => 'Sertifikat berhasil divalidasi/publish.',
            'sertifikat' => $sertifikat->only(['id','is_published']),
        ]);
    }
}
