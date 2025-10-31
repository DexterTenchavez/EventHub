<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Admin access required'], 403);
        }

        $users = User::with(['registrations.event'])
            ->where('role', 'user')
            ->get()
            ->map(function ($user) {
                // This will automatically check and reset expired penalties
                $user->checkAndResetPenalties();
                
                return $user;
            });
            
        return response()->json($users);
    }

    public function addPenalty($id)
    {
        $authUser = Auth::user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['message' => 'Admin access required'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->addPenalty();

        return response()->json([
            'message' => 'Penalty added successfully', 
            'penalties' => $user->penalties,
            'banned_until' => $user->banned_until
        ]);
    }

    public function decreasePenalty($id)
    {
        $authUser = Auth::user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['message' => 'Admin access required'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->removePenalty();

        return response()->json([
            'message' => 'Penalty removed successfully',
            'penalties' => $user->penalties
        ]);
    }
}