<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'date',
        'start_time', // Add this
        'end_time',   // Add this
        'time',       // Keep this for backward compatibility
        'location',
        'category',
    ];

    protected $casts = [
        'date' => 'date',
    ];
    
    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }
}