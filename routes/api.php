<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\RegistrationController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


Route::get('/events', [EventController::class, 'index']);
Route::post('/events', [EventController::class, 'store']);
Route::put('/events/{id}', [EventController::class, 'update']);
Route::delete('/events/{id}', [EventController::class, 'destroy']);


Route::post('/events/{id}/register', [RegistrationController::class, 'register']);
Route::post('/events/{id}/unregister', [RegistrationController::class, 'unregister']);
Route::get('/events/{id}/registrations', [RegistrationController::class, 'getRegistrations']);
Route::put('/registrations/{id}/attendance', [RegistrationController::class, 'updateAttendance']);
