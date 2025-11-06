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
        'start_time', 
        'end_time',
        'location',
        'category'
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function registrations()
    {
        return $this->hasMany(Registration::class)->where('status', '!=', 'cancelled');
    }

    public function allRegistrations()
    {
        return $this->hasMany(Registration::class);
    }

    public function cancelledRegistrations()
    {
        return $this->hasMany(Registration::class)->where('status', 'cancelled');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // ADD THIS: Feedback relationship
    public function feedback()
    {
        return $this->hasMany(Feedback::class);
    }

    // ADD THIS: Calculate average rating
    public function getAverageRatingAttribute()
    {
        return $this->feedback()->avg('rating') ?: 0;
    }

    // ADD THIS: Get feedback count
    public function getFeedbackCountAttribute()
    {
        return $this->feedback()->count();
    }
}