<?php

namespace App\Http\Controllers;

use App\Models\PesertaProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $profile = PesertaProfile::where('user_id', auth()->id())->first();
        $nama = $profile->user->name;

        return inertia::render('user/profile', [
            'profile' => $profile,
            'nama' => $nama,
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        // === VALIDASI ===
        $validated = $request->validate([
            // USER
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',

            // AVATAR
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'delete_avatar' => 'boolean',

            // PROFIL
            'jenis_peserta' => 'required|in:siswa,mahasiswa',
            'nim_nisn' => 'nullable|string|max:30',
            'jurusan' => 'nullable|string|max:100',
            'asal_instansi' => 'nullable|string|max:150',
            'alamat' => 'nullable|string|max:255',
            'kota' => 'nullable|string|max:100',
            'provinsi' => 'nullable|string|max:100',

            // SISWA
            'semester_kelas' => 'nullable|string|max:20',
            'nama_pembimbing_sekolah' => 'nullable|string|max:100',
            'no_hp_pembimbing_sekolah' => 'nullable|string|max:20',
        ]);

        // === VALIDASI KONDISIONAL SISWA ===
        if ($request->jenis_peserta === 'siswa') {
            $request->validate([
                'nim_nisn' => 'required',
                'semester_kelas' => 'required',
                'nama_pembimbing_sekolah' => 'required',
                'no_hp_pembimbing_sekolah' => 'required',
            ]);
        }

        // Hapus avatar jika diminta
        if ($request->delete_avatar) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
                $user->avatar = null;
            }
        }

        // === UPDATE AVATAR ===
        if ($request->hasFile('avatar')) {
            // Hapus avatar lama
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Simpan avatar baru
            $avatarPath = $request->file('avatar')->store(
                'avatars',
                'public'
            );

            $user->avatar = $avatarPath;
        }

        // === UPDATE USER ===
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? $user->phone,
            'avatar' => $user->avatar,
        ]);

        // === UPDATE / CREATE PESERTA PROFILE ===
        $user->pesertaProfile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'jenis_peserta' => $validated['jenis_peserta'],
                'nim_nisn' => $validated['nim_nisn'] ?? null,
                'jurusan' => $validated['jurusan'] ?? null,
                'asal_instansi' => $validated['asal_instansi'] ?? null,
                'alamat' => $validated['alamat'] ?? null,
                'kota' => $validated['kota'] ?? null,
                'provinsi' => $validated['provinsi'] ?? null,
                'kelas' => $validated['kelas'] ?? null,
                'nama_pembimbing_sekolah' =>
                $validated['nama_pembimbing_sekolah'] ?? null,
                'no_hp_pembimbing_sekolah' =>
                $validated['no_hp_pembimbing_sekolah'] ?? null,
            ]
        );

        return redirect()
            ->back()
            ->with('success', 'Profil dan avatar berhasil diperbarui.');
    }
}
