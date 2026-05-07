<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggle(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $user = $request->user();

        /**
         * toggle() es magia: 
         * - Si el ID del usuario ya está en la tabla 'likes', lo quita (detach).
         * - Si no está, lo añade (attach).
         */
        $res = $event->likes()->toggle($user->id);

        // Si el array 'attached' tiene elementos, es que se acaba de añadir el like.
        $isLiked = count($res['attached']) > 0;

        return response()->json([
            'is_liked' => $isLiked,
            'message' => $isLiked ? 'Añadido a favoritos' : 'Quitado de favoritos'
        ]);
    }
}