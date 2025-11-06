<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'user_id',
        'user_name',
        'user_email',
        'rating',
        'comment',
        'event_title',
        'event_category'
    ];

    protected $casts = [
        'rating' => 'integer'
    ];

    // Relationship with Event
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Get rating as text
    public function getRatingTextAttribute()
    {
        $ratings = [
            1 => 'Poor',
            2 => 'Fair',
            3 => 'Good',
            4 => 'Very Good',
            5 => 'Excellent'
        ];
        
        return $ratings[$this->rating] ?? 'Unknown';
    }
}