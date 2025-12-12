<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user() || $request->user()->is_admin != 1) {
            return response()->json(['message' => 'Admin access only'], 403);
        }

        return $next($request);
    }
}
