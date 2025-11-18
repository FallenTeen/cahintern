<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Sertifikat;
use App\Models\User;

class SertifikatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get peserta profiles instead of users
        $pesertaProfiles = \App\Models\PesertaProfile::all();

        foreach ($pesertaProfiles as $profile) {
            Sertifikat::create([
                'peserta_profile_id' => $profile->id,
                'nomor_sertifikat' => 'CERT-' . strtoupper(uniqid()),
                'tanggal_terbit' => now()->subDays(rand(0, 30)),
                'is_published' => rand(0, 1),
                'file_path' => 'sertifikat/dummy_' . $profile->id . '.pdf',
            ]);
        }
    }
}
