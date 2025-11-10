<?php

namespace App\Http\Controllers;

use App\Models\PesertaProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class PendaftaranController extends Controller
{
    public function index()
    {
        return Inertia::render('pendaftaran');
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [

                'jenjang' => 'required|in:universitas,smk',
                'nim' => 'required_if:jenjang,universitas|nullable|string|max:50',
                'nama_univ' => 'required_if:jenjang,universitas|nullable|string|max:255',
                'nis' => 'required_if:jenjang,smk|nullable|string|max:50',
                'nama_sekolah' => 'required_if:jenjang,smk|nullable|string|max:255',

                'nama_lengkap' => 'required|string|max:255',
                'tempat_lahir' => 'required|string|max:100',
                'tanggal_lahir' => 'required|date|before:today',
                'jenis_kelamin' => 'required|in:L,P',

                'tanggal_mulai' => 'required|date|after_or_equal:today',
                'tanggal_selesai' => 'required|date|after:tanggal_mulai',

                'cv' => 'required|file|mimes:pdf|max:2048',
                'surat_pengantar' => 'nullable|file|mimes:pdf|max:2048',
            ], [
                'nim.required_if' => 'NIM wajib diisi untuk mahasiswa',
                'nama_univ.required_if' => 'Nama universitas wajib diisi untuk mahasiswa',
                'nis.required_if' => 'NIS wajib diisi untuk siswa SMK',
                'nama_sekolah.required_if' => 'Nama sekolah wajib diisi untuk siswa SMK',
                'nama_lengkap.required' => 'Nama lengkap wajib diisi',
                'tempat_lahir.required' => 'Tempat lahir wajib diisi',
                'tanggal_lahir.required' => 'Tanggal lahir wajib diisi',
                'tanggal_lahir.before' => 'Tanggal lahir harus sebelum hari ini',
                'jenis_kelamin.required' => 'Jenis kelamin wajib dipilih',
                'tanggal_mulai.required' => 'Tanggal mulai magang wajib diisi',
                'tanggal_mulai.after_or_equal' => 'Tanggal mulai magang tidak boleh di masa lalu',
                'tanggal_selesai.required' => 'Tanggal selesai magang wajib diisi',
                'tanggal_selesai.after' => 'Tanggal selesai harus setelah tanggal mulai',
                'cv.required' => 'CV wajib diunggah',
                'cv.mimes' => 'CV harus berformat PDF',
                'cv.max' => 'Ukuran CV maksimal 2MB',
                'surat_pengantar.mimes' => 'Surat pengantar harus berformat PDF',
                'surat_pengantar.max' => 'Ukuran surat pengantar maksimal 2MB',
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }

            DB::beginTransaction();

            $cvPath = null;
            if ($request->hasFile('cv')) {
                $cvPath = $request->file('cv')->store('temp/cv', 'public');
            }

            $suratPath = null;
            if ($request->hasFile('surat_pengantar')) {
                $suratPath = $request->file('surat_pengantar')->store('temp/surat', 'public');
            }

            $tempData = [
                'jenis_peserta' => $request->jenjang === 'universitas' ? 'mahasiswa' : 'siswa',
                'nim_nisn' => $request->jenjang === 'universitas' ? $request->nim : $request->nis,
                'asal_instansi' => $request->jenjang === 'universitas' ? $request->nama_univ : $request->nama_sekolah,
                'nama_lengkap' => $request->nama_lengkap,
                'tempat_lahir' => $request->tempat_lahir,
                'tanggal_lahir' => $request->tanggal_lahir,
                'jenis_kelamin' => $request->jenis_kelamin,
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
                'cv_path' => $cvPath,
                'surat_pengantar_path' => $suratPath,
                'submitted_at' => now()->toDateTimeString(),
                'status' => 'pending',
            ];

            if (Auth::check()) {
                $user = Auth::user();
                $pesertaProfile = PesertaProfile::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'temp_data_magang' => $tempData,
                        'jenis_peserta' => $tempData['jenis_peserta'],
                        'nim_nisn' => $tempData['nim_nisn'],
                        'asal_instansi' => $tempData['asal_instansi'],
                        'tanggal_lahir' => $tempData['tanggal_lahir'],
                        'jenis_kelamin' => $tempData['jenis_kelamin'],
                        'cv' => $cvPath,
                        'surat_pengantar' => $suratPath,
                    ]
                );

                if ($user->name !== $request->nama_lengkap) {
                    $user->update(['name' => $request->nama_lengkap]);
                }
            } else {
                session(['temp_pendaftaran' => $tempData]);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Pendaftaran berhasil dikirim! Data Anda sedang dalam proses verifikasi.');

        } catch (\Exception $e) {
            DB::rollBack();

            if (isset($cvPath)) {
                Storage::disk('public')->delete($cvPath);
            }
            if (isset($suratPath)) {
                Storage::disk('public')->delete($suratPath);
            }

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Get temp data untuk review sebelum final submit
     */
    public function getTempData()
    {
        if (Auth::check()) {
            $pesertaProfile = PesertaProfile::where('user_id', Auth::id())->first();

            if ($pesertaProfile && $pesertaProfile->temp_data_magang) {
                return response()->json([
                    'success' => true,
                    'data' => $pesertaProfile->temp_data_magang
                ]);
            }
        } else {
            $tempData = session('temp_pendaftaran');

            if ($tempData) {
                return response()->json([
                    'success' => true,
                    'data' => $tempData
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Tidak ada data pendaftaran'
        ], 404);
    }

    /**
     * Clear temp data
     */
    public function clearTempData()
    {
        if (Auth::check()) {
            $pesertaProfile = PesertaProfile::where('user_id', Auth::id())->first();

            if ($pesertaProfile) {
                // Hapus file temporary
                if ($pesertaProfile->temp_data_magang) {
                    $tempData = $pesertaProfile->temp_data_magang;

                    if (isset($tempData['cv_path'])) {
                        Storage::disk('public')->delete($tempData['cv_path']);
                    }
                    if (isset($tempData['surat_pengantar_path'])) {
                        Storage::disk('public')->delete($tempData['surat_pengantar_path']);
                    }
                }

                $pesertaProfile->update(['temp_data_magang' => null]);
            }
        } else {
            session()->forget('temp_pendaftaran');
        }

        return response()->json([
            'success' => true,
            'message' => 'Data temporary berhasil dihapus'
        ]);
    }
}
