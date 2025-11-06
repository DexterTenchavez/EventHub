<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Feedback;
use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class FeedbackController extends Controller
{
    // Submit feedback for an event
    public function store(Request $request, $eventId)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $validated = $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:1000',
            ]);

            $event = Event::findOrFail($eventId);

            // Check if user is registered for this event
            $isRegistered = $event->registrations()
                ->where('email', $user->email)
                ->exists();

            if (!$isRegistered) {
                return response()->json([
                    'message' => 'You can only provide feedback for events you registered for.'
                ], 403);
            }

            // Check if user already submitted feedback for this event
            $existingFeedback = Feedback::where('event_id', $eventId)
                ->where('user_id', $user->id)
                ->first();

            if ($existingFeedback) {
                return response()->json([
                    'message' => 'You have already submitted feedback for this event.'
                ], 409);
            }

            // Create feedback
            $feedback = Feedback::create([
                'event_id' => $eventId,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
                'event_title' => $event->title,
                'event_category' => $event->category
            ]);

            // Create notification for admin about new feedback
            $this->createFeedbackNotification($feedback);

            return response()->json([
                'message' => 'Feedback submitted successfully!',
                'feedback' => $feedback
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error("Failed to submit feedback: " . $e->getMessage());
            return response()->json([
                'message' => 'Failed to submit feedback: ' . $e->getMessage()
            ], 500);
        }
    }

    // Get feedback for a specific event
    public function getEventFeedback($eventId)
    {
        try {
            $event = Event::findOrFail($eventId);
            
            $feedback = $event->feedback()
                ->with('user')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'event' => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'average_rating' => $event->average_rating,
                    'feedback_count' => $event->feedback_count
                ],
                'feedback' => $feedback
            ]);

        } catch (\Exception $e) {
            Log::error("Error fetching feedback for event {$eventId}: " . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching feedback'
            ], 500);
        }
    }

    // Get user's feedback history
    public function getUserFeedback($userId)
    {
        try {
            $user = Auth::user();
            
            // Users can only see their own feedback, unless admin
            if ($user->id != $userId && $user->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $feedback = Feedback::where('user_id', $userId)
                ->with('event')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($feedback);

        } catch (\Exception $e) {
            Log::error("Error fetching feedback for user {$userId}: " . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching user feedback'
            ], 500);
        }
    }

    // Check if user has given feedback for specific events
    public function checkUserFeedback(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validated = $request->validate([
                'event_ids' => 'required|array',
                'event_ids.*' => 'integer|exists:events,id'
            ]);

            $feedback = Feedback::where('user_id', $user->id)
                ->whereIn('event_id', $validated['event_ids'])
                ->get()
                ->keyBy('event_id');

            return response()->json($feedback);

        } catch (\Exception $e) {
            Log::error("Error checking user feedback: " . $e->getMessage());
            return response()->json([
                'message' => 'Error checking feedback'
            ], 500);
        }
    }

    // Get all feedback (for admin)
    public function getAllFeedback()
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'admin') {
                return response()->json(['message' => 'Admin access required'], 403);
            }

            $feedback = Feedback::with(['event', 'user'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($feedback);

        } catch (\Exception $e) {
            Log::error("Error fetching all feedback: " . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching feedback'
            ], 500);
        }
    }

    // Delete feedback (for admin)
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'admin') {
                return response()->json(['message' => 'Admin access required'], 403);
            }

            $feedback = Feedback::findOrFail($id);
            $feedback->delete();

            return response()->json([
                'message' => 'Feedback deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error("Error deleting feedback {$id}: " . $e->getMessage());
            return response()->json([
                'message' => 'Error deleting feedback'
            ], 500);
        }
    }

    // Create notification for admin about new feedback
    private function createFeedbackNotification($feedback)
    {
        try {
            $admins = User::where('role', 'admin')->get();
            
            foreach ($admins as $admin) {
                \App\Models\Notification::create([
                    'user_id' => $admin->id,
                    'title' => 'New Feedback Received 📝',
                    'message' => "{$feedback->user_name} submitted {$feedback->rating}-star feedback for '{$feedback->event_title}'",
                    'type' => 'info',
                    'is_read' => false
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Error creating feedback notification: " . $e->getMessage());
        }
    }
}