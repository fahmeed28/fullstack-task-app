<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken; // upar imports ke sath add karo

class AuthController extends Controller
{
    // REGISTER USER
    public function register(Request $request)
    {
        // VALIDATION
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        // USER CREATE
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // TOKEN GENERATE
        $token = $user->createToken('auth_token')->plainTextToken;

        // RESPONSE
        return response()->json([
            'message' => 'User registered successfully',
            'token' => $token,
            'user' => $user
        ]);
    }

// Login System   

    public function login(Request $request)
{
    // VALIDATION
    $request->validate([
        'email' => 'required|email',
        'password' => 'required|min:6'
    ]);

    // USER FIND
    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json([
            'message' => 'User not found'
        ], 404);
    }

    // PASSWORD CHECK
    if (!Hash::check($request->password, $user->password)) {
        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    // NEW TOKEN GENERATE
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Login successful',
        'token' => $token,
        'user' => $user
    ]);
}



// ... LogOut Api

public function logout(Request $request)
{
    $token = $request->bearerToken();

    if ($token) {
        $accessToken = PersonalAccessToken::findToken($token);

        if ($accessToken) {
            $accessToken->delete();   // yahi DB se row hata raha hai
        }
    }

    return response()->json([
        'message' => 'Logout successful'
    ]);
}



}
