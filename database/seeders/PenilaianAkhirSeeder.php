<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PenilaianAkhir;
use App\Models\User;

class PenilaianAkhirSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'peserta')->get();
        $pesertaProfiles = \App\Models\PesertaProfile::all();

        foreach ($pesertaProfiles as $profile) {
            PenilaianAkhir::create([
                'peserta_profile_id' => $profile->id,
                'tanggal_penilaian' => now(),
                'nilai_disiplin' => rand(70, 100),
                'nilai_kerjasama' => rand(70, 100),
                'nilai_inisiatif' => rand(70, 100),
                'nilai_komunikasi' => rand(70, 100),
                'nilai_teknis' => rand(70, 100),
                'nilai_kreativitas' => rand(70, 100),
                'nilai_tanggung_jawab' => rand(70, 100),
                'nilai_kehadiran' => rand(70, 100),
                'nilai_total' => rand(70, 100),
                'predikat' => ['A', 'B', 'C', 'D', 'E'][array_rand(['A', 'B', 'C', 'D', 'E'])],
                'komentar' => 'Penilaian buat ' . $profile->user->name . '. Performa baik selama magang.',
                'status' => 'disetujui',
            ]);
        }
    }
}
