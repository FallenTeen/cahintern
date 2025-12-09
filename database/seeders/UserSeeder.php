<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::insert([
            [
                'name' => 'Admin',
                'email' => 'vlamingvlaming0@gmail.com',
                'phone' => '085156208507',
                'role' => 'peserta',
                'status' => 'aktif',
                'password' => Hash::make('123'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Gentar Asmara Putra',
                'email' => 'gentarist@gmail.com',
                'phone' => '08380562401237',
                'role' => 'guest',
                'status' => 'aktif',
                'password' => Hash::make('123'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        User::firstOrCreate(
            ['email' => 'febri@gmail.com'],
            [
                'name' => 'Febri',
                'phone' => '083805624037',
                'role' => 'admin',
                'status' => 'aktif',
                'password' => Hash::make('123'),
                'email_verified_at' => now(),
            ]
        );

        // Create additional dummy users for testing
        for ($i = 1; $i <= 20; $i++) {
            User::create([
                'name' => 'Peserta ' . $i,
                'email' => 'peserta' . $i . '@example.com',
                'phone' => '081234567' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'role' => 'peserta',
                'status' => 'aktif',
                'password' => Hash::make('123'),
                'email_verified_at' => now(),
            ]);
        }
    }
}
