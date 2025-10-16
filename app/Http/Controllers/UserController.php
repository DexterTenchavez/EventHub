<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        // Include user with registration count
        $users = User::withCount('registrations')->get();
        return response()->json($users);
    }

    public function addPenalty($id)
    {
        $user = User::findOrFail($id);
        $user->penalties += 1;
        $user->save();

        return response()->json(['message' => 'Penalty added successfully', 'penalties' => $user->penalties]);
    }
    public function decreasePenalty($id)
{
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

}

