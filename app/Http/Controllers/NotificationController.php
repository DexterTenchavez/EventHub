<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use App\Models\User;
use App\Mail\AnnouncementNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

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


public function createAnnouncement(Request $request)
{
    try {
        $admin = Auth::user();
        
        if (!$admin || $admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|string|in:info,warning,success,emergency', // ADD 'emergency' HERE
            'target_users' => 'required|string|in:all,specific_barangay',
            'barangay' => 'required_if:target_users,specific_barangay|string'
        ]);

        // Get all users or specific barangay users - ONLY REGULAR USERS
        if ($validated['target_users'] === 'all') {
            $users = User::where('role', 'user')->get();
        } else {
            $barangay = $validated['barangay'];
            $users = User::where('barangay', $barangay)
                        ->where('role', 'user')
                        ->get();
        }

        // Check if there are users to send to
        if ($users->isEmpty()) {
            return response()->json([
                'message' => 'No users found to send announcement to',
                'sent_to' => 0
            ], 200);
        }

        $notifications = [];
        $emailData = [
            'title' => $validated['title'],
            'message' => $validated['message'],
            'type' => $validated['type']
        ];

        $sentEmails = 0;
        $failedEmails = [];

        foreach ($users as $user) {
            // Create notification in database
            $notification = Notification::create([
                'user_id' => $user->id,
                'title' => $validated['title'],
                'message' => $validated['message'],
                'type' => $validated['type'],
                'is_read' => false,
                'is_announcement' => true,
            ]);
            $notifications[] = $notification;

            // Send email notification
            try {
                Mail::to($user->email)->send(new AnnouncementNotification($emailData, $user));
                $sentEmails++;
                
                // Add small delay to avoid hitting rate limits
                if ($sentEmails % 10 === 0) {
                    sleep(1);
                }
                
            } catch (\Exception $emailError) {
                Log::error("Failed to send email to {$user->email}: " . $emailError->getMessage());
                $failedEmails[] = $user->email;
            }
        }

        $response = [
            'message' => 'Announcement sent successfully',
            'sent_to' => count($users) . ' users',
            'notifications_created' => count($notifications),
            'emails_sent' => $sentEmails,
            'emails_failed' => count($failedEmails),
            'notifications' => $notifications
        ];

        if (!empty($failedEmails)) {
            $response['failed_emails'] = $failedEmails;
            $response['warning'] = 'Some emails failed to send. Check logs for details.';
        }

        return response()->json($response, 201);

    } catch (\Exception $e) {
        Log::error('Error creating announcement: ' . $e->getMessage());
        return response()->json(['message' => 'Internal server error'], 500);
    }
}


public function getAnnouncementHistory(Request $request)
{
    try {
        $admin = Auth::user();
        
        if (!$admin || $admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        // Get unique announcements by grouping
        $announcements = Notification::where('is_announcement', true)
            ->select(
                'title', 
                'message', 
                'type',
                DB::raw('MAX(created_at) as latest_date'),
                DB::raw('COUNT(DISTINCT user_id) as user_count'),
                DB::raw('MIN(id) as first_notification_id')
            )
            ->groupBy('title', 'message', 'type')
            ->orderBy('latest_date', 'desc')
            ->get()
            ->map(function($notification) {
                return [
                    'id' => $notification->first_notification_id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type,
                    'created_at' => $notification->latest_date,
                    'sent_to' => $notification->user_count . ' users',
                    'target_users' => 'all',
                    'emails_sent' => $notification->user_count,
                    'emails_failed' => 0
                ];
            });

        return response()->json($announcements);

    } catch (\Exception $e) {
        Log::error('Error fetching announcement history: ' . $e->getMessage());
        return response()->json(['message' => 'Internal server error'], 500);
    }
}
}