<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    // Toggle Like (Dar o Quitar Like)
    public function toggle(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $user = $request->user();

        // El método toggle() de Laravel hace la magia: si existe lo quita, si no existe lo pone.
        $changes = $event->likes()->toggle($user->id);

        $liked = count($changes['attached']) > 0;

        return response()->json([
            'message' => $liked ? 'Like añadido' : 'Like eliminado',
            'liked' => $liked,
            'likes_count' => $event->likes()->count()
        ]);
    }
}