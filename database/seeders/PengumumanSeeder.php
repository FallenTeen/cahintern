<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Pengumuman;

class PengumumanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pengumuman = [
            [
                'judul' => 'Selamat Datang Peserta Magang Baru',
                'isi' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                'status' => 'published',
                'published_at' => now()->subDays(5),
            ],
            [
                'judul' => 'Jadwal Orientasi Magang',
                'isi' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                'status' => 'published',
                'published_at' => now()->subDays(3),
            ],
            [
                'judul' => 'Peraturan Absensi Magang',
                'isi' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                'status' => 'draft',
                'published_at' => null,
            ],
            [
                'judul' => 'Pengumuman Libur Nasional',
                'isi' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                'status' => 'published',
                'published_at' => now()->subDays(1),
            ],
        ];

        foreach ($pengumuman as $pengumuman) {
            Pengumuman::create($pengumuman);
        }
    }
}
