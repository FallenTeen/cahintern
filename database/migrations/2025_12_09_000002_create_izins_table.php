<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('izins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peserta_profile_id')->constrained('peserta_profiles')->onDelete('cascade');
            $table->date('tanggal');
            $table->string('jenis');
            $table->text('keterangan')->nullable();
            $table->string('status')->default('pending');
            $table->string('lokasi')->nullable();
            $table->time('waktu_mulai')->nullable();
            $table->time('waktu_selesai')->nullable();
            $table->string('project_url')->nullable();
            $table->string('surat_tugas')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->index(['peserta_profile_id', 'tanggal']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('izins');
    }
};

