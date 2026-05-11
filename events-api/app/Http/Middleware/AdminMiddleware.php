<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * =========================================================================
 * ADMIN MIDDLEWARE (Filtro de Seguridad para Administradores)
 * =========================================================================
 * ¿Para qué sirve?: Es una barrera protectora (guardia de seguridad). 
 * Se coloca delante de las rutas sensibles (como crear categorías o borrar eventos
 * de otras personas) para asegurar que solo los usuarios con el rol adecuado pasen.
 */
class AdminMiddleware
{
    /**
     * Gestiona la petición entrante.
     *
     * @param  \Illuminate\Http\Request  $request (La petición que viene de React)
     * @param  \Closure  $next (La puerta hacia el controlador)
     */
    public function handle(Request $request, Closure $next): Response
    {
        // ---------------------------------------------------------
        // 1. INSPECCIÓN DE SEGURIDAD
        // ---------------------------------------------------------
        // Comprobamos dos cosas a la vez:
        // A. $request->user() -> ¿La persona que envía esto está logueada?
        // B. $request->user()->is_admin -> El campo de la base de datos que marca si es admin.
        if ($request->user() && $request->user()->is_admin) {
            
            // Si cumple las dos reglas, el guardia le abre la puerta.
            // $next($request) significa "puedes continuar tu camino hacia el controlador".
            return $next($request); 
        }

        // ---------------------------------------------------------
        // 2. RECHAZO (ACCESO DENEGADO)
        // ---------------------------------------------------------
        // Si no está logueado, o si lo está pero es un usuario normal (is_admin = 0),
        // el flujo se corta inmediatamente aquí. El controlador jamás llega a enterarse
        // de que esta petición existió. Se devuelve un Error 403 (Forbidden).
        return response()->json([
            'message' => 'Acceso denegado. Se requieren privilegios de administrador.'
        ], 403);
    }
}