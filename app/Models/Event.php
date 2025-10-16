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
        'time', // Add time to fillable
        'location',
        'category',
    ];

    protected $casts = [
        'date' => 'date', // Keep as date only
        
    ];
    
    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }
}