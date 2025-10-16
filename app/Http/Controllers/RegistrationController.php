<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Registration;
use App\Models\User;

class RegistrationController extends Controller
{
   
    public function register($id, Request $request)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        // Check if already registered
        $exists = Registration::where('event_id', $id)
            ->where('email', $request->email)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'User already registered'], 400);
        }

        

       $user = User::where('email', $request->email)->first();

if ($user && $user->penalties >= 3) {
    return response()->json(['message' => 'You are restricted from registering for events due to penalties.'], 403);
}


        // Create registration
        $registration = Registration::create([
            'event_id' => $id,
            'name' => $request->name,
            'email' => $request->email,
            'attendance' => 'pending',
        ]);

        $event->load('registrations'); 

return response()->json([
    'message' => 'User registered successfully',
    'event' => $event
]);

    }

   
    public function unregister($id, Request $request)
    {
        $registration = Registration::where('event_id', $id)
            ->where('email', $request->email)
            ->first();

        if (!$registration) {
            return response()->json(['message' => 'Registration not found'], 404);
        }

        $registration->delete();

        return response()->json(['message' => 'User unregistered successfully']);
    }

    // Get all registrations for an event
    public function getRegistrations($id)
    {
        $registrations = Registration::where('event_id', $id)->get();
        return response()->json($registrations);
    }

    public function updateAttendance(Request $request, $id)
{
    $registration = Registration::find($id);
    if (!$registration) return response()->json(['message' => 'Registration not found'], 404);

    $registration->attendance = $request->attendance;
    $registration->save();

    return response()->json(['message' => 'Attendance updated', 'registration' => $registration]);
}

}
