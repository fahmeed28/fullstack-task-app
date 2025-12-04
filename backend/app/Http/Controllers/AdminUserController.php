<?php

namespace App\Http\Controllers;

use App\Models\User;    // 👈 yeh line zaroor add karni hai

class AdminUserController extends Controller
{
    public function index()
    {
        // saare users laa rahe hain
        return response()->json(User::all());
    }
}
