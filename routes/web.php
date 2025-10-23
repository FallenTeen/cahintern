<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/pendaftaran', function () {
    return Inertia::render('pendaftaran');
})->name('pendaftaran');

Route::get('/tentang', function () {
    return Inertia::render('tentang');
})->name('tentang');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
