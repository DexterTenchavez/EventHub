<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\FeedbackController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);

// Public feedback routes (anyone can view event feedback)
Route::get('/events/{eventId}/feedback', [FeedbackController::class, 'getEventFeedback']);

Route::middleware('auth:sanctum')->get('/debug-auth', function (Request $request) {
    $user = $request->user();
    return response()->json([
        'user_id' => $user->id,
        'email' => $user->email,
        'role' => $user->role,
        'is_admin' => $user->role === 'admin',
        'penalties' => $user->penalties,
        'can_access_users' => $user->role === 'admin'
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    // Event management routes
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    
    // Event registration routes
    Route::post('/events/{id}/register', [RegistrationController::class, 'register']);
    Route::post('/events/{id}/unregister', [RegistrationController::class, 'unregister']);
    Route::get('/events/{id}/registrations', [RegistrationController::class, 'getRegistrations']);
    Route::put('/registrations/{id}/attendance', [RegistrationController::class, 'updateAttendance']);
    
    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/notifications/create-event', [NotificationController::class, 'createEventNotification']);
    
    // Event notification routes
    Route::post('/events/send-notifications', [EventController::class, 'sendEventNotifications']);
    Route::post('/events/{id}/send-reminder', [EventController::class, 'sendEventReminder']);
    Route::post('/events/check-notifications', [EventController::class, 'checkEventNotifications']);
    
    // FEEDBACK ROUTES (Protected - require authentication)
    Route::post('/events/{eventId}/feedback', [FeedbackController::class, 'store']);
    Route::get('/users/{userId}/feedback', [FeedbackController::class, 'getUserFeedback']);
    
    // Admin-only feedback routes (admin check handled in controller)
    Route::get('/feedback', [FeedbackController::class, 'getAllFeedback']);
    Route::delete('/feedback/{id}', [FeedbackController::class, 'destroy']);
    
    Route::post('/logout', [AuthController::class, 'logout']);
});

// ADMIN-ONLY ROUTES - MOVE USER ROUTES HERE
Route::middleware(['auth:sanctum'])->group(function () {
    // User management routes - WILL CHECK ADMIN IN CONTROLLER
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users/{id}/penalty', [UserController::class, 'addPenalty']);
    Route::post('/users/{id}/penalty/decrease', [UserController::class, 'decreasePenalty']);
    Route::get('/users/{id}/details', [UserController::class, 'getUserDetails']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    $user = $request->user();
    
    $registeredEvents = $user->registrations()->where('status', 'registered')->count();
    $attendedEvents = $user->registrations()->where('attendance', 'present')->count();
    $missedEvents = $user->registrations()->where('attendance', 'absent')->count();
    $upcomingEvents = $user->registrations()
        ->where('status', 'registered')
        ->whereHas('event', function($query) {
            $query->where('date', '>=', now());
        })
        ->count();
    
    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'penalties' => $user->penalties,
        'banned_until' => $user->banned_until,
        'penalty_expires_at' => $user->penalty_expires_at,
        'registered_events' => $registeredEvents,
        'attended_events' => $attendedEvents,
        'missed_events' => $missedEvents,
        'upcoming_events' => $upcomingEvents,
    ]);
});