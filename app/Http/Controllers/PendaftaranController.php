<?php

namespace App\Http\Controllers;

use App\Models\PesertaProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PendaftaranController extends Controller
{
    public function create()
    {
        return Inertia::render('pendaftaran/create');
    }
    public function halPendaftaranGuest()
    {
        return Inertia::render('pendaftaran');
    }

    public function guestDaftar(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [

                'jenjang' => 'required|in:universitas,smk',
                'nim' => 'required_if:jenjang,universitas|nullable|string|max:50',
                'nama_univ' => 'required_if:jenjang,universitas|nullable|string|max:255',
                'jurusan' => 'required_if:jenjang,universitas|nullable|string|max:255',
                'semester' => 'required_if:jenjang,universitas|nullable|integer|min:1|max:14',

                'nis' => 'required_if:jenjang,smk|nullable|string|max:50',
                'nama_sekolah' => 'required_if:jenjang,smk|nullable|string|max:255',
                'kelas' => 'required_if:jenjang,smk|nullable|string|max:10',

                'nama_lengkap' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email',
                'phone' => 'required|string|max:20',
                'tempat_lahir' => 'required|string|max:100',
                'tanggal_lahir' => 'required|date|before:today',
                'jenis_kelamin' => 'required|in:L,P',
                'alamat' => 'required|string|max:500',
                'kota' => 'required|string|max:100',
                'provinsi' => 'required|string|max:100',

                'nama_pembimbing' => 'required_if:jenjang,smk|nullable|string|max:255',
                'no_hp_pembimbing' => 'required_if:jenjang,smk|nullable|string|max:20',

                'tanggal_mulai' => 'required|date|after_or_equal:today',
                'tanggal_selesai' => 'required|date|after:tanggal_mulai',

                'cv' => 'required|file|mimes:pdf|max:2048',
                'surat_pengantar' => 'nullable|file|mimes:pdf|max:2048',
            ], [

                'nim.required_if' => 'NIM wajib diisi untuk mahasiswa',
                'nama_univ.required_if' => 'Nama universitas wajib diisi untuk mahasiswa',
                'jurusan.required_if' => 'Jurusan/Program Studi wajib diisi untuk mahasiswa',
                'semester.required_if' => 'Semester wajib diisi untuk mahasiswa',
                'semester.min' => 'Semester minimal 1',
                'semester.max' => 'Semester maksimal 14',

                'nis.required_if' => 'NIS wajib diisi untuk siswa SMK',
                'nama_sekolah.required_if' => 'Nama sekolah wajib diisi untuk siswa SMK',
                'kelas.required_if' => 'Kelas wajib diisi untuk siswa SMK',

                'nama_lengkap.required' => 'Nama lengkap wajib diisi',
                'email.required' => 'Email wajib diisi',
                'email.email' => 'Format email tidak valid',
                'email.unique' => 'Email sudah terdaftar dalam sistem',
                'phone.required' => 'Nomor telepon wajib diisi',
                'tempat_lahir.required' => 'Tempat lahir wajib diisi',
                'tanggal_lahir.required' => 'Tanggal lahir wajib diisi',
                'tanggal_lahir.before' => 'Tanggal lahir harus sebelum hari ini',
                'jenis_kelamin.required' => 'Jenis kelamin wajib dipilih',
                'alamat.required' => 'Alamat lengkap wajib diisi',
                'kota.required' => 'Kota wajib diisi',
                'provinsi.required' => 'Provinsi wajib diisi',

                'nama_pembimbing.required_if' => 'Nama pembimbing wajib diisi untuk siswa SMK',
                'no_hp_pembimbing.required_if' => 'Nomor HP pembimbing wajib diisi untuk siswa SMK',

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
                Log::warning('Errir Valdiasi', [
                    'errors' => $validator->errors()->toArray(),
                    'input' => $request->all()
                ]);
                return back()->withErrors($validator)->withInput();
            }



            Log::info('Starting transaction');

            DB::beginTransaction();

            $cvPath = null;
            if ($request->hasFile('cv')) {
                $cvFile = $request->file('cv');
                $cvName = 'cv_' . Str::slug($request->nama_lengkap) . '_' . time() . '.pdf';
                $cvPath = $cvFile->storeAs('pendaftaran/cv', $cvName, 'public');
                Log::info('CV uploaded', ['path' => $cvPath]);
            } else {
                Log::warning('No CV file uploaded');
            }

            $suratPath = null;
            if ($request->hasFile('surat_pengantar')) {
                $suratFile = $request->file('surat_pengantar');
                $suratName = 'surat_' . Str::slug($request->nama_lengkap) . '_' . time() . '.pdf';
                $suratPath = $suratFile->storeAs('pendaftaran/surat', $suratName, 'public');
                Log::info('Surat pengantar uploaded', ['path' => $suratPath]);
            } else {
                Log::info('No surat pengantar uploaded');
            }

            Log::info('Creating user');

            $user = User::create([
                'name' => $request->nama_lengkap,
                'email' => $request->email,
                'phone' => $request->phone,
                'role' => 'guest',
                'status' => 'pending',
                'password' => null,
            ]);

            $semesterKelas = $request->jenjang === 'universitas'
                ? 'Semester ' . $request->semester
                : 'Kelas ' . $request->kelas;

            $pesertaProfile = PesertaProfile::create([
                'user_id' => $user->id,
                'jenis_peserta' => $request->jenjang === 'universitas' ? 'mahasiswa' : 'siswa',
                'nim_nisn' => $request->jenjang === 'universitas' ? $request->nim : $request->nis,
                'asal_instansi' => $request->jenjang === 'universitas' ? $request->nama_univ : $request->nama_sekolah,
                'jurusan' => $request->jurusan,
                'semester_kelas' => $semesterKelas,
                'alamat' => $request->alamat,
                'kota' => $request->kota,
                'provinsi' => $request->provinsi,
                'tanggal_lahir' => $request->tanggal_lahir,
                'jenis_kelamin' => $request->jenis_kelamin,
                'nama_pembimbing_sekolah' => $request->nama_pembimbing,
                'no_hp_pembimbing_sekolah' => $request->no_hp_pembimbing,
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
                'cv' => $cvPath,
                'surat_pengantar' => $suratPath,
            ]);
            DB::commit();
            return redirect()->route('tungguakun')->with(
                'success',
                'Pendaftaran berhasil! Tim kami akan meninjau pendaftaran Anda. ' .
                    'Akun akan dibuat dan kredensial login akan dikirim ke email Anda setelah disetujui.'
            );
        } catch (\Exception $e) {
            Log::error('Exception in pendaftaran store', [
                'error_message' => $e->getMessage(),
                'error_line' => $e->getLine(),
                'error_file' => $e->getFile(),
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    public function waitingRoom()
    {
        return Inertia::render('tungguAkun', [
            'message' => 'Pendaftaran Anda sedang dalam proses verifikasi. Kami akan mengirimkan kredensial login ke email Anda setelah pendaftaran disetujui.'
        ]);
    }

    public function checkStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Email tidak ditemukan'
            ], 404);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran tidak ditemukan'
            ], 404);
        }

        $status = [
            'pending' => 'Menunggu Verifikasi',
            'diterima' => 'Diterima - Cek Email Anda',
            'ditolak' => 'Ditolak',
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $user->status,
                'status_label' => $status[$user->status] ?? 'Tidak Diketahui',
                'name' => $user->name,
                'email' => $user->email,
                'alasan_tolak' => $user->alasan_tolak,
                'can_login' => $user->status === 'diterima' && !is_null($user->password),
            ]
        ]);
    }




    public function index()
    {
        $search = request('search');
        $status = request('status');

        $query = PesertaProfile::with('user');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', '%' . $search . '%');
                })->orWhere('asal_instansi', 'like', '%' . $search . '%');
            });
        }

        if ($status && $status !== 'semua') {
            $query->whereHas('user', function ($q) use ($status) {
                $q->where('status', $status);
            });
        }

        $dataPendaftar = $query->paginate(10)->through(function ($peserta) {
            $start = Carbon::parse($peserta->tanggal_mulai);
            $end = Carbon::parse($peserta->tanggal_selesai);
            $weeks = round($start->diffInWeeks($end));

            $statusLabels = [
                'pending' => 'Proses',
                'diterima' => 'Diterima',
                'ditolak' => 'Ditolak',
            ];

            return [
                'id' => $peserta->id,
                'nama_lengkap' => $peserta->user->name,
                'asal_instansi' => $peserta->asal_instansi,
                'jurusan' => $peserta->jurusan,
                'waktu' => $weeks . ' Minggu',
                'tanggal_mulai' => $peserta->tanggal_mulai->format('d F Y'),
                'status' => $statusLabels[$peserta->user->status] ?? 'Tidak Diketahui',
            ];
        });

        return Inertia::render('pendaftaran/index', ['dataPendaftar' => $dataPendaftar]);
    }

    public function approve($id)
    {
        $peserta = PesertaProfile::findOrFail($id);
        $user = $peserta->user;

        if ($user->status !== 'pending') {
            return response()->json(['message' => 'Pendaftar sudah diproses'], 400);
        }

        $user->update(['status' => 'diterima']);

        $password = 'Magang' . rand(1000, 9999);
        $user->update(['password' => Hash::make($password)]);

        return response()->json(['message' => 'Pendaftar berhasil diterima']);
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'alasan_tolak' => 'required|string|max:500'
        ]);

        $peserta = PesertaProfile::with('user')->findOrFail($id);

        $user = $peserta->user;

        if ($user->status !== 'pending') {
            return response()->json([
                'message' => 'Pendaftar sudah diproses'
            ], 400);
        }

        $user->status = 'ditolak';
        $user->alasan_tolak = $request->alasan_tolak;
        $user->save();

        return response()->json([
            'message' => 'Pendaftar berhasil ditolak'
        ]);
    }


    public function show($id)
    {
        $peserta = PesertaProfile::with('user')->findOrFail($id);

        $start = Carbon::parse($peserta->tanggal_mulai);
        $end = Carbon::parse($peserta->tanggal_selesai);
        $weeks = round($start->diffInWeeks($end));

        $statusLabels = [
            'pending' => 'Proses',
            'diterima' => 'Diterima',
            'ditolak' => 'Ditolak',
        ];

        $data = [
            'id' => $peserta->id,
            'nama_lengkap' => $peserta->user->name,
            'email' => $peserta->user->email,
            'phone' => $peserta->user->phone,
            'tempat_lahir' => $peserta->tempat_lahir,
            'tanggal_lahir' => $peserta->tanggal_lahir->format('d F Y'),
            'jenis_kelamin' => $peserta->jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
            'alamat' => $peserta->alamat,
            'kota' => $peserta->kota,
            'provinsi' => $peserta->provinsi,
            'jenis_peserta' => $peserta->jenis_peserta,
            'nim_nisn' => $peserta->nim_nisn,
            'asal_instansi' => $peserta->asal_instansi,
            'jurusan' => $peserta->jurusan,
            'semester_kelas' => $peserta->semester_kelas,
            'tanggal_mulai' => $peserta->tanggal_mulai->format('d F Y'),
            'tanggal_selesai' => $peserta->tanggal_selesai->format('d F Y'),
            'waktu' => $weeks . ' Minggu',
            'cv' => $peserta->cv ? asset('storage/' . $peserta->cv) : null,
            'surat_pengantar' => $peserta->surat_pengantar ? asset('storage/' . $peserta->surat_pengantar) : null,
            'nama_pembimbing' => $peserta->nama_pembimbing_sekolah,
            'no_hp_pembimbing' => $peserta->no_hp_pembimbing_sekolah,
            'status' => $statusLabels[$peserta->user->status] ?? 'Tidak Diketahui',
            'alasan_tolak' => $peserta->user->alasan_tolak,
        ];

        return Inertia::render('pendaftaran/show', ['pendaftar' => $data]);
    }

    public function destroy($id)
    {
        $peserta = PesertaProfile::findOrFail($id);
        $user = $peserta->user;

        if ($peserta->cv) {
            Storage::disk('public')->delete($peserta->cv);
        }
        if ($peserta->surat_pengantar) {
            Storage::disk('public')->delete($peserta->surat_pengantar);
        }

        $peserta->delete();
        $user->delete();

        return response()->json(['message' => 'Data pendaftar berhasil dihapus']);
    }
}
