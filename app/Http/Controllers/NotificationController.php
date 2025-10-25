<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                Log::error('User not authenticated in notifications');
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            Log::info('Fetching notifications for user: ' . $user->id);

            $notifications = Notification::where('user_id', $user->id)
                ->with(['event' => function($query) {
                    $query->select('id', 'title', 'date', 'start_time', 'location', 'description'); // Add all needed fields
                }])
                ->orderBy('created_at', 'desc')
                ->get();

            Log::info('Found ' . $notifications->count() . ' notifications for user ' . $user->id);

            return response()->json($notifications);
        } catch (\Exception $e) {
            Log::error('Error in notifications index: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Internal server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
{
    try {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'event_id' => 'nullable|exists:events,id',
            'type' => 'required|string'
        ]);

        $notification = Notification::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'message' => $validated['message'],
            'event_id' => $validated['event_id'] ?? null,
            'type' => $validated['type'],
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Notification created successfully',
            'notification' => $notification
        ], 201);

    } catch (\Exception $e) {
        Log::error('Error creating notification: ' . $e->getMessage());
        return response()->json(['message' => 'Internal server error'], 500);
    }
}

    public function markAsRead($id)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $notification = Notification::where('user_id', $user->id)
                ->where('id', $id)
                ->first();

            if (!$notification) {
                return response()->json(['message' => 'Notification not found'], 404);
            }

            $notification->update(['is_read' => true]);

            return response()->json(['message' => 'Notification marked as read']);
        } catch (\Exception $e) {
            Log::error('Error marking notification as read: ' . $e->getMessage());
            return response()->json([
                'message' => 'Internal server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function markAllAsRead()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $updated = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            return response()->json([
                'message' => 'All notifications marked as read',
                'updated_count' => $updated
            ]);
        } catch (\Exception $e) {
            Log::error('Error marking all notifications as read: ' . $e->getMessage());
            return response()->json([
                'message' => 'Internal server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $notification = Notification::where('user_id', $user->id)
                ->where('id', $id)
                ->first();

            if (!$notification) {
                return response()->json(['message' => 'Notification not found'], 404);
            }

            $notification->delete();

            return response()->json(['message' => 'Notification deleted']);
        } catch (\Exception $e) {
            Log::error('Error deleting notification: ' . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    public function getUnreadCount()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $count = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();

            return response()->json(['unread_count' => $count]);
        } catch (\Exception $e) {
            Log::error('Error getting unread count: ' . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }



    public function createEventNotification(Request $request)
{
    try {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|string'
        ]);

        // Check if similar notification already exists (prevent duplicates)
        $existingNotification = Notification::where('user_id', $user->id)
            ->where('event_id', $validated['event_id'])
            ->where('title', $validated['title'])
            ->where('created_at', '>=', now()->subMinutes(60)) // Within 1 hour
            ->first();

        if ($existingNotification) {
            return response()->json(['message' => 'Notification already exists'], 200);
        }

        $notification = Notification::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'message' => $validated['message'],
            'event_id' => $validated['event_id'],
            'type' => $validated['type'],
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Notification created successfully',
            'notification' => $notification
        ], 201);

    } catch (\Exception $e) {
        Log::error('Error creating event notification: ' . $e->getMessage());
        return response()->json(['message' => 'Internal server error'], 500);
    }
}
}