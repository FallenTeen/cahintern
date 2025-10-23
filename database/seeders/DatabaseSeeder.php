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

        User::firstOrCreate(
            ['email' => 'febri@gmail.com'],
            [
                'name' => 'Febri',
                'phone' => '083805624037',
                'role' => 'admin',
                'asal_instansi' => 'Universitas Amikom Purwokerto',
                'status' => 'active',
                'password' => Hash::make('123'),
                'email_verified_at' => now(),
            ]
        );
    }
}