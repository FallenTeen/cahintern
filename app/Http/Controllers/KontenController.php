<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class KontenController extends Controller
{
    public function index(){
        return Inertia::render('pengumumanKonten');
    }
}
