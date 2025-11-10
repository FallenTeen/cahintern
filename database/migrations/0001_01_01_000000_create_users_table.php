<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->unique()->nullable();

            $table->enum('role', ['guest', 'peserta', 'admin', 'user'])->default('user');
            $table->enum('status', [
                'pending',
                'diterima',
                'ditolak',
                'selesai',
                'nonaktif'
            ])->default('pending');
            $table->timestamp('email_verified_at')->nullable();

            // PASSWORD NULLABLE AJAAA. BISA, YAKIN AJA
            // gatau alasannya tapi percaya aja suer.
            $table->string('password')->nullable();

            $table->string('avatar')->nullable();
            $table->text('alasan_tolak')->nullable();

            // Temporary storage untuk data magang
            $table->json('temp_magang_data')->nullable();

            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['role', 'status']);
        });
        Schema::create('peserta_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Foreign key bidang magang ada di migration permagangan tu
            $table->enum('jenis_peserta', ['mahasiswa', 'siswa']);
            $table->string('nim_nisn')->nullable(); //NIM APA NISN TERGANTUNG MOOD GWE
            $table->string('asal_instansi');
            $table->string('jurusan')->nullable(); //JURUSAN BISA, PRODI BISA
            $table->string('semester_kelas')->nullable(); //SEMESTER BUAT MAHASISWA, KELAS BUAT SISWA
            $table->text('alamat')->nullable();
            $table->string('kota')->nullable();
            $table->string('provinsi')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable();
            $table->string('nama_pembimbing_sekolah')->nullable();
            $table->string('no_hp_pembimbing_sekolah')->nullable();

            $table->date('diterima_pada')->nullable();
            $table->foreignId('diterima_oleh')->constrained('users')->nullable();
            $table->string('alasan_tolak')->nullable();
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_selesai')->nullable();
            $table->string('catatan_admin')->nullable();

            $table->json('pengalaman')->nullable();

            $table->string('cv')->nullable();
            $table->string('surat_pengantar')->nullable();
            $table->json('sertifikat_pendukung')->nullable();
            $table->json('temp_data_magang')->nullable();
            $table->timestamps();
        });
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
