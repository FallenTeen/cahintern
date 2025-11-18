<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Absensi;
use App\Models\User;
use Carbon\Carbon;

class AbsensiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'peserta')->get();
        $statuses = ['hadir', 'izin', 'sakit', 'terlambat'];
        $pesertaProfiles = \App\Models\PesertaProfile::all();

        foreach ($pesertaProfiles as $profile) {
            for ($i = 0; $i < 30; $i++) {
                $date = Carbon::now()->subDays($i);
                $status = $statuses[array_rand($statuses)];

                Absensi::create([
                    'peserta_profile_id' => $profile->id,
                    'tanggal' => $date,
                    'status' => $status,
                    'keterangan' => $status !== 'hadir' ? 'keterangan ' . $status : null,
                    'jam_masuk' => $status === 'hadir' || $status === 'terlambat' ? $date->copy()->setTime(8, rand(0, 59)) : null,
                    'jam_keluar' => $status === 'hadir' ? $date->copy()->setTime(17, rand(0, 59)) : null,
                ]);
            }
        }
    }
}
