<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Event;
use Illuminate\Http\Request;

/**
 * =========================================================================
 * COMMENT CONTROLLER (Controlador de Comentarios)
 * =========================================================================
 * ¿Para qué sirve?: Gestiona la sección de "Conversación" de los eventos.
 * Permite a los usuarios interactuar publicando y borrando sus mensajes.
 * * Relación con la Web (React):
 * - Se comunica directamente con el componente 'EventDetail.jsx'.
 * - Cuando el usuario rellena el textarea y pulsa "Publicar", React llama a store().
 * - Cuando el usuario pulsa la "X" roja en su propio comentario, React llama a destroy().
 */
class CommentController extends Controller
{
    /**
     * ---------------------------------------------------------------------
     * CREAR UN COMENTARIO (Método: store)
     * ---------------------------------------------------------------------
     * Ruta: POST /api/events/{id}/comments
     * ¿Qué hace?: Recibe el texto desde React, comprueba a qué evento pertenece,
     * identifica quién lo envía gracias al Token, y lo guarda en la base de datos.
     */
    public function store(Request $request, $id)
    {
        // 1. Validar que el evento existe: Si alguien intenta comentar en el evento 
        // ID 999 y no existe, findOrFail detiene la ejecución y devuelve un error 404.
        $event = Event::findOrFail($id);

        // 2. Validar el contenido: Aseguramos que no nos envíen comentarios vacíos 
        // o textos infinitos que rompan la base de datos (máximo 500 caracteres).
        $request->validate([
            'content' => 'required|string|max:500',
        ]);

        // 3. Crear el comentario vinculado al usuario y al evento
        $comment = Comment::create([
            'content' => $request->content,
            // SEGURIDAD: No confiamos en un 'user_id' enviado por el formulario de React.
            // Sacamos la ID directamente del token de Sanctum ($request->user()->id).
            // Así es imposible que un usuario falsifique la ID para comentar en nombre de otro.
            'user_id' => $request->user()->id, 
            'event_id' => $event->id,
        ]);

        // 4. Devolver respuesta a React.
        // TRUCO TÉCNICO: Usamos ->load('user') para hacer un "Lazy Eager Loading".
        // Esto le dice a Laravel: "Antes de enviar el JSON, búscame los datos del usuario 
        // que acaba de comentar y mételos dentro". 
        // Así React recibe al instante el nombre y puede pintar el avatar sin tener que recargar la página.
        return response()->json($comment->load('user'), 201);
    }

    /**
     * ---------------------------------------------------------------------
     * BORRAR UN COMENTARIO (Método: destroy)
     * ---------------------------------------------------------------------
     * Ruta: DELETE /api/comments/{id}
     * ¿Qué hace?: Elimina un comentario de la base de datos, pero asegurándose
     * primero de que la persona que intenta borrarlo tiene permiso para hacerlo.
     */
    public function destroy(Request $request, $id)
    {
        // Buscamos el comentario en la base de datos
        $comment = Comment::findOrFail($id);

        // ---------------------------------------------------------
        // CAPA DE SEGURIDAD Y AUTORIZACIÓN
        // ---------------------------------------------------------
        // Verificamos si el usuario logueado (el que hace la petición) es el 
        // dueño legítimo del comentario.
        $isOwner = $comment->user_id === $request->user()->id;
        
        // También comprobamos si el usuario es un Administrador (moderador).
        $isAdmin = $request->user()->role === 'admin';

        // Si NO es el dueño Y TAMPOCO es administrador... ¡Bloqueamos el acceso!
        if (!$isOwner && !$isAdmin) {
            // Devolvemos el código HTTP 403 (Forbidden / Prohibido)
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        // Si pasa la validación de seguridad, procedemos a borrarlo
        $comment->delete();

        // Le avisamos a React que todo ha ido bien para que quite el comentario de la pantalla
        return response()->json(['message' => 'Comentario eliminado']);
    }
}