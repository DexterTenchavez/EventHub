<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB; 
use App\Mail\PasswordResetMail;

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
            'role' => 'user', 
            'penalties' => 0, 
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

        Log::info('User login attempt', [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'isAdmin_method' => $user->isAdmin() ? 'YES' : 'NO',
            'is_banned' => $user->isBanned() ? 'YES' : 'NO',
            'penalties' => $user->penalties
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
            'redirect' => $user->isAdmin() ? '/admin-dashboard' : '/user-dashboard'
        ]);
    }

    public function logout(Request $request)
    {
        try {
            if ($request->user()) {
                $request->user()->currentAccessToken()->delete();
            }
            
            return response()->json([
                'message' => 'Logged out successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Logged out successfully'
            ]);
        }
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        try {
            $user = User::where('email', $request->email)->first();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Email address not found in our system.'
                ], 404);
            }

            $token = Str::random(6);
            
            $user->update([
                'reset_token' => $token,
                'reset_token_expires_at' => now()->addHours(1)
            ]);
            
            Mail::to($user->email)->send(new PasswordResetMail($user, $token));

            return response()->json([
                'message' => 'Password reset code has been sent to your email.'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Forgot password error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send email. Please try again.'
            ], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string|size:6',
            'password' => 'required|min:6|confirmed',
        ]);

        try {
            $user = User::where('email', $request->email)
                        ->where('reset_token', $request->token)
                        ->where('reset_token_expires_at', '>', now())
                        ->first();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Invalid reset code or code has expired.'
                ], 400);
            }

            $user->update([
                'password' => Hash::make($request->password),
                'reset_token' => null,
                'reset_token_expires_at' => null
            ]);

            return response()->json([
                'message' => 'Password reset successfully!',
                'success' => true
            ], 200);

        } catch (\Exception $e) {
            Log::error('Reset password error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to reset password. Please try again.'
            ], 500);
        }
    }
}