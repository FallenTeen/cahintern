<?php

use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\KontenController;
use App\Http\Controllers\LogbookController;
use App\Http\Controllers\MahasiswaController;
use App\Http\Controllers\PenilaianController;
use App\Http\Controllers\PICCOntroller;
use App\Http\Controllers\IzinController;
use App\Http\Controllers\PICUserController;
use App\Http\Controllers\PendaftaranController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KesanggupanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SertifikatController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| PUBLIC (STATIC)
|--------------------------------------------------------------------------
*/

Route::get('/', fn() => Inertia::render('welcome'))->name('home');
Route::get('/persyaratan', fn() => Inertia::render('persyaratan'))->name('persyaratan');

/*
|--------------------------------------------------------------------------
| PENDAFTARAN (STATIC → SPESIFIK → DINAMIS)
|--------------------------------------------------------------------------
*/
Route::prefix('pendaftaran')->name('pendaftaran.')->group(function () {
    Route::get('/', [PendaftaranController::class, 'halPendaftaranGuest'])->name('halPendaftaranGuest');
    Route::post('/', [PendaftaranController::class, 'guestDaftar'])->name('guestDaftar');

    Route::get('/menunggu-verifikasi', [PendaftaranController::class, 'waitingRoom'])->name('tunggu');
    Route::post('/cek-status', [PendaftaranController::class, 'checkStatus'])->name('cek-status');
});

Route::get('/waitingroom-pendaftaran', fn() => redirect()->route('pendaftaran.tunggu'))
    ->name('tungguakun');

/*
|--------------------------------------------------------------------------
| DASHBOARD (AUTH ONLY)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware(['bukancalonpeserta'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        
        // Sertifikat untuk user biasa (peserta)
        Route::get('/sertifikat', [SertifikatController::class, 'index'])->name('sertifikat');
        Route::get('/sertifikat/{sertifikat}/download', [SertifikatController::class, 'download'])->name('sertifikat.download');
    });
});

/*
|--------------------------------------------------------------------------
| ADMIN + PIC — DATA (STATIC FIRST, THEN DYNAMIC)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin,pic'])->group(function () {

    // DATA PENDAFTARAN
    Route::get('/data-pendaftaran', [PendaftaranController::class, 'index'])->name('dataPendaftaran');

    Route::get('/data-pendaftaran/create', [PendaftaranController::class, 'create'])->name('dataPendaftaran.create');
    Route::post('/data-pendaftaran/store', [PendaftaranController::class, 'store'])->name('dataPendaftaran.store');

    Route::post('/data-pendaftaran/{id}/approve', [PendaftaranController::class, 'approve'])->name('dataPendaftaran.approve');
    Route::post('/data-pendaftaran/{id}/reject', [PendaftaranController::class, 'reject'])->name('dataPendaftaran.reject');
    Route::delete('/data-pendaftaran/{id}', [PendaftaranController::class, 'destroy'])->name('dataPendaftaran.destroy');
    Route::get('/data-pendaftaran/{id}', [PendaftaranController::class, 'show'])->name('dataPendaftaran.show');

    // MAHASISWA AKTIF
    Route::get('/data-mahasiswa-aktif', [MahasiswaController::class, 'index'])->name('dataMahasiswaAktif');
    Route::get('/data-mahasiswa-aktif/{id}', [MahasiswaController::class, 'show'])->name('dataMahasiswaAktif.show');

    // PIC
    Route::get('/data-pic', [PICCOntroller::class, 'index'])->name('dataPIC');

    // ABSEN MAHASISWA
    Route::get('/absen-mahasiswa', [AbsensiController::class, 'index'])->name('absenMahasiswa');
    Route::get('/absen-mahasiswa/{id}', [AbsensiController::class, 'show'])->name('absenMahasiswa.show');
    Route::post('/absen-mahasiswa/{id}/approve', [AbsensiController::class, 'approve'])->name('absenMahasiswa.approve');
    Route::post('/absen-mahasiswa/{id}/reject', [AbsensiController::class, 'reject'])->name('absenMahasiswa.reject');
    Route::post('/absen-jadwal', [AbsensiController::class, 'storeSchedule'])->name('absenJadwal.update');
    Route::delete('/absen-jadwal/reset', [AbsensiController::class, 'resetSchedule'])->name('absenJadwal.resetSchedule');

    // LOGBOOK (ADMIN+PIC)
    Route::get('/logbook-mahasiswa', [LogbookController::class, 'index'])->name('logbookMahasiswa');

    // IZIN (STATIC)
    Route::get('/izin', [IzinController::class, 'index'])->name('izin.index');
    Route::post('/izin', [IzinController::class, 'store'])->name('izin.store');
    Route::post('/izin/{izin}/approve', [IzinController::class, 'approve'])->name('izin.approve');
    Route::post('/izin/{izin}/reject', [IzinController::class, 'reject'])->name('izin.reject');

    /*
     |---------------- LOGBOOK GROUP ----------------
     */
    Route::prefix('logbook')->name('logbook.')->group(function () {
        Route::get('/', [LogbookController::class, 'index'])->name('index');
        Route::get('/export', [LogbookController::class, 'exportCsv'])->name('export');

        Route::get('/mahasiswa/{pesertaProfileId}', [LogbookController::class, 'showLogbookMahasiswa'])
            ->name('mahasiswa.show')
            ->where('pesertaProfileId', '[0-9]+');

        Route::get('/detail/{logbook}', [LogbookController::class, 'showDetailLogbook'])->name('detail');

        Route::post('/{logbook}/approve', [LogbookController::class, 'approve'])->name('approve');
        Route::post('/{logbook}/reject', [LogbookController::class, 'reject'])->name('reject');
        Route::post('/{logbook}/revision', [LogbookController::class, 'requestRevision'])->name('revision');
    });

    // PENILAIAN DAN KONTEN
    Route::get('/penilaian-dan-sertifikat', [PenilaianController::class, 'index'])->name('penilaianDanSertifikat');
    Route::get('/pengumuman-dan-konten', [KontenController::class, 'index'])->name('pengumumanKonten');
});

/*
|--------------------------------------------------------------------------
| PESERTA ROUTES
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:peserta'])->group(function () {

    // ABSENSI
    Route::get('/absensi', [AbsensiController::class, 'absensiPeserta'])->name('absensi');
    Route::get('/absensi/{id}', [AbsensiController::class, 'detailAbsesnPeserta'])->name('absensi.show');
    Route::post('/absensi/check-in', [AbsensiController::class, 'checkIn'])->name('absensi.checkIn');
    Route::post('/absensi/check-out', [AbsensiController::class, 'checkOut'])->name('absensi.checkOut');
    Route::post('/absensi/izin', [AbsensiController::class, 'requestIzin'])->name('absensi.izin');

    // LOGBOOK USER
    Route::get('/logBook', [LogbookController::class, 'userIndex'])->name('logBook');
    Route::post('/logBook', [LogbookController::class, 'storeUser'])->name('logBook.store');
    Route::get('/logBook/export', [LogbookController::class, 'exportUserCsv'])->name('logBook.export');
    Route::match(['put', 'patch'], '/logBook/{logbook}', [LogbookController::class, 'updateUser'])->name('logBook.update');
    Route::delete('/logBook/{logbook}', [LogbookController::class, 'destroyUser'])->name('logBook.destroy');

    // FORMULIR
    Route::get('/formulir', [KesanggupanController::class, 'index'])->name('formulir');
    Route::post('/formulir', [KesanggupanController::class, 'store'])->name('formulir.store');

    // SERTIFIKAT
    Route::get('/sertifikat', [SertifikatController::class, 'index'])->name('sertifikat');

    // PROFILE
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::post('/profile', [ProfileController::class, 'update'])->name('PesertaProfile.update');
});
/*
|--------------------------------------------------------------------------
| ADMIN PANEL
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        // Kelola PIC
        Route::get('/kelola-pic', [PICUserController::class, 'index'])->name('kelolaPIC.index');
        Route::post('/kelola-pic', [PICUserController::class, 'store'])->name('kelolaPIC.store');
        Route::match(['put', 'patch'], '/kelola-pic/{user}', [PICUserController::class, 'update'])->name('kelolaPIC.update');
        Route::delete('/kelola-pic/{user}', [PICUserController::class, 'destroy'])->name('kelolaPIC.destroy');

        // Sertifikat Admin
        Route::get('/sertifikat', [SertifikatController::class, 'adminIndex'])->name('sertifikat.index');
        Route::get('/sertifikat/{sertifikat}/download', [SertifikatController::class, 'download'])->name('sertifikat.download');
        Route::post('/sertifikat/{sertifikat}/regenerate', [SertifikatController::class, 'regenerate'])->name('sertifikat.regenerate');
        Route::post('/sertifikat/{sertifikat}/validate', [SertifikatController::class, 'validateCertificate'])->name('sertifikat.validate');
        Route::post('/sertifikat/template', [SertifikatController::class, 'uploadTemplate'])->name('sertifikat.uploadTemplate');
        Route::get('/sertifikat/template/preview', [SertifikatController::class, 'previewTemplate'])->name('sertifikat.previewTemplate');
        Route::get('/sertifikat/template/active', [SertifikatController::class, 'getActiveTemplate'])->name('sertifikat.activeTemplate');
        Route::post('/sertifikat/batch-generate', [SertifikatController::class, 'generateBatch'])->name('sertifikat.batchGenerate');
        Route::post('/penilaian/{penilaian}/generate-sertifikat', [SertifikatController::class, 'generateFromPenilaian'])->name('penilaian.generateSertifikat');
        
        // Approval sertifikat
        Route::post('/sertifikat/{sertifikat}/approve', [SertifikatController::class, 'approveCertificate'])->name('sertifikat.approve');
        Route::post('/sertifikat/batch-approve', [SertifikatController::class, 'approveBatch'])->name('sertifikat.batchApprove');
    });

/*
|--------------------------------------------------------------------------
| PIC PANEL
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:pic'])
    ->prefix('pic')
    ->name('pic.')
    ->group(function () {

        // Kelola PIC
        Route::get('/kelola-pic', [PICUserController::class, 'index'])->name('kelolaPIC.index');
        Route::post('/kelola-pic', [PICUserController::class, 'store'])->name('kelolaPIC.store');
        Route::match(['put', 'patch'], '/kelola-pic/{user}', [PICUserController::class, 'update'])->name('kelolaPIC.update');
        Route::delete('/kelola-pic/{user}', [PICUserController::class, 'destroy'])->name('kelolaPIC.destroy');

        // Sertifikat PIC
        Route::get('/sertifikat', [SertifikatController::class, 'picIndex'])->name('sertifikat.index');
        Route::get('/sertifikat/{sertifikat}/download', [SertifikatController::class, 'download'])->name('sertifikat.download');
        Route::post('/sertifikat/{sertifikat}/regenerate', [SertifikatController::class, 'regenerate'])->name('sertifikat.regenerate');
        Route::post('/sertifikat/{sertifikat}/validate', [SertifikatController::class, 'validateCertificate'])->name('sertifikat.validate');
        Route::post('/sertifikat/batch-generate', [SertifikatController::class, 'generateBatch'])->name('sertifikat.batchGenerate');
        Route::post('/penilaian/{penilaian}/generate-sertifikat', [SertifikatController::class, 'generateFromPenilaian'])->name('penilaian.generateSertifikat');
        
        // Approval sertifikat untuk PIC
        Route::post('/sertifikat/{sertifikat}/approve', [SertifikatController::class, 'approveCertificate'])->name('sertifikat.approve');
        Route::post('/sertifikat/batch-approve', [SertifikatController::class, 'approveBatch'])->name('sertifikat.batchApprove');
    });
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
