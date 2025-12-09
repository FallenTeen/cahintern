<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('jadwal_absensis', function (Blueprint $table) {
            $table->id();
            $table->time('jam_buka');
            $table->time('jam_tutup');
            $table->unsignedInteger('toleransi_menit')->default(0);
            $table->date('effective_start_date');
            $table->date('effective_end_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_absensis');
    }
};

