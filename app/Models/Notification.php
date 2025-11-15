<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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

    public function deleteAllRead()
{
    try {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $deletedCount = Notification::where('user_id', $user->id)
            ->where('is_read', true)
            ->delete();

        return response()->json([
            'message' => 'All read notifications deleted successfully',
            'deleted_count' => $deletedCount
        ]);

    } catch (\Exception $e) {
        Log::error('Error deleting all read notifications: ' . $e->getMessage());
        return response()->json(['message' => 'Internal server error'], 500);
    }
}
}