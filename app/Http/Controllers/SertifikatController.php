<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SertifikatController extends Controller
{
    public function index()
    {
        return inertia::render('user/sertifikat');
    }
}
