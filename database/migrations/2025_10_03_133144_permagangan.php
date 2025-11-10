<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bidang_magangs', function (Blueprint $table) {
            $table->id();
            $table->string('nama_bidang');
            $table->text('deskripsi')->nullable();
            $table->integer('kuota')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('gambar_utama')->nullable();
            $table->json('gambar_deskriptif')->nullable();
            $table->string('slug')->unique();

            $table->timestamps();
            $table->softDeletes();
            $table->index(['is_active', 'slug']);
        });

        // Dibikin disini ben lancar wkwkwk
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('bidang_magang_id')->nullable()->constrained('bidang_magangs')->onDelete('set null');
        });

        Schema::table('peserta_profiles', function (Blueprint $table) {
            $table->foreignId('bidang_magang_id')->nullable()->constrained('bidang_magangs')->onDelete('set null');
        });

        Schema::create('absensis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peserta_profile_id')->constrained('peserta_profiles')->onDelete('cascade');
            $table->date('tanggal');
            $table->dateTime('jam_masuk')->nullable();
            $table->dateTime('jam_keluar')->nullable();
            $table->enum('status', ['hadir', 'izin', 'sakit', 'alpha', 'terlambat'])->default('hadir');
            $table->text('keterangan')->nullable();

            $table->string('foto_masuk')->nullable();
            $table->string('foto_keluar')->nullable();
            $table->string('lokasi_masuk')->nullable();
            $table->string('lokasi_keluar')->nullable();
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('disetujui_pada')->nullable();

            $table->timestamps();

            $table->unique(['peserta_profile_id', 'tanggal']);
            $table->index(['tanggal']);
        });

        Schema::create('logbooks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peserta_profile_id')->constrained('peserta_profiles')->onDelete('cascade');
            $table->date('tanggal');
            $table->string('kegiatan');
            $table->text('deskripsi')->nullable();

            $table->dateTime('jam_mulai')->nullable();
            $table->dateTime('jam_selesai')->nullable();

            $table->enum('status', ['pending', 'disetujui', 'ditolak', 'revision'])->default('pending');

            $table->string('dokumentasi')->nullable();
            $table->text('catatan_pembimbing')->nullable();
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('disetujui_pada')->nullable();

            $table->text('masalah')->nullable();
            $table->text('solusi')->nullable();

            $table->timestamps();
            $table->softDeletes();
            $table->index(['peserta_profile_id', 'tanggal']);
        });

        Schema::create('penilaian_akhirs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peserta_profile_id')->constrained('peserta_profiles')->onDelete('cascade');
            $table->date('tanggal_penilaian')->nullable();
            $table->integer('nilai_disiplin')->nullable();
            $table->integer('nilai_kerjasama')->nullable();
            $table->integer('nilai_inisiatif')->nullable();
            $table->integer('nilai_komunikasi')->nullable();
            $table->integer('nilai_teknis')->nullable();
            $table->integer('nilai_kreativitas')->nullable();
            $table->integer('nilai_tanggung_jawab')->nullable();
            $table->integer('nilai_kehadiran')->nullable();
            $table->decimal('nilai_total', 5, 2)->nullable();
            $table->enum('predikat', ['A', 'B', 'C', 'D', 'E'])->nullable();

            $table->text('komentar')->nullable();
            $table->text('rekomendasi')->nullable();
            $table->enum('status', ['pending', 'disetujui', 'ditolak', 'ditahan'])->nullable();

            $table->foreignId('disetujui_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->date('disetujui_pada')->nullable();
            $table->text('catatan')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('sertifikats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peserta_profile_id')->constrained('peserta_profiles')->onDelete('cascade');
            $table->string('nomor_sertifikat')->unique();
            $table->string('file_path')->nullable();
            $table->date('tanggal_terbit');
            $table->string('qr_code')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });
    }



    public function down(): void
    {
        Schema::dropIfExists('sertifikats');
        Schema::dropIfExists('penilaian_akhirs');
        Schema::dropIfExists('logbooks');
        Schema::dropIfExists('absensis');

        Schema::table('peserta_profiles', function (Blueprint $table) {
            $table->dropForeign(['bidang_magang_id']);
            $table->dropColumn('bidang_magang_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['bidang_magang_id']);
            $table->dropColumn('bidang_magang_id');
        });

        Schema::dropIfExists('bidang_magangs');
    }
};
