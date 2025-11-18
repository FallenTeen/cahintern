<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Logbook;
use App\Models\User;
use Carbon\Carbon;

class LogbookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'peserta')->get();
        $statuses = ['pending', 'disetujui', 'ditolak', 'revision'];
        $pesertaProfiles = \App\Models\PesertaProfile::all();

        foreach ($pesertaProfiles as $profile) {
            for ($i = 0; $i < 30; $i++) {
                $date = Carbon::now()->subDays($i);
                $status = $statuses[array_rand($statuses)];

                Logbook::create([
                    'peserta_profile_id' => $profile->id,
                    'tanggal' => $date,
                    'kegiatan' => 'kegiatan hari ke-' . ($i + 1) . ' untuk peserta ' . $profile->user->name,
                    'deskripsi' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                    'jam_mulai' => $date->copy()->setTime(8, 0),
                    'jam_selesai' => $date->copy()->setTime(17, 0),
                    'status' => $status,
                    'catatan_pembimbing' => $status === 'revision' ? 'Perlu revisi pada deskripsi kegiatan' : null,
                ]);
            }
        }
    }
}
