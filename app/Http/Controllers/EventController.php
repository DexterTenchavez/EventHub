<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Registration;

class EventController extends Controller
{

    public function index()
    {
        $events = Event::with('registrations')->get();
    return response()->json($events);
    }

    // Create a new event
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date',
            'location' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
        ]);

        $event = Event::create($validated);

        return response()->json(['message' => 'Event created successfully', 'event' => $event], 201);
    }

    // Update an event
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $event->update($request->all());
        return response()->json(['message' => 'Event updated successfully', 'event' => $event]);
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

    // ✅ Unregister a user from an event
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
    
}
