<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Event;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    // POST /api/events/{id}/comments
    public function store(Request $request, $id)
    {
        // 1. Validar que el evento existe
        $event = Event::findOrFail($id);

        // 2. Validar el contenido
        $request->validate([
            'content' => 'required|string|max:500',
        ]);

        // 3. Crear el comentario vinculado al usuario y al evento
        $comment = Comment::create([
            'content' => $request->content,
            'user_id' => $request->user()->id, // El usuario logueado
            'event_id' => $event->id,
        ]);

        // Devolvemos el comentario con los datos del usuario (para mostrar nombre y avatar al instante)
        return response()->json($comment->load('user'), 201);
    }

    // DELETE /api/comments/{id}
    public function destroy(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);

        // Seguridad: Solo borrar si eres el dueño O eres Admin
        $isOwner = $comment->user_id === $request->user()->id;
        $isAdmin = $request->user()->role === 'admin';

        if (!$isOwner && !$isAdmin) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comentario eliminado']);
    }
}