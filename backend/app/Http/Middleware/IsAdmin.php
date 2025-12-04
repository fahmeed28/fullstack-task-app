<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();   // current login user (token se)

        if (! $user || ! $user->is_admin) {
            return response()->json([
                'message' => 'Access denied. Admin only.'
            ], 403);
        }

        return $next($request);
    }
}
