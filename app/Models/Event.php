<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    // These are the columns your table allows to be mass assigned
    protected $fillable = [
        'title',
        'description',
        'date',
        'location',
        'category',
    ];

    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }
}
