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

    // ✅ Use Sanctum token instead of session
    $token = $user->createToken('auth-token')->plainTextToken;

    return response()->json([
        'message' => 'Login successful',
        'user' => $user,
        'token' => $token, // Add this line
        'redirect' => $user->role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
    ]);
}


   public function logout(Request $request)
{
    try {
        // Check if user is authenticated via Sanctum token
        if ($request->user()) {
            // Revoke the token that was used to authenticate the current request
            $request->user()->currentAccessToken()->delete();
        }
        
        return response()->json([
            'message' => 'Logged out successfully'
        ]);
        
    } catch (\Exception $e) {
        // Even if there's an error, return success to frontend
        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}



public function forgotPassword(Request $request)
{
    $request->validate(['email' => 'required|email']);

    try {
        // Check if user exists
        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json([
                'message' => 'If this email exists in our system, a password reset link has been sent.'
            ], 200);
        }

        // Set custom reset URL for React app
        \Illuminate\Support\Facades\Password::resetUrl(function ($user, string $token) {
            return 'http://localhost:3000/reset-password?token=' . $token . '&email=' . urlencode($user->email);
        });

        $status = \Illuminate\Support\Facades\Password::sendResetLink(
            $request->only('email')
        );

        \Illuminate\Support\Facades\Log::info('Password reset status: ' . $status);

        if ($status === \Illuminate\Support\Facades\Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Password reset link has been sent to your email.'
            ], 200);
        } else {
            return response()->json([
                'message' => 'Unable to send reset link. Please try again later.',
                'status' => $status
            ], 400);
        }

    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Forgot password error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Server error: ' . $e->getMessage()
        ], 500);
    }
}

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:5|confirmed',
        ]);

        try {
            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function ($user, $password) {
                    $user->forceFill([
                        'password' => Hash::make($password)
                    ])->setRememberToken(Str::random(60));

                    $user->save();

                    event(new PasswordReset($user));
                }
            );

            return $status == Password::PASSWORD_RESET
                ? response()->json(['message' => 'Password reset successfully'], 200)
                : response()->json(['message' => 'Invalid or expired reset token'], 400);

        } catch (\Exception $e) {
            Log::error('Reset password error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error. Please try again later.'
            ], 500);
        }
    }
    
}