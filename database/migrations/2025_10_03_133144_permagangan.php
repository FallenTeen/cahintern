<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bidang_magang', function (Blueprint $table) {
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

        Schema::create('pengajuan_magang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('bidang_magang_id')->constrained('bidang_magang')->onDelete('cascade');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->text('tujuan_bidang_magang')->nullable();

            $table->string('surat_pengajuan')->nullable();
            $table->string('surat_rekomendasi')->nullable();
            $table->string('cv')->nullable();
            $table->json('dokumen_lain')->nullable();

            $table->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled'])->default('pending');
            $table->text('catatan_admin')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'approved_at','bidang_magang_id']);
        });

        Schema::create('absensi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengajuan_magang_id')->constrained('pengajuan_magang')->onDelete('cascade');
            $table->date('tanggal');
            $table->time('jam_masuk')->nullable();
            $table->time('jam_keluar')->nullable();
            $table->enum('status', ['hadir', 'izin', 'sakit', 'alpha'])->default('hadir');
            $table->text('keterangan')->nullable();
            $table->boolean('is_verified')->default(false);
           
            $table->timestamps();
            $table->unique(['pengajuan_magang_id', 'tanggal']);
            $table->index(['tanggal']);
        });

        Schema::create('logbook', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengajuan_magang_id')->constrained('pengajuan_magang')->onDelete('cascade');
            $table->date('tanggal');
            $table->text('kegiatan');
            $table->string('dokumentasi')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->text('catatan_pembimbing')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->softDeletes();
            $table->index(['pengajuan_magang_id', 'tanggal']);
        });

        Schema::create('penilaian_akhir', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengajuan_magang_id')->constrained('pengajuan_magang')->onDelete('cascade');
            $table->integer('nilai_disiplin')->nullable();
            $table->integer('nilai_kerjasama')->nullable();
            $table->integer('nilai_inisiatif')->nullable();
            $table->integer('nilai_tanggung_jawab')->nullable();
            $table->integer('nilai_keahlian')->nullable();
            $table->decimal('nilai_akhir', 5, 2)->nullable();
            $table->enum('predikat', ['A', 'B', 'C', 'D', 'E'])->nullable();

            $table->text('kelebihan')->nullable();
            $table->text('kekurangan')->nullable();
            $table->text('saran')->nullable();
            $table->text('catatan')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('sertifikat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengajuan_magang_id')->constrained('pengajuan_magang')->onDelete('cascade');
            $table->string('nomor_sertifikat')->unique();
            $table->string('file_path')->nullable();
            $table->date('tanggal_terbit');
            $table->string('qr_code')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absensi');
        Schema::dropIfExists('pengajuan_magang');
        Schema::dropIfExists('bidang_magang');
        Schema::dropIfExists('logbook');
        Schema::dropIfExists('penilaian_akhir');
        Schema::dropIfExists('sertifikat');
    }
};
