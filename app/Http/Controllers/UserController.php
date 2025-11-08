<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function index()
    {
        try {
            Log::info('UserController@index called', [
                'auth_user' => Auth::user() ? Auth::user()->email : 'No user',
                'auth_user_role' => Auth::user() ? Auth::user()->role : 'No role'
            ]);

            $user = Auth::user();
            
            if (!$user) {
                Log::warning('No authenticated user');
                return response()->json(['message' => 'Authentication required'], 401);
            }
            
            if ($user->role !== 'admin') {
                Log::warning('Non-admin access attempt', [
                    'user_role' => $user->role,
                    'required_role' => 'admin'
                ]);
                return response()->json([
                    'message' => 'Admin access required',
                    'your_role' => $user->role
                ], 403);
            }

            // Get users with proper field mapping
            $users = User::with(['registrations.event'])
                ->where('role', 'user')
                ->get()
                ->map(function ($user) {
                    // This will automatically check and reset expired penalties
                    $user->checkAndResetPenalties();
                    
                    // Ensure the user has the expected fields
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'barangay' => $user->barangay ?? 'Not specified', // Use actual column name
                        'purok' => $user->purok ?? 'Not specified', // Use actual column name
                        'penalties' => $user->penalties ?? 0,
                        'banned_until' => $user->banned_until,
                        'penalty_expires_at' => $user->penalty_expires_at,
                        'role' => $user->role,
                        'registrations' => $user->registrations ?? [],
                        'presentCount' => $user->registrations->where('attendance', 'present')->count() ?? 0,
                        'absentCount' => $user->registrations->where('attendance', 'absent')->count() ?? 0,
                        'pendingCount' => $user->registrations->where('attendance', 'pending')->count() ?? 0,
                    ];
                });
                
            Log::info('Users retrieved successfully', ['count' => $users->count()]);
            
            return response()->json($users);

        } catch (\Exception $e) {
            Log::error('Error in UserController@index: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to retrieve users: ' . $e->getMessage()
            ], 500);
        }
    }

    public function addPenalty($id)
    {
        try {
            $authUser = Auth::user();
            
            if (!$authUser || $authUser->role !== 'admin') {
                return response()->json([
                    'message' => 'Admin access required',
                    'your_role' => $authUser ? $authUser->role : 'none'
                ], 403);
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

        } catch (\Exception $e) {
            Log::error('Error adding penalty: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to add penalty: ' . $e->getMessage()
            ], 500);
        }
    }

    public function decreasePenalty($id)
    {
        try {
            $authUser = Auth::user();
            if (!$authUser || $authUser->role !== 'admin') {
                return response()->json([
                    'message' => 'Admin access required',
                    'your_role' => $authUser ? $authUser->role : 'none'
                ], 403);
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

        } catch (\Exception $e) {
            Log::error('Error decreasing penalty: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to remove penalty: ' . $e->getMessage()
            ], 500);
        }
    }
}