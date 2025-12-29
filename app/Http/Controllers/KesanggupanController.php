<?php

namespace App\Http\Controllers;

use App\Models\PesertaProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class KesanggupanController extends Controller
{
    public function index()
    {
        $profile = PesertaProfile::where('user_id', Auth::id())->first();

        if (!$profile) {
            abort(403, 'Profil peserta belum dibuat');
        }

        return Inertia::render('user/formulir', [
            'surat_pengantar' => $profile?->surat_pengantar,
            'cv'              => $profile?->cv,
            'form_kesanggupan' => $profile?->form_kesanggupan,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        // VALIDASI
        $request->validate([
            'type' => 'required|in:form_kesanggupan,cv,surat_pengantar',
            $request->input('type') => 'required|file|mimes:pdf|max:2048',
        ]);

        $type = $request->input('type');

        // AMBIL DATA PESERTA
        $peserta = PesertaProfile::where('user_id', $user->id)->first();

        if (!$peserta) {
            return redirect()->back()->with('error', 'Data peserta tidak ditemukan');
        }

        // HAPUS FILE LAMA (JIKA ADA)
        if ($peserta->{$type}) {
            Storage::disk('public')->delete($peserta->{$type});
        }

        // UPLOAD FILE BARU
        $file = $request->file($type);
        $filename = $type . '_' . time() . '.pdf';

        $path = $file->storeAs(
            "dokumen/{$type}",
            $filename,
            'public'
        );

        // UPDATE DATABASE (DINAMIS)
        $peserta->update([
            $type => $path,
        ]);

        return redirect()->back()->with('success', 'Upload berhasil');
    }
}
