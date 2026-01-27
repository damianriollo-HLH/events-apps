<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Rating;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    // POST /api/events/{id}/rate
    public function store(Request $request, $id)
    {
        // 1. Validar que la nota sea un número del 1 al 5
        $request->validate([
            'stars' => 'required|integer|min:1|max:5',
        ]);

        // 2. Buscar el evento
        $event = Event::findOrFail($id);

        // 3. Guardar o Actualizar el voto
        // "Busca un voto de ESTE usuario en ESTE evento. Si existe, actualiza 'stars'. Si no, créalo."
        $rating = Rating::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'event_id' => $event->id
            ],
            [
                'stars' => $request->stars
            ]
        );

        return response()->json([
            'message' => 'Valoración guardada',
            'rating' => $rating
        ]);
    }
}