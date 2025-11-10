<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\BidangMagang;

class BidangMagangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        BidangMagang::insert([
            [
                'nama_bidang' => 'Pengembangan Web',
                'deskripsi' => 'Magang di bidang pengembangan web melibatkan pembuatan dan pemeliharaan situs web serta aplikasi web menggunakan berbagai teknologi seperti HTML, CSS, JavaScript, dan framework terkait.',
                'kuota' => 10,
                'is_active' => true,
                'gambar_utama' => null,
                'gambar_deskriptif' => null,
                'slug' => 'pengembangan-web',
            ],
            [
                'nama_bidang' => 'Desain Grafis',
                'deskripsi' => 'Magang di bidang desain grafis berfokus pada pembuatan elemen visual untuk berbagai media, termasuk iklan, brosur, dan konten digital, menggunakan perangkat lunak desain seperti Adobe Photoshop dan Illustrator.',
                'kuota' => 8,
                'is_active' => true,
                'gambar_utama' => null,
                'gambar_deskriptif' => null,
                'slug' => 'desain-grafis',
            ],
        ]);
    }
}
