<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\inertia;

class MahasiswaController extends Controller
{
    public function index(){
        return Inertia::render('dataMahasiswaAktif');
    }
}
