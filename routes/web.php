<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\PendaftaranController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/pendaftaran', function () {
    return Inertia::render('pendaftaran');
})->name('pendaftaran');

Route::get('/tentang', function () {
    return Inertia::render('tentang');
})->name('tentang');

Route::middleware(['auth', 'verified','bukancalonpeserta'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});
Route::get('/waitingroom-pendaftaran', function () {
    return Inertia::render('tungguakun');
})->name('tungguakun');

Route::get('/pendaftaran', [PendaftaranController::class, 'index'])->name('pendaftaran');


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
