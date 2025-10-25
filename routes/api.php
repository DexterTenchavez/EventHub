<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);



Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);


Route::middleware('auth:sanctum')->group(function () {
 
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    

    Route::post('/events/{id}/register', [RegistrationController::class, 'register']);
    Route::post('/events/{id}/unregister', [RegistrationController::class, 'unregister']);
    Route::get('/events/{id}/registrations', [RegistrationController::class, 'getRegistrations']);
    Route::put('/registrations/{id}/attendance', [RegistrationController::class, 'updateAttendance']);
    

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users/{id}/penalty', [UserController::class, 'addPenalty']);
    Route::post('/users/{id}/penalty/decrease', [UserController::class, 'decreasePenalty']);
    

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/notifications/create-event', [NotificationController::class, 'createEventNotification']);

    

    Route::post('/events/send-notifications', [EventController::class, 'sendEventNotifications']);
    Route::post('/events/{id}/send-reminder', [EventController::class, 'sendEventReminder']);
    Route::post('/events/check-notifications', [EventController::class, 'checkEventNotifications']);
    

    Route::post('/logout', [AuthController::class, 'logout']);
});