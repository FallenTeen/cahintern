<?php

use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\KontenController;
use App\Http\Controllers\LogbookController;
use App\Http\Controllers\MahasiswaController;
use App\Http\Controllers\PenilaianController;
use App\Http\Controllers\PICCOntroller;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\PendaftaranController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SertifikatController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/persyaratan', function () {
    return Inertia::render('persyaratan');
})->name('persyaratan');

Route::prefix('pendaftaran')->name('pendaftaran.')->group(function () {
    Route::get('/', [PendaftaranController::class, 'halPendaftaranGuest'])->name('halPendaftaranGuest');
    Route::post('/', [PendaftaranController::class, 'guestDaftar'])->name('guestDaftar');
    Route::get('/bidang', [PendaftaranController::class, 'getBidangMagang'])->name('bidang');
    Route::get('/menunggu-verifikasi', [PendaftaranController::class, 'waitingRoom'])->name('tunggu');
    Route::post('/cek-status', [PendaftaranController::class, 'checkStatus'])->name('cek-status');
});

Route::get('/waitingroom-pendaftaran', function () {
    return redirect()->route('pendaftaran.tunggu');
})->name('tungguakun');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware('bukancalonpeserta')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    });

});

Route::get('/data-pendaftaran', [PendaftaranController::class, 'index'])->name('dataPendaftaran');
Route::get('/data-pendaftaran/{id}', [PendaftaranController::class, 'show'])->name('dataPendaftaran.show');
Route::post('/data-pendaftaran/{id}/approve', [PendaftaranController::class, 'approve'])->name('dataPendaftaran.approve');
Route::post('/data-pendaftaran/{id}/reject', [PendaftaranController::class, 'reject'])->name('dataPendaftaran.reject');
Route::delete('/data-pendaftaran/{id}', [PendaftaranController::class, 'destroy'])->name('dataPendaftaran.destroy');

Route::get('/data-mahasiswa-aktif', [MahasiswaController::class, 'index'])->name('dataMahasiswaAktif');
Route::get('/data-mahasiswa-aktif/{id}', [MahasiswaController::class, 'show'])->name('dataMahasiswaAktif.show');

Route::get('/data-pic', [PICCOntroller::class, 'index'])->name('dataPIC');

Route::get('/absen-mahasiswa', [AbsensiController::class, 'index'])->name('absenMahasiswa');
Route::get('/absensi', [AbsensiController::class, 'absensiPeserta'])->name('absensi');

Route::prefix('logbook')->name('logbook.')->group(function () {
    Route::get('/', [LogbookController::class, 'index'])->name('index');
    Route::get('/mahasiswa/{pesertaProfileId}', [LogbookController::class, 'showLogbookMahasiswa'])
        ->name('mahasiswa.show')
        ->where('pesertaProfileId', '[0-9]+');
    Route::get('/detail/{logbook}', [LogbookController::class, 'showDetailLogbook'])
        ->name('detail');
});

Route::get('/logbook-mahasiswa', [LogbookController::class, 'index'])->name('logbookMahasiswa');

Route::get('/penilaian-dan-sertifikat', [PenilaianController::class, 'index'])->name('penilaianDanSertifikat');

Route::get('/pengumuman-dan-konten',[KontenController::class,'index'])->name('pengumumanKonten');

Route::get('/sertifikat',[SertifikatController::class,'index'])->name('sertifikat');

Route::get('/profile',[ProfileController::class,'index'])->name('profile');

Route::get('/logBook', function () {
    return Inertia::render('user/logBook');
})->name('logBook');

Route::get('/formulir', function () {
    return Inertia::render('user/formulir');
})->name('formulir');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
