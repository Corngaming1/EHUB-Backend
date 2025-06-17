<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
   public function handle(Request $request, Closure $next, ...$roles)
{
    $user = $request->user();
    // Allow access to public routes like welcome, login, and register
    if (
        $request->routeIs('welcome') ||
        $request->routeIs('login') ||
        $request->routeIs('register')
    ) {
        return $next($request);
    }

    // If user is not authenticated, redirect to login instead of aborting
    if (! $user) {
        return redirect()->route('login');
    }

    switch ($user->role) {
        case 'admin':
            return $next($request);

        case 'staff':
            if (in_array('staff', $roles)) {
                return $next($request);
            }
            break;

        case 'customer':
            if (in_array('customer', $roles)) {
                return $next($request);
            }
            break;

        default:
            break;
    }

    abort(403, 'Unauthorized');
}
}

        
    
