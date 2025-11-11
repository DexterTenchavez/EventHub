<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'event_id',
        'is_read',
        'type',
        'is_announcement' // Add this field
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'is_announcement' => 'boolean', // Add this cast
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    // Scope for announcements
    public function scopeAnnouncements($query)
    {
        return $query->where('is_announcement', true);
    }

    // Scope for event notifications
    public function scopeEventNotifications($query)
    {
        return $query->where('is_announcement', false);
    }
}