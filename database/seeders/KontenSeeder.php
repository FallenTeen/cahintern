<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Konten;
use Illuminate\Support\Str;

class KontenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kontens = [
            [
                'judul' => 'Panduan Absensi Magang',
                'deskripsi' => 'Panduan lengkap cara melakukan absensi selama masa magang',
                'konten' => '<h2>Cara Melakukan Absensi</h2><p>1. Buka aplikasi magang</p><p>2. Klik menu absensi</p><p>3. Pilih waktu masuk/keluar</p><p>4. Konfirmasi absensi</p>',
                'slug' => 'panduan-absensi-magang',
            ],
            [
                'judul' => 'Aturan Etika Kerja',
                'deskripsi' => 'Panduan etika dan tata tertib selama bekerja di perusahaan',
                'konten' => '<h2>Etika Kerja</h2><ul><li>Datang tepat waktu</li><li>Berdandan rapi</li><li>Hormati atasan dan rekan kerja</li><li>Jaga kerahasiaan perusahaan</li></ul>',
                'slug' => 'aturan-etika-kerja',
            ],
            [
                'judul' => 'Teknologi yang Digunakan',
                'deskripsi' => 'Berbagai teknologi dan tools yang akan dipelajari selama magang',
                'konten' => '<h2>Stack Teknologi</h2><p>Selama magang, Anda akan belajar:</p><ul><li>Laravel Framework</li><li>React.js</li><li>MySQL Database</li><li>Git Version Control</li></ul>',
                'slug' => 'teknologi-yang-digunakan',
            ],
            [
                'judul' => 'Proyek Akhir Magang',
                'deskripsi' => 'Informasi tentang proyek akhir yang harus diselesaikan',
                'konten' => '<h2>Proyek Akhir</h2><p>Setiap peserta magang diwajibkan menyelesaikan proyek akhir berupa:</p><ul><li>Aplikasi web sederhana</li><li>Presentasi hasil kerja</li><li>Laporan magang</li></ul>',
                'slug' => 'proyek-akhir-magang',
            ],
        ];

        foreach ($kontens as $konten) {
            Konten::create($konten);
        }
    }
}
