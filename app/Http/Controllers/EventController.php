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

        Log::info('Validation passed', ['validated_data' => $validated]); 

        try {
           
            $eventDateTime = Carbon::createFromFormat('Y-m-d H:i', $validated['date'] . ' ' . $validated['start_time']);
            
            if ($eventDateTime->isPast()) {
                return response()->json([
                    'message' => 'You cannot create an event in the past.'
                ], 422);
            }

            $event = Event::create($validated);

            // CREATE NOTIFICATIONS FOR ALL USERS
            $users = User::where('role', 'user')->get();
            
            foreach ($users as $user) {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => 'New Event Created! 🎉',
                    'message' => 'A new event "'.$event->title.'" has been scheduled for '.Carbon::parse($event->date)->format('F j, Y').'. Check it out!',
                    'event_id' => $event->id,
                    'is_read' => false,
                    'type' => 'success'
                ]);
            }

            // Send emails (your existing code)
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

}