<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'contactNo' => 'nullable|string|max:20',
            'sex' => 'nullable|string|max:10',
            'dob' => 'nullable|date',
            'barangay' => 'nullable|string|max:255',
            'purok' => 'nullable|string|max:255',
            'password' => 'required|string|min:5',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'],
            'contactNo' => $validated['contactNo'] ?? null,
            'sex' => $validated['sex'] ?? null,
            'dob' => $validated['dob'] ?? null,
            'barangay' => $validated['barangay'] ?? null,
            'purok' => $validated['purok'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Registration successful!',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
{
    $validated = $request->validate([
        'email' => 'required|string|email',
        'password' => 'required|string',
    ]);

    $user = User::where('email', $validated['email'])->first();

    if (!$user || !Hash::check($validated['password'], $user->password)) {
        return response()->json(['message' => 'Invalid email or password'], 401);
    }

    // Use session-based login instead of tokens
    Auth::login($user);

    $dashboard = $user->role === 'admin' ? '/admin-dashboard' : '/user-dashboard';

    return response()->json([
        'message' => 'Login successful',
        'user' => $user,
        'redirect' => $dashboard
    ]);
}


    public function logout(Request $request)
{
    Auth::logout();
    
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return response()->json(['message' => 'Logged out successfully']);
}
}