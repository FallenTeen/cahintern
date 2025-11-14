<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PICCOntroller extends Controller
{
    public function index(){
        return Inertia::render('dataPIC');
    }
}
