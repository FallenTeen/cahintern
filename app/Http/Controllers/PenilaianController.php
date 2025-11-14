<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PenilaianController extends Controller
{
    public function index(){
        return Inertia::render('penilaianDanSertifikat');
    }
}
