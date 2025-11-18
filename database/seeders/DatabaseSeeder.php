<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            BidangMagangSeeder::class,
            UserSeeder::class,
            PesertaProfileSeeder::class,
            // Ini 3 atas wajib ada dulu
            AbsensiSeeder::class,
            LogbookSeeder::class,
            PenilaianAkhirSeeder::class,
            SertifikatSeeder::class,
            PengumumanSeeder::class,
            KontenSeeder::class,
        ]);

    }
}
