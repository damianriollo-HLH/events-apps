<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
{
    // 1. Verificamos si el usuario está autenticado y si es administrador
    // Usamos el campo 'is_admin' que ya tienes en tu migración
    if ($request->user() && $request->user()->is_admin) {
        return $next($request); // Tiene permiso, adelante
    }

    // 2. Si no es admin, lanzamos un 403 (Prohibido)
    return response()->json([
        'message' => 'Acceso denegado. Se requieren privilegios de administrador.'
    ], 403);
}
}
