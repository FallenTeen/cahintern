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
    // admin
    public function create()
    {
        return Inertia::render('pendaftaran/create');
    }
    public function store(Request $request)
    {
        $request->merge(array_map(function ($value) {
            return $value === '' ? null : $value;
        }, $request->all()));

        $validator = Validator::make($request->all(), [

            'jenjang' => 'required|in:universitas,smk',

            // UNIVERSITAS
            'nim' => 'exclude_if:jenjang,smk|required|string|max:50',
            'nama_univ' => 'exclude_if:jenjang,smk|required|string|max:255',
            'jurusan' => 'exclude_if:jenjang,smk|required|string|max:255',
            'semester' => 'exclude_if:jenjang,smk|required|integer|min:1|max:14',

            // SMK
            'nis' => 'exclude_if:jenjang,universitas|required|string|max:50',
            'nama_sekolah' => 'exclude_if:jenjang,universitas|required|string|max:255',
            'kelas' => 'exclude_if:jenjang,universitas|required|string|max:10',
            'nama_pembimbing' => 'exclude_if:jenjang,universitas|required|string|max:255',
            'no_hp_pembimbing' => 'exclude_if:jenjang,universitas|required|string|max:20',

            // UMUM
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20',
            'tempat_lahir' => 'required|string|max:100',
            'tanggal_lahir' => 'required|date|before:today',
            'jenis_kelamin' => 'required|in:L,P',
            'alamat' => 'required|string|max:500',
            'kota' => 'required|string|max:100',
            'provinsi' => 'required|string|max:100',

            'tanggal_mulai' => 'required|date|after_or_equal:today',
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',

            'cv' => 'required|file|mimes:pdf|max:2048',
            'surat_pengantar' => 'nullable|file|mimes:pdf|max:2048',

        ], [
            'required_if' => ':attribute wajib diisi',
            'email.unique' => 'Email sudah terdaftar',
            'cv.mimes' => 'CV harus PDF',
        ]);

        if ($validator->fails()) {
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        DB::beginTransaction();

        try {
            /* ================= FILE UPLOAD ================= */

            $cvPath = $request->file('cv')->storeAs(
                'pendaftaran/cv',
                'cv_' . Str::slug($request->nama_lengkap) . '_' . time() . '.pdf',
                'public'
            );

            $suratPath = null;
            if ($request->hasFile('surat_pengantar')) {
                $suratPath = $request->file('surat_pengantar')->storeAs(
                    'pendaftaran/surat',
                    'surat_' . Str::slug($request->nama_lengkap) . '_' . time() . '.pdf',
                    'public'
                );
            }

            /* ================= USER ================= */

            $user = User::create([
                'name' => $request->nama_lengkap,
                'email' => $request->email,
                'phone' => $request->phone,
                'role' => 'guest',
                'status' => 'pending',
                'password' => null
            ]);

            /* ================= PROFILE ================= */

            $semesterKelas = $request->jenjang === 'universitas'
                ? 'Semester ' . $request->semester
                : 'Kelas ' . $request->kelas;

            PesertaProfile::create([
                'user_id' => $user->id,
                'jenis_peserta' => $request->jenjang === 'universitas' ? 'mahasiswa' : 'siswa',
                'nim_nisn' => $request->jenjang === 'universitas' ? $request->nim : $request->nis,
                'asal_instansi' => $request->jenjang === 'universitas'
                    ? $request->nama_univ
                    : $request->nama_sekolah,
                'jurusan' => $request->jurusan,
                'semester_kelas' => $semesterKelas,
                'alamat' => $request->alamat,
                'kota' => $request->kota,
                'provinsi' => $request->provinsi,
                'tempat_lahir' => $request->tempat_lahir,
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

            return back()->with('success', 'Pendaftar berhasil ditambahkan');
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Gagal simpan pendaftaran', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return back()
                ->with('error', 'Terjadi kesalahan sistem. Silakan coba lagi.')
                ->withInput();
        }
    }

    // guest
    public function halPendaftaranGuest()
    {
        return Inertia::render('pendaftaran');
    }

    public function guestDaftar(Request $request)
    {
        // 1. Validasi
        $validator = Validator::make($request->all(), [
            'jenjang' => 'required|in:universitas,smk',

            // Validasi Mahasiswa
            'nim' => 'required_if:jenjang,universitas|nullable|string|max:50',
            'nama_univ' => 'required_if:jenjang,universitas|nullable|string|max:255',
            'jurusan' => 'required_if:jenjang,universitas|nullable|string|max:255',
            'semester' => 'required_if:jenjang,universitas|nullable|integer|min:1|max:14',

            // Validasi SMK
            'nis' => 'required_if:jenjang,smk|nullable|string|max:50',
            'nama_sekolah' => 'required_if:jenjang,smk|nullable|string|max:255',
            'kelas' => 'required_if:jenjang,smk|nullable|string|max:10',
            'nama_pembimbing' => 'required_if:jenjang,smk|nullable|string|max:255',
            'no_hp_pembimbing' => 'required_if:jenjang,smk|nullable|string|max:20',

            // Data Diri
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20',
            'tempat_lahir' => 'required|string|max:100',
            'tanggal_lahir' => 'required|date|before:today',
            'jenis_kelamin' => 'required|in:L,P',
            'alamat' => 'required|string|max:500',
            'kota' => 'required|string|max:100',
            'provinsi' => 'required|string|max:100',

            // Waktu Magang
            'tanggal_mulai' => 'required|date|after_or_equal:today',
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',
        ], [
            // --- Custom Error Messages ---

            // Global
            'required' => 'Kolom ini wajib diisi.',
            'string' => 'Isian harus berupa teks.',
            'max' => 'Isian terlalu panjang (maksimal :max karakter).',

            // Jenjang
            'jenjang.required' => 'Mohon pilih jenjang pendidikan (Universitas atau SMK).',
            'jenjang.in' => 'Pilihan jenjang tidak valid.',

            // Mahasiswa
            'nim.required_if' => 'NIM wajib diisi untuk kategori Mahasiswa.',
            'nama_univ.required_if' => 'Nama Universitas wajib diisi.',
            'jurusan.required_if' => 'Jurusan/Prodi wajib diisi.',
            'semester.required_if' => 'Semester wajib diisi.',
            'semester.min' => 'Semester tidak valid (minimal 1).',
            'semester.max' => 'Semester tidak valid (maksimal 14).',

            // SMK
            'nis.required_if' => 'NIS wajib diisi untuk kategori Siswa SMK.',
            'nama_sekolah.required_if' => 'Nama Sekolah wajib diisi.',
            'kelas.required_if' => 'Kelas wajib diisi.',
            'nama_pembimbing.required_if' => 'Nama Guru Pembimbing wajib diisi.',
            'no_hp_pembimbing.required_if' => 'No. HP Guru Pembimbing wajib diisi.',

            // Data Diri
            'nama_lengkap.required' => 'Nama lengkap wajib diisi sesuai identitas.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid (contoh: nama@email.com).',
            'email.unique' => 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.',
            'phone.required' => 'Nomor WhatsApp/HP wajib diisi.',
            'tempat_lahir.required' => 'Tempat lahir wajib diisi.',
            'tanggal_lahir.required' => 'Tanggal lahir wajib diisi.',
            'tanggal_lahir.before' => 'Tanggal lahir tidak valid (harus sebelum hari ini).',
            'jenis_kelamin.required' => 'Silakan pilih jenis kelamin.',
            'jenis_kelamin.in' => 'Pilihan jenis kelamin tidak valid.',
            'alamat.required' => 'Alamat domisili lengkap wajib diisi.',
            'kota.required' => 'Kota wajib diisi.',
            'provinsi.required' => 'Provinsi wajib diisi.',

            // Validasi Tanggal (Penting)
            'tanggal_mulai.required' => 'Tentukan tanggal mulai magang.',
            'tanggal_mulai.date' => 'Format tanggal mulai tidak valid.',
            'tanggal_mulai.after_or_equal' => 'Tanggal mulai magang minimal sesudah hari ini (tidak boleh tanggal lampau).',

            'tanggal_selesai.required' => 'Tentukan tanggal selesai magang.',
            'tanggal_selesai.date' => 'Format tanggal selesai tidak valid.',
            'tanggal_selesai.after' => 'Tanggal selesai harus sesudah tanggal mulai.',
        ]);
        if ($validator->fails()) {
            // REVISI 1: Gunakan withErrors dan withInput agar isian lama tidak hilang
            return back()->withErrors($validator)->withInput();
        }

        DB::beginTransaction(); // Mulai Transaksi

        try {
            // 2. Create User
            // REVISI 2: Pastikan kolom 'password' di database nullable,
            // atau beri password random sementara jika tidak boleh null.
            $user = User::create([
                'name' => $request->nama_lengkap,
                'email' => $request->email,
                'phone' => $request->phone,
                'role' => 'guest',
                'status' => 'pending',
                'password' => null, // Pastikan kolom password di DB boleh NULL
            ]);

            // 3. Logic Mapping Data
            $semesterKelas = $request->jenjang === 'universitas'
                ? 'Semester ' . $request->semester
                : 'Kelas ' . $request->kelas;

            // 4. Create Profile
            PesertaProfile::create([
                'user_id' => $user->id,
                'jenis_peserta' => $request->jenjang === 'universitas' ? 'mahasiswa' : 'siswa',
                'nim_nisn' => $request->jenjang === 'universitas' ? $request->nim : $request->nis,
                'asal_instansi' => $request->jenjang === 'universitas' ? $request->nama_univ : $request->nama_sekolah,
                'jurusan' => $request->jurusan, // Note: SMK mungkin kosong jika tidak diinput
                'semester_kelas' => $semesterKelas,
                'alamat' => $request->alamat,
                'kota' => $request->kota,
                'provinsi' => $request->provinsi,
                'tempat_lahir' => $request->tempat_lahir,
                'tanggal_lahir' => $request->tanggal_lahir,
                'jenis_kelamin' => $request->jenis_kelamin,
                'nama_pembimbing_sekolah' => $request->nama_pembimbing,
                'no_hp_pembimbing_sekolah' => $request->no_hp_pembimbing,
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
            ]);

            DB::commit(); // Simpan permanen jika sukses semua

            return redirect()->route('tungguakun')->with(
                'success',
                'Pendaftaran berhasil! Tim kami akan meninjau pendaftaran Anda. Akun akan dibuat setelah disetujui.'
            );
        } catch (\Exception $e) {
            // REVISI 3: Wajib ada Rollback
            DB::rollBack();

            Log::error('Exception in pendaftaran store', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            // REVISI 4: Wajib return sesuatu di catch block
            // Jika tidak, user akan melihat layar putih kosong (blank screen)
            return back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan sistem saat menyimpan data. Silakan coba lagi.');
        }
    }

    public function waitingRoom()
    {
        return Inertia::render('tungguakun', [
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

        $query = PesertaProfile::with('user')->orderBy('created_at', 'desc');

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

        $user->update([
            'status' => 'diterima',
            'role' => 'peserta',
            'email_verified_at' => now(),
        ]);

        $password = '123456';
        $user->update(['password' => Hash::make($password)]);

        return back()->with('success', 'Pendaftar berhasil diterima');
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

        return back()->with('success', 'Pendaftar berhasil ditolak');
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

        return back()->with('success', 'Pendaftar berhasil dihapus');
    }
}
