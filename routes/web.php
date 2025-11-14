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
    // Route disini buat yang udah acc jadi peserta (role nya)
    Route::middleware('bukancalonpeserta')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    });

});
Route::get('/data-pendaftaran', [PendaftaranController::class, 'index'])->name('dataPendaftaran');

Route::get('/data-mahasiswa-aktif', [MahasiswaController::class, 'index'])->name('dataMahasiswaAktif');

Route::get('/data-pic', [PICCOntroller::class, 'index'])->name('dataPIC');

Route::get('/absen-mahasiswa', [AbsensiController::class, 'index'])->name('absenMahasiswa');

Route::get('/logbook-mahasiswa', [LogbookController::class, 'index'])->name('logbookMahasiswa');

Route::get('/penilaian-dan-sertifikat', [PenilaianController::class, 'index'])->name('penilaianDanSertifikat');

Route::get('/data-pic', function () {
    return Inertia::render('dataPIC');
})->name('dataPIC');

Route::get('/pengumuman-dan-konten', function () {
    return Inertia::render('pengumumanKonten');
})->name('pengumumanKonten');

Route::get('/logBook', function () {
    return Inertia::render('user/logBook');
})->name('logBook');

Route::get('/profile', function () {
    return Inertia::render('user/profile');
})->name('profile');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
