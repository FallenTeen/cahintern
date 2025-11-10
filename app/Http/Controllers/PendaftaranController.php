<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PendaftaranController extends Controller
{
    public function index()
    {
        return Inertia::render('pendaftaran');
    }

    public function store()
    {

    }

}
