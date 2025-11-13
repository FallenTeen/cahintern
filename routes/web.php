<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\PendaftaranController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/persyaratan', function () {
    return Inertia::render('persyaratan');
})->name('persyaratan');

Route::prefix('pendaftaran')->name('pendaftaran.')->group(function () {
    Route::get('/', [PendaftaranController::class, 'index'])->name('index');
    Route::post('/', [PendaftaranController::class, 'store'])->name('store');
    Route::get('/bidang', [PendaftaranController::class, 'getBidangMagang'])->name('bidang');
    Route::get('/menunggu-verifikasi', [PendaftaranController::class, 'waitingRoom'])->name('tunggu');
    Route::post('/cek-status', [PendaftaranController::class, 'checkStatus'])->name('cek-status');
});

Route::get('/waitingroom-pendaftaran', function () {
    return redirect()->route('pendaftaran.tunggu');
})->name('tungguakun');

Route::middleware(['auth', 'verified'])->get('/dashboard', function () {
    $user = auth()->user();

    if ($user->role === 'admin') {
        return Inertia::render('dashboard'); // Halaman admin
    }elseif ($user->role === 'peserta') {
        return Inertia::render('user/dashboard'); // Halaman peserta
    } else {
        return redirect()->route('tungguakun'); // Halaman calon peserta
    }
})->name('dashboard');

Route::get('/DataPendaftaran', function () {
    return Inertia::render('dataPendaftaran');
})->name('dataPendaftaran');

Route::get('/data-mahasiswa-aktif', function () {
    return Inertia::render('dataMahasiswaAktif');
})->name('dataMahasiswaAktif');

Route::get('/absen-mahasiswa', function () {
    return Inertia::render('absenMahasiswa');
})->name('absenMahasiswa');

Route::get('/logbook-mahasiswa', function () {
    return Inertia::render('logbookMahasiswa');
})->name('logbookMahasiswa');

Route::get('/penilaian-dan-sertifikat', function () {
    return Inertia::render('penilaianDanSertifikat');
})->name('penilaianDanSertifikat');

Route::get('/data-pic', function () {
    return Inertia::render('dataPIC');
})->name('dataPIC');

Route::get('/pengumuman-dan-konten', function () {
    return Inertia::render('pengumumanKonten');
})->name('pengumumanKonten');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
