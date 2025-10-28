<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class UserController extends Controller
{
    public function index()
    {
        // Check if user is authenticated
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Check if user is admin
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden: Admin access required'], 403);
        }

        // Include user with registration count and event details
        $users = User::with(['registrations.event' => function($query) {
            $query->select('id', 'title', 'date', 'location');
        }])->withCount('registrations')->get();
        
        return response()->json($users);
    }

    public function addPenalty($id)
    {
        // Check if user is authenticated
        $authUser = Auth::user();
        if (!$authUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Check if user is admin
        if ($authUser->role !== 'admin') {
            return response()->json(['message' => 'Forbidden: Admin access required'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->penalties += 1;
        $user->save();

        return response()->json([
            'message' => 'Penalty added successfully', 
            'penalties' => $user->penalties
        ]);
    }

    public function decreasePenalty($id)
    {
        // Check if user is authenticated
        $authUser = Auth::user();
        if (!$authUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Check if user is admin
        if ($authUser->role !== 'admin') {
            return response()->json(['message' => 'Forbidden: Admin access required'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->penalties > 0) {
            $user->penalties -= 1;
            $user->save();
            return response()->json(['message' => 'Penalty decreased successfully']);
        }

        return response()->json(['message' => 'User has no penalties to decrease']);
    }

    public function getUserDetails($id)
    {
        // Check if user is authenticated
        $authUser = Auth::user();
        if (!$authUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Check if user is admin
        if ($authUser->role !== 'admin') {
            return response()->json(['message' => 'Forbidden: Admin access required'], 403);
        }

        $user = User::with(['registrations.event' => function($query) {
            $query->select('id', 'title', 'date', 'location', 'start_time', 'end_time');
        }])->find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }
}