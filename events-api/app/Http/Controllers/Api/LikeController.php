<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

/**
 * =========================================================================
 * LIKE CONTROLLER (Controlador de Favoritos / Me Gusta)
 * =========================================================================
 * ¿Para qué sirve?: Gestiona la acción de "Añadir a Favoritos" de un evento.
 * Trabaja sobre una relación de Muchos a Muchos (N:M) entre Users y Events,
 * gestionada a través de la tabla pivote 'likes'.
 * * Relación con la Web (React):
 * - Se dispara al pulsar el botón con el icono del corazón (❤️ / 🤍) en EventDetail.
 */
class LikeController extends Controller
{
    /**
     * ---------------------------------------------------------------------
     * ALTERNAR FAVORITO (Método: toggle)
     * ---------------------------------------------------------------------
     * Ruta: POST /api/events/{id}/like
     * ¿Qué hace?: Añade el evento a favoritos si no lo estaba, o lo quita si
     * ya estaba en la lista. Todo en una sola acción optimizada.
     */
    public function toggle(Request $request, $id)
    {
        // 1. Buscamos el evento. Si no existe, devuelve Error 404 automáticamente.
        $event = Event::findOrFail($id);
        
        // 2. Extraemos al usuario que está haciendo la petición desde el Token de Sanctum.
        $user = $request->user();

        // ---------------------------------------------------------
        // MAGIA DE ELOQUENT: El método toggle()
        // ---------------------------------------------------------
        // En lugar de hacer un "if/else" para ver si el usuario ya le dio like,
        // usamos toggle(). Laravel va a la tabla pivote 'likes':
        // - Si el user_id ya está vinculado a este event_id -> hace un DETACH (lo borra).
        // - Si no están vinculados -> hace un ATTACH (lo crea).
        // 
        // $res nos devuelve un array informando de qué ha ocurrido exactamente:
        // ['attached' => [1], 'detached' => [], 'updated' => []]
        $res = $event->likes()->toggle($user->id);

        // 3. Comprobamos el resultado para avisar a React
        // Si el array 'attached' dentro de $res tiene algo, significa que la acción 
        // resultante fue añadirlo a favoritos. Si está vacío, fue porque lo borró.
        $isLiked = count($res['attached']) > 0;

        // 4. Devolvemos el estado actualizado a React para que pinte el corazón 
        // rojo o blanco sin tener que recargar la página.
        return response()->json([
            'is_liked' => $isLiked,
            'message' => $isLiked ? 'Añadido a favoritos' : 'Quitado de favoritos'
        ]);
    }
}