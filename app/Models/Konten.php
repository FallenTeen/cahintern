<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Konten extends Model
{
    protected $fillable = [
        'judul',
        'deskripsi',
        'konten',
        'slug',
    ];

    public function scopeBySlug($query, $slug)
    {
        return $query->where('slug', $slug);
    }
}
