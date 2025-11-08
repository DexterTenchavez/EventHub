<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use Carbon\Carbon;
use App\Models\Registration;
use App\Mail\NewEventNotification;
use Illuminate\Support\Facades\Log; 
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Models\Notification;

class EventController extends Controller
{
   public function index()
{
    $events = Event::with(['registrations', 'feedback'])->get();
    
    // Transform the events to include user feedback status
    $events = $events->map(function ($event) {
        $eventData = $event->toArray();
        
        // Include user feedback status if authenticated
        if (\Illuminate\Support\Facades\Auth::check()) {
            $user = \Illuminate\Support\Facades\Auth::user();
            $eventData['user_has_feedback'] = $event->feedback()
                ->where('user_id', $user->id)
                ->exists();
        } else {
            $eventData['user_has_feedback'] = false;
        }
        
        return $eventData;
    });
    
    return response()->json($events);
}

   public function store(Request $request)
{
    Log::info('Store method called', ['request_data' => $request->all()]); 

    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'required|string',
        'date' => 'required|date_format:Y-m-d',
        'start_time' => 'required|date_format:H:i',
        'end_time' => 'required|date_format:H:i',
        'location' => 'required|string|max:255',
        'category' => 'nullable|string|max:255',
    ]);

    Log::info('Validation passed', ['validated_data' => $validated]); 

    try {
        $eventDateTime = Carbon::createFromFormat('Y-m-d H:i', $validated['date'] . ' ' . $validated['start_time']);
        
        if ($eventDateTime->isPast()) {
            return response()->json([
                'message' => 'You cannot create an event in the past.'
            ], 422);
        }

        $event = Event::create($validated);

        // FIXED: Check if notification already exists for this event
        $existingNotification = Notification::where('event_id', $event->id)
            ->where('title', 'like', '%New Event Created%')
            ->first();

        if (!$existingNotification) {
            // CREATE NOTIFICATIONS FOR ALL USERS
            $users = User::where('role', 'user')->get();
            
            foreach ($users as $user) {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => 'New Event! 🎉',
                    'message' => 'A new event "'.$event->title.'" has been scheduled for '.Carbon::parse($event->date)->format('F j, Y').'. Check it out!',
                    'event_id' => $event->id,
                    'is_read' => false,
                    'type' => 'success'
                ]);

                // FIXED: Send email notification to each user
                try {
                    Mail::to($user->email)->send(new NewEventNotification($event));
                    Log::info('Email notification sent to: ' . $user->email);
                } catch (\Exception $emailException) {
                    Log::error('Failed to send email to ' . $user->email . ': ' . $emailException->getMessage());
                }
            }
        }

        return response()->json([
            'message' => 'Event created successfully!',
            'event' => $event
        ], 201);

    } catch (\Exception $e) {
        Log::error("Failed to create event: " . $e->getMessage());
        Log::error("Stack trace: " . $e->getTraceAsString()); 
        
        return response()->json([
            'message' => 'Failed to create event: ' . $e->getMessage()
        ], 500);
    }
}

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date_format:Y-m-d',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'location' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
        ], [
            'date.after_or_equal' => 'You cannot set the event date in the past.'
        ]);

        try {
           
            $eventDateTime = Carbon::createFromFormat('Y-m-d H:i', $validated['date'] . ' ' . $validated['start_time']);
            
            if ($eventDateTime->isPast()) {
                return response()->json([
                    'message' => 'You cannot set the event date in the past.'
                ], 422);
            }

            $event->update($validated);

            return response()->json(['message' => 'Event updated successfully', 'event' => $event]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid date format'], 422);
        }
    }

   
    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $event->delete();
        return response()->json(['message' => 'Event deleted successfully']);
    }


    public function register($id, Request $request)
    {
        $event = Event::findOrFail($id);

       
        $eventDateTime = Carbon::createFromFormat('Y-m-d H:i', $event->date . ' ' . $event->start_time);
    
        if (now()->greaterThan($eventDateTime)) {
            return response()->json([
                'message' => 'This event has already ended. Registration is closed.'
            ], 400);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
        ]);

      
        $existing = Registration::where('event_id', $event->id)
            ->where('email', $validated['email'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'User already registered for this event.'], 400);
        }

        $registration = Registration::create([
            'event_id' => $event->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'attendance' => 'pending',
        ]);

        return response()->json(['message' => 'Registered successfully!', 'registration' => $registration], 201);
    }

   
    public function unregister($id, Request $request)
{
    $event = Event::findOrFail($id);

    $validated = $request->validate([
        'email' => 'required|email',
        'cancellation_reason' => 'required|string|in:health,injury,schedule_conflict,personal_reasons,other'
    ]);

    
    $user = User::where('email', $validated['email'])->first();
    
    if ($user) {
        $recentCancellations = Registration::where('user_id', $user->id)
            ->where('status', 'cancelled')
            ->where('cancelled_at', '>=', now()->subHours(24))
            ->count();

        if ($recentCancellations >= 5) {
            return response()->json([
                'message' => 'You have reached the daily cancellation limit (5 cancellations per 24 hours). Please try again tomorrow.'
            ], 429);
        }
    }

    $registration = Registration::where('event_id', $event->id)
        ->where('email', $validated['email'])
        ->first();

    if (!$registration) {
        return response()->json(['message' => 'Registration not found.'], 404);
    }

    // Instead of deleting, update with cancellation info
    $registration->update([
        'status' => 'cancelled',
        'cancellation_reason' => $validated['cancellation_reason'],
        'cancelled_at' => now()
    ]);

    // Log the cancellation for admin tracking
    Log::info('Registration cancelled', [
        'event_id' => $event->id,
        'event_title' => $event->title,
        'user_email' => $validated['email'],
        'cancellation_reason' => $validated['cancellation_reason'],
        'cancelled_at' => now()
    ]);

    return response()->json([
        'message' => 'Registration cancelled successfully.',
        'cancellation_reason' => $validated['cancellation_reason']
    ]);
}
    
   
    public function getRegistrations($id)
    {
        $event = Event::with('registrations')->findOrFail($id);
        return response()->json($event->registrations);
    }
   
    public function show($id)
    {
        try {
            $event = Event::with('registrations')->find($id);
            
            if (!$event) {
                return response()->json(['message' => 'Event not found'], 404);
            }

            return response()->json($event);
        } catch (\Exception $e) {
            Log::error("Error fetching event {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }   
    }

    public function sendEventNotifications(Request $request)
    {
        try {
            $validated = $request->validate([
                'event_id' => 'required|exists:events,id',
                'message' => 'required|string',
            ]);

            $event = Event::findOrFail($validated['event_id']);
            $users = User::where('role', 'user')->get();

            foreach ($users as $user) {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => "Event Update: {$event->title}",
                    'message' => $validated['message'],
                    'event_id' => $event->id,
                    'is_read' => false,
                    'type' => 'info'
                ]);
            }

            return response()->json([
                'message' => 'Event notifications sent successfully',
                'users_notified' => $users->count()
            ]);

        } catch (\Exception $e) {
            Log::error("Error sending event notifications: " . $e->getMessage());
            return response()->json(['message' => 'Error sending notifications'], 500);
        }
    }

    public function sendEventReminder($id)
    {
        try {
            $event = Event::findOrFail($id);
            $users = User::where('role', 'user')->get();

            foreach ($users as $user) {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => "Event Reminder: {$event->title}",
                    'message' => "Don't forget about {$event->title} happening on " . Carbon::parse($event->date)->format('F j, Y') . " at {$event->location}",
                    'event_id' => $event->id,
                    'is_read' => false,
                    'type' => 'warning'
                ]);
            }

            return response()->json([
                'message' => 'Event reminder sent successfully',
                'users_notified' => $users->count()
            ]);

        } catch (\Exception $e) {
            Log::error("Error sending event reminder: " . $e->getMessage());
            return response()->json(['message' => 'Error sending reminder'], 500);
        }
    }

    public function checkEventNotifications()
{
    try {
        $now = Carbon::now();
        $events = Event::where('date', '>=', $now->toDateString())->get();
        
        $notificationsSent = 0;

        foreach ($events as $event) {
            $eventDateTime = Carbon::createFromFormat('Y-m-d H:i', $event->date . ' ' . $event->start_time);
            $minutesUntilEvent = $now->diffInMinutes($eventDateTime, false);
            
            // Get users registered for this event
            $registeredUsers = Registration::where('event_id', $event->id)
                ->with('user')
                ->get()
                ->pluck('user')
                ->filter();

            // Send notifications based on time to registered users only
            if ($minutesUntilEvent > 0 && $minutesUntilEvent <= 30) {
                $this->sendEventTimedReminder($event, $registeredUsers, $minutesUntilEvent . ' minutes');
                $notificationsSent++;
            } elseif ($minutesUntilEvent <= 0 && $minutesUntilEvent > -60) {
                $this->sendEventStarted($event, $registeredUsers);
                $notificationsSent++;
            }
        }

        return response()->json([
            'message' => 'Event notifications checked',
            'notifications_sent' => $notificationsSent,
            'events_checked' => $events->count()
        ]);

    } catch (\Exception $e) {
        Log::error("Error checking event notifications: " . $e->getMessage());
        return response()->json(['message' => 'Error checking notifications'], 500);
    }
}


   
   private function sendEventTimedReminder($event, $users, $timeText)
{
    foreach ($users as $user) {
        // Check if notification already exists to prevent duplicates
        $existingNotification = Notification::where('user_id', $user->id)
            ->where('event_id', $event->id)
            ->where('title', 'like', '%Event Starting Soon%')
            ->where('created_at', '>=', now()->subMinutes(5))
            ->first();

        if (!$existingNotification) {
            Notification::create([
                'user_id' => $user->id,
                'title' => "Event Starting Soon ⏰",
                'message' => "{$event->title} will start in {$timeText}. Get ready!",
                'event_id' => $event->id,
                'is_read' => false,
                'type' => 'warning'
            ]);
        }
    }
}

    // Helper method to send event started notifications
   private function sendEventStarted($event, $users)
{
    foreach ($users as $user) {
        // Check if notification already exists to prevent duplicates
        $existingNotification = Notification::where('user_id', $user->id)
            ->where('event_id', $event->id)
            ->where('title', 'like', '%Event Started%')
            ->where('created_at', '>=', now()->subMinutes(5))
            ->first();

        if (!$existingNotification) {
            Notification::create([
                'user_id' => $user->id,
                'title' => "Event Started! 🎉",
                'message' => "{$event->title} has officially started. Join now!",
                'event_id' => $event->id,
                'is_read' => false,
                'type' => 'success'
            ]);
        }
    }
}
}