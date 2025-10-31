<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'name', 
        'email',
        'attendance',
         'attendance_marked_at',
        'user_id',
        'status', // Add this
        'cancellation_reason', // Add this
        'cancelled_at' // Add this
    ];

    protected $casts = [
         'attendance_marked_at' => 'datetime',
        'cancelled_at' => 'datetime', // Add this
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper methods
    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    public function isRegistered()
    {
        return $this->status === 'registered';
    }
}