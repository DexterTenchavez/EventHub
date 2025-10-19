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
use App\Mail\EventStartingNotification;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::with('registrations')->get();
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

       
        $validated['time'] = $validated['start_time'] . ' - ' . $validated['end_time'];

        Log::info('Validation passed', ['validated_data' => $validated]); 

        try {
           
            $eventDateTime = Carbon::createFromFormat('Y-m-d H:i', $validated['date'] . ' ' . $validated['start_time']);
            
            if ($eventDateTime->isPast()) {
                return response()->json([
                    'message' => 'You cannot create an event in the past.'
                ], 422);
            }

            $event = Event::create($validated);

           
            $users = User::all();
            foreach ($users as $user) {
                try {
                    Mail::to($user->email)->send(new NewEventNotification($event));
                } catch (\Exception $e) {
                    Log::error("Failed to send email to {$user->email}: " . $e->getMessage());
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
        ]);

        $registration = Registration::where('event_id', $event->id)
            ->where('email', $validated['email'])
            ->first();

        if (!$registration) {
            return response()->json(['message' => 'Registration not found.'], 404);
        }

        $registration->delete();

        return response()->json(['message' => 'Unregistered successfully.']);
    }
    
   
    public function getRegistrations($id)
    {
        $event = Event::with('registrations')->findOrFail($id);
        return response()->json($event->registrations);
    }




     public function sendEventNotifications(Request $request)
{
    try {
        $now = Carbon::now();
        $notificationTime = $now->copy()->addMinutes(30);
        
        $events = Event::whereDate('date', $now->toDateString())  
                      ->whereTime('start_time', '<=', $notificationTime->toTimeString())
                      ->whereTime('start_time', '>', $now->toTimeString())
                      ->get();

        $totalSent = 0;
        $eventsProcessed = [];

        foreach ($events as $event) {
            // REMOVED the attendance filter - send to ALL registrations
            $registrations = Registration::where('event_id', $event->id)->get();

            $eventSent = 0;
            foreach ($registrations as $registration) {
                try {
                    Mail::to($registration->email)->send(new EventStartingNotification($event, $registration));
                    Log::info("Event starting notification sent to: {$registration->email} for event: {$event->title}");
                    $eventSent++;
                    $totalSent++;
                } catch (\Exception $e) {
                    Log::error("Failed to send event starting notification to {$registration->email}: " . $e->getMessage());
                }
            }

            $eventsProcessed[] = [
                'event_id' => $event->id,
                'event_title' => $event->title,
                'notifications_sent' => $eventSent,
                'start_time' => $event->start_time,
                'total_registrations' => $registrations->count()
            ];
        }

        return response()->json([
            'success' => true,
            'message' => "Event notifications processed successfully.",
            'total_emails_sent' => $totalSent,
            'events_processed' => $eventsProcessed,
            'processed_at' => $now->toDateTimeString()
        ]);

    } catch (\Exception $e) {
        Log::error("Failed to process event notifications: " . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to process event notifications: ' . $e->getMessage()
        ], 500);
    }
}

public function sendEventReminder($id)
{
    try {
        $event = Event::findOrFail($id);
        
        // FIX: Use proper date parsing
        $eventDateTime = Carbon::parse($event->date)->setTimeFromTimeString($event->start_time);
        
        Log::info("Event datetime: " . $eventDateTime->toDateTimeString());
        
        if ($eventDateTime->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Event has already started or ended. Cannot send reminders.'
            ], 400);
        }

        $registrations = Registration::where('event_id', $event->id)->get();

        if ($registrations->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No registered users found for this event.'
            ], 400);
        }

        $sentCount = 0;
        $failedCount = 0;

        foreach ($registrations as $registration) {
            try {
                Mail::to($registration->email)->send(new EventStartingNotification($event, $registration));
                Log::info("Event reminder sent to: {$registration->email} for event: {$event->title}");
                $sentCount++;
            } catch (\Exception $e) {
                Log::error("Failed to send reminder to {$registration->email}: " . $e->getMessage());
                $failedCount++;
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => "Event reminders sent successfully.",
            'event' => $event->title,
            'notifications_sent' => $sentCount,
            'notifications_failed' => $failedCount,
            'total_registrations' => $registrations->count()
        ]);

    } catch (\Exception $e) {
        Log::error("Failed to send event reminders for event {$id}: " . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to send event reminders: ' . $e->getMessage()
        ], 500);
    }
}






public function debugTimeCheck()
{
    $now = Carbon::now();
    $notificationTime = $now->copy()->addMinutes(30);
    
    $event = Event::find(1); // Your "fun run" event
    
    return response()->json([
        'current_time' => $now->toDateTimeString(),
        'notification_threshold' => $notificationTime->toDateTimeString(),
        'event_details' => [
            'id' => $event->id,
            'title' => $event->title,
            'date' => $event->date,
            'start_time' => $event->start_time,
            'combined_datetime' => $event->date . ' ' . $event->start_time
        ],
        'time_check' => [
            'is_today' => $event->date == $now->toDateString(),
            'start_time_ok' => $event->start_time > $now->toTimeString(),
            'within_30_min' => $event->start_time <= $notificationTime->toTimeString()
        ],
        'registrations_count' => Registration::where('event_id', 1)->count()
    ]);
}
}


