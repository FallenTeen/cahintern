<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::create([
            [
                'name' => 'Admin',
                'email' => 'vlamingvlaming0@gmail.com',
                'phone' => '085156208507',
                'role' => 'peserta',
                'asal_instansi' => 'Universitas Amikom Purwokerto',
                'status' => 'diterima',
                'password' => null,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Gentar Asmara Putra',
                'email' => 'gentarist@gmail.com',
                'phone' => '083805624037',
                'role' => 'guest',
                'asal_instansi' => 'Universitas Amikom Purwokerto',
                'status' => 'aktif',
                'password' => null,
                'email_verified_at' => now(),
            ]
        ]);

        User::firstOrCreate(
            ['email' => 'febri@gmail.com'],
            [
                'name' => 'Febri',
                'phone' => '083805624037',
                'role' => 'admin',
                'asal_instansi' => 'Universitas Amikom Purwokerto',
                'status' => 'aktif',
                'password' => Hash::make('123'),
                'email_verified_at' => now(),
            ]
        );
    }
}
