<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Http\Request;
class AdminUserController extends Controller
{
    // ALL USERS LIST
    public function index()
    {
        return response()->json(
            User::select('id', 'name', 'email', 'is_admin')->get()
        );
    }

    // SINGLE USER + USKE TASKS
    
    public function show($id)
    {
        // user + uske tasks + har task ki category
        $user = User::with(['tasks.category'])->find($id);

        // agar user hi nahi mila
        if (! $user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        // agar mila to data return karo
        return response()->json([
            'user'  => $user,
            'tasks' => $user->tasks,
        ]);
    }

    public function destroy($id)
{
    // jis user ko delete karna hai
    $user = User::find($id);

    // agar user hi nahi mila
    if (! $user) {
        return response()->json([
            'message' => 'User not found'
        ], 404);
    }

    // agar admin khud apne aap ko delete karne ki koshish kare
    if ($user->id === Auth::id()) {
        return response()->json([
            'message' => 'You cannot delete your own account.'
        ], 403);
    }

    // warna delete kar do
    $user->delete();

    return response()->json([
        'message' => 'User deleted successfully by admin.'
    ]);
}

// Updates API

public function update(Request $request, $id)
{
    // 1) User dhoondo
    $user = User::find($id);

    if (! $user) {
        return response()->json([
            'message' => 'User not found'
        ], 404);
    }

    // 2) Validation
    $request->validate([
        'name'     => 'required|string|max:255',
        'email'    => 'required|email|unique:users,email,' . $id,
        'is_admin' => 'required|boolean',
    ]);

    // 3) Update fields
    $user->name     = $request->name;
    $user->email    = $request->email;
    $user->is_admin = $request->is_admin;
    $user->save();

    // 4) Response
    return response()->json([
        'message' => 'User updated successfully by admin.',
        'user'    => $user,
    ]);
}


}
