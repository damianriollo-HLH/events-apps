<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    /**
     * Guarda o actualiza la valoración (estrellas) de un usuario para un evento.
     * * @param Request $request
     * @param int $id ID del Evento
     */
    public function store(Request $request, $id)
    {
        // Validamos que envíen entre 1 y 5 estrellas
        $request->validate([
            'stars' => 'required|integer|min:1|max:5'
        ]);

        $event = Event::findOrFail($id);
        $user = $request->user();

        /**
         * LÓGICA DE NEGOCIO: Evitar votos duplicados.
         * updateOrCreate busca un registro que coincida con el primer array (user_id).
         * Si lo encuentra, actualiza las 'stars'. Si no, crea un nuevo registro.
         */
        $rating = $event->ratings()->updateOrCreate(
            ['user_id' => $user->id],
            ['stars' => $request->stars]
        );

        // Calculamos la nueva media para devolvérsela a React inmediatamente
        $newAverage = $event->ratings()->avg('stars');

        return response()->json([
            'message' => '¡Gracias por tu valoración!',
            'user_rating' => $rating->stars,
            'new_average' => round($newAverage, 1) // Redondeamos a 1 decimal (ej: 4.5)
        ]);
    }
}