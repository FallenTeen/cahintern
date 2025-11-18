<?php

namespace App\Http\Controllers;

use App\Models\Konten;
use App\Models\Pengumuman;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class KontenController extends Controller
{
    public function index(){
        $search = request('search');
        $tipe = request('tipe');

        $pengumumanData = [];
        $kontenData = [];

        if (!$tipe || $tipe === 'pengumuman' || $tipe === 'semua') {
            $pengumumanQuery = Pengumuman::query();

            if ($search) {
                $pengumumanQuery->where('judul', 'like', '%' . $search . '%')
                               ->orWhere('isi', 'like', '%' . $search . '%');
            }

            $pengumumanData = $pengumumanQuery->paginate(10)->through(function ($pengumuman) {
                return [
                    'id' => $pengumuman->id,
                    'judul' => $pengumuman->judul,
                    'isi' => $pengumuman->isi,
                    'status' => $pengumuman->status,
                    'published_at' => $pengumuman->published_at ? $pengumuman->published_at->format('d F Y H:i') : null,
                    'created_at' => $pengumuman->created_at->format('d F Y H:i'),
                    'tipe' => 'pengumuman',
                ];
            });
        }

        if (!$tipe || $tipe === 'konten' || $tipe === 'semua') {
            $kontenQuery = Konten::query();

            if ($search) {
                $kontenQuery->where('judul', 'like', '%' . $search . '%')
                           ->orWhere('deskripsi', 'like', '%' . $search . '%');
            }

            $kontenData = $kontenQuery->paginate(10)->through(function ($konten) {
                return [
                    'id' => $konten->id,
                    'judul' => $konten->judul,
                    'deskripsi' => $konten->deskripsi,
                    'slug' => $konten->slug,
                    'created_at' => $konten->created_at->format('d F Y H:i'),
                    'tipe' => 'konten',
                ];
            });
        }

        return Inertia::render('pengumumanKonten/index', [
            'pengumumanData' => $pengumumanData,
            'kontenData' => $kontenData,
        ]);
    }
}
