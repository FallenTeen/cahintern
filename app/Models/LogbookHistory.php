<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogbookHistory extends Model
{
    use HasFactory;

    protected $table = 'logbook_histories';

    protected $fillable = [
        'logbook_id',
        'user_id',
        'action',
        'note',
    ];

    public function logbook()
    {
        return $this->belongsTo(Logbook::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

