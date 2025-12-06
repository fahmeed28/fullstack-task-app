<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Task;

class AdminDashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_users'       => User::count(),
            'total_tasks'       => Task::count(),
            'completed_tasks'   => Task::where('status', 'completed')->count(),
            'pending_tasks'     => Task::where('status', 'pending')->count(),
            'new_users_today'   => User::whereDate('created_at', today())->count(),
            'new_tasks_today'   => Task::whereDate('created_at', today())->count(),
        ]);
    }
}
