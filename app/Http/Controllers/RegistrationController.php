<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class RegistrationController extends Controller
{
  public function register($id, Request $request)
    {
        try {
            // BACKEND RATE LIMITING: 5 registrations per hour per user
            $rateLimitKey = 'event_registration:' . $request->email;
            
            if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) {
                $seconds = RateLimiter::availableIn($rateLimitKey);
                $minutes = ceil($seconds / 60);
                
                Log::warning('Rate limit exceeded', [
                    'email' => $request->email,
                    'event_id' => $id,
                    'retry_after' => $seconds
                ]);
                
                return response()->json([
                    'message' => 'You have reached the maximum registration limit (5 per hour). Please try again in ' . $minutes . ' minutes.',
                    'retry_after' => $seconds
                ], 429);
            }
            
            RateLimiter::hit($rateLimitKey, 3600); // 1 hour window

            Log::info('Registration attempt', [
                'event_id' => $id,
                'email' => $request->email,
                'name' => $request->name,
                'all_request_data' => $request->all()
            ]);

            // 1. Validate request data
            $request->validate([
                'email' => 'required|email',
                'name' => 'required|string'
            ]);

            // 2. Find the event - ensure ID is integer
            $event = Event::find((int)$id);
            if (!$event) {
                Log::warning('Event not found', ['event_id' => $id]);
                return response()->json(['message' => 'Event not found'], 404);
            }

            // 3. Find the user
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                Log::warning('User not found', ['email' => $request->email]);
                return response()->json(['message' => 'User not found'], 404);
            }

            Log::info('User found', ['user_id' => $user->id, 'email' => $user->email]);

            // 4. Check if already registered (only active registrations)
            $existingRegistration = Registration::where('event_id', (int)$id)
                ->where('email', $request->email)
                ->where('status', 'registered')
                ->first();

            if ($existingRegistration) {
                Log::warning('User already registered', [
                    'event_id' => $id,
                    'email' => $request->email,
                    'registration_id' => $existingRegistration->id
                ]);
                return response()->json([
                    'message' => 'User already registered for this event',
                    'registration_id' => $existingRegistration->id
                ], 400);
            }

            // 5. Check for any existing cancelled registration
            $cancelledRegistration = Registration::where('event_id', (int)$id)
                ->where('email', $request->email)
                ->where('status', 'cancelled')
                ->first();

            if ($cancelledRegistration) {
                Log::info('Found cancelled registration, re-activating', [
                    'registration_id' => $cancelledRegistration->id
                ]);
                
                // Reactivate the cancelled registration
                $cancelledRegistration->update([
                    'status' => 'registered',
                    'cancellation_reason' => null,
                    'cancelled_at' => null
                ]);

                return response()->json([
                    'message' => 'Registration re-activated successfully',
                    'registration_id' => $cancelledRegistration->id
                ]);
            }

            // 6. Check if user can register (penalty/ban check) - with better logging
            if (method_exists($user, 'canRegisterForEvents')) {
                if (!$user->canRegisterForEvents()) {
                    Log::warning('User cannot register due to penalties/ban', [
                        'user_id' => $user->id,
                        'penalties' => $user->penalties ?? 'N/A',
                        'banned_until' => $user->banned_until ?? 'N/A'
                    ]);
                    
                    if ($user->isBanned()) {
                        return response()->json([
                            'message' => 'You are temporarily banned from event registration due to penalties',
                            'banned_until' => $user->banned_until->format('M d, Y'),
                            'penalties' => $user->penalties,
                            'days_remaining' => $user->getRemainingBanDays()
                        ], 403);
                    } else {
                        return response()->json([
                            'message' => 'You cannot register for events due to multiple penalties',
                            'penalties' => $user->penalties,
                            'penalty_expires_at' => $user->penalty_expires_at
                        ], 403);
                    }
                }
            }

            // 7. Create new registration
            $registration = Registration::create([
                'event_id' => (int)$id,
                'user_id' => $user->id,
                'name' => $request->name,
                'email' => $request->email,
                'attendance' => 'pending',
                'status' => 'registered',
                'registered_at' => now()
            ]);

            Log::info('Registration created successfully', [
                'registration_id' => $registration->id,
                'user_id' => $user->id,
                'event_id' => $event->id
            ]);

            // 8. Return success with the updated event data
            $updatedEvent = Event::with(['registrations' => function($query) {
                $query->where('status', 'registered');
            }])->find($event->id);

            return response()->json([
                'message' => 'User registered successfully',
                'registration_id' => $registration->id,
                'event' => $updatedEvent
            ]);

        } catch (\Exception $e) {
            Log::error('Registration error', [
                'event_id' => $id,
                'email' => $request->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }
   
    public function unregister($id, Request $request)
{
    try {
        Log::info('Unregistration attempt', [
            'event_id' => $id,
            'email' => $request->email,
            'cancellation_reason' => $request->cancellation_reason
        ]);

        $registration = Registration::where('event_id', (int)$id)
            ->where('email', $request->email)
            ->where('status', 'registered')
            ->first();

        if (!$registration) {
            Log::warning('Active registration not found for unregister', [
                'event_id' => $id,
                'email' => $request->email
            ]);
            return response()->json(['message' => 'Registration not found'], 404);
        }

        // Mark as cancelled
        $registration->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->cancellation_reason,
            'cancelled_at' => now()
        ]);

        Log::info('Registration cancelled successfully', [
            'registration_id' => $registration->id
        ]);

        // Return the updated event
        $updatedEvent = Event::with(['registrations' => function($query) {
            $query->where('status', 'registered');
        }])->find((int)$id);

        return response()->json([
            'message' => 'Registration cancelled successfully',
            'event' => $updatedEvent
        ]);

    } catch (\Exception $e) {
        Log::error('Unregistration error', [
            'event_id' => $id,
            'email' => $request->email,
            'error' => $e->getMessage()
        ]);

        return response()->json([
            'message' => 'Cancellation failed: ' . $e->getMessage()
        ], 500);
    }
}
    /**
     * Update attendance (THIS IS WHERE AUTOMATIC PENALTIES HAPPEN)
     */
    public function updateAttendance(Request $request, $id)
    {
        // 1. Find the registration
        $registration = Registration::with('user')
            ->where('id', $id)
            ->where('status', 'registered')
            ->first();
        
        if (!$registration) {
            return response()->json(['message' => 'Registration not found'], 404);
        }

        $previousAttendance = $registration->attendance;
        
        // 2. Update attendance
        $registration->attendance = $request->attendance;
        $registration->attendance_marked_at = now();
        $registration->save();

        $response = [
            'message' => 'Attendance updated successfully',
            'attendance' => $request->attendance
        ];

        // 3. AUTOMATIC PENALTY: If marked as absent, add penalty
        if ($request->attendance === 'absent' && $previousAttendance !== 'absent') {
            $user = $registration->user;
            
            if ($user) {
                $user->addPenalty();

                $response['penalty_added'] = true;
                $response['penalties'] = $user->penalties;
                $response['message'] = "Attendance marked as absent and 1 penalty added. User now has {$user->penalties} penalties.";
                
                if ($user->penalties >= 3) {
                    $response['message'] .= " User is now banned from event registration.";
                    $response['banned_until'] = $user->banned_until;
                }
            }
        }

        // 4. AUTOMATIC PENALTY REMOVAL: If changing from absent to present, remove penalty
        if ($request->attendance === 'present' && $previousAttendance === 'absent') {
            $user = $registration->user;
            
            if ($user && $user->penalties > 0) {
                $user->removePenalty();

                $response['penalty_removed'] = true;
                $response['penalties'] = $user->penalties;
                $response['message'] = "Attendance marked as present and 1 penalty removed. User now has {$user->penalties} penalties.";
            }
        }

        return response()->json($response);
    }

    /**
     * Get registrations for an event
     */
    public function getRegistrations($id)
    {
        $registrations = Registration::with('user')
            ->where('event_id', $id)
            ->where('status', 'registered')
            ->get();
            
        return response()->json($registrations);
    }
}