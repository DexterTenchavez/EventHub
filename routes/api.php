<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);


Route::get('/events', [EventController::class, 'index']);
Route::post('/events', [EventController::class, 'store']);
Route::put('/events/{id}', [EventController::class, 'update']);
Route::delete('/events/{id}', [EventController::class, 'destroy']);


Route::put('/registrations/{id}', [RegistrationController::class, 'update']);
Route::post('/events/{id}/register', [RegistrationController::class, 'register']);
Route::post('/events/{id}/unregister', [RegistrationController::class, 'unregister']);
Route::get('/events/{id}/registrations', [RegistrationController::class, 'getRegistrations']);
Route::put('/registrations/{id}/attendance', [RegistrationController::class, 'updateAttendance']);


Route::get('/users', [UserController::class, 'index']);
Route::post('/users/{id}/penalty', [UserController::class, 'addPenalty']);
Route::post('/users/{id}/penalty/decrease', [UserController::class, 'decreasePenalty']);



Route::post('/events/send-notifications', [EventController::class, 'sendEventNotifications']);
Route::post('/events/{id}/send-reminder', [EventController::class, 'sendEventReminder']);
Route::get('/events/{id}', [EventController::class, 'show']);



Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
     Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
});