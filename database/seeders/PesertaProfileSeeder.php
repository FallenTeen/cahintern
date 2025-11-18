<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PesertaProfile;
use App\Models\User;
use Carbon\Carbon;

class PesertaProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'peserta')->get();

        if ($users->isEmpty()) {
            return;
        }

        foreach ($users as $index => $user) {
            if ($index % 3 !== 0) {
                $user->status = 'diterima';
            } else {
                $user->status = 'pending';
            }
            $user->save();

            $start = Carbon::now()->subWeeks(rand(1, 8));
            $end = (clone $start)->addWeeks(rand(4, 12));

            PesertaProfile::create([
                'user_id' => $user->id,
                'bidang_magang_id' => $user->bidang_magang_id ?? rand(1, 2),
                'jenis_peserta' => (rand(0,1) ? 'mahasiswa' : 'siswa'),
                'nim_nisn' => 'NIM' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
                'asal_instansi' => 'Instansi ' . ($user->id),
                'jurusan' => 'Jurusan Contoh',
                'semester_kelas' => 'Semester ' . rand(1, 8),
                'alamat' => 'Jl. Contoh No. ' . rand(1, 100),
                'kota' => 'Kota Contoh',
                'provinsi' => 'Provinsi Contoh',
                'tanggal_lahir' => Carbon::now()->subYears(rand(18, 25)),
                'jenis_kelamin' => (rand(0,1) ? 'L' : 'P'),
                'nama_pembimbing_sekolah' => null,
                'no_hp_pembimbing_sekolah' => null,
                'tanggal_mulai' => $start,
                'tanggal_selesai' => $end,
                'cv' => null,
                'surat_pengantar' => null,
            ]);
        }
    }
}
