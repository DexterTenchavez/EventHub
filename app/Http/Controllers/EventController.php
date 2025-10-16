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


class EventController extends Controller
{

    public function index()
    {
        $events = Event::with('registrations')->get();
        return response()->json($events);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|date_format:H:i',
            'location' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
        ],
        [
            'date.after_or_equal' => 'You cannot create an event in the past.'
        ]);

        try {
            // Check if the event datetime is in the past
            $eventDateTime = Carbon::createFromFormat('Y-m-d H:i', $validated['date'] . ' ' . $validated['time']);
            
            if ($eventDateTime->isPast()) {
                return response()->json([
                    'message' => 'You cannot create an event in the past.'
                ], 422);
            }

            $event = Event::create($validated);

            // Notify all users via email
            $users = User::all();
            foreach ($users as $user) {
                try {
                    Mail::to($user->email)->send(new NewEventNotification($event));
                } catch (\Exception $e) {
                    Log::error("Failed to send email to {$user->email}: " . $e->getMessage());
                }
            }

            return response()->json([
                'message' => 'Event created successfully and users notified!',
                'event' => $event
            ], 201);

        } catch (\Exception $e) {
            Log::error("Failed to create event: " . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create event. Check server logs for details.'
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
            'time' => 'required|date_format:H:i',
            'location' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
        ], [
            'date.after_or_equal' => 'You cannot set the event date in the past.'
        ]);

        try {
            // Check if the event datetime is in the past
            $eventDateTime = Carbon::createFromFormat('Y-m-d H:i', $validated['date'] . ' ' . $validated['time']);
            
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

    // Delete an event
    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $event->delete();
        return response()->json(['message' => 'Event deleted successfully']);
    }

    public function register($id, Request $request)
    {
        $event = Event::findOrFail($id);

        // Check if event is in the past using both date and time
        $eventDateTime = Carbon::createFromFormat('Y-m-d H:i', $event->date . ' ' . $event->time);
        
        if (now()->greaterThan($eventDateTime)) {
            return response()->json([
                'message' => 'This event has already ended. Registration is closed.'
            ], 400);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
        ]);

        // Check if already registered
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

    // Unregister a user from an event
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
    
    // Get event registrations
    public function getRegistrations($id)
    {
        $event = Event::with('registrations')->findOrFail($id);
        return response()->json($event->registrations);
    }
}