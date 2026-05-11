<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

/**
 * =========================================================================
 * RATING CONTROLLER (Controlador de Valoraciones / Estrellas)
 * =========================================================================
 * ¿Para qué sirve?: Gestiona el sistema de puntuación (de 1 a 5 estrellas) 
 * que los usuarios otorgan a los eventos.
 * * Relación con la Web (React):
 * - Se activa cuando el usuario hace clic en una de las estrellas amarillas 
 * debajo de la información del evento en EventDetail.jsx.
 */
class RatingController extends Controller
{
    /**
     * ---------------------------------------------------------------------
     * GUARDAR O ACTUALIZAR VALORACIÓN (Método: store)
     * ---------------------------------------------------------------------
     * Ruta: POST /api/events/{id}/rate
     * ¿Qué hace?: Recibe la puntuación del usuario. Si es la primera vez que 
     * vota, crea el registro. Si ya había votado antes, actualiza su voto anterior 
     * para evitar valoraciones duplicadas. Finalmente, recalcula la media global.
     * * @param Request $request Contiene las 'stars' enviadas desde React
     * @param int $id ID del Evento
     */
    public function store(Request $request, $id)
    {
        // 1. Validación Estricta: Aseguramos que nadie envíe un -5 o un 10 
        // manipulando la petición en el Frontend. Solo valores enteros del 1 al 5.
        $request->validate([
            'stars' => 'required|integer|min:1|max:5'
        ]);

        // Buscamos el evento. Si no existe, lanzará un Error 404.
        $event = Event::findOrFail($id);
        
        // Identificamos al usuario mediante el token de Sanctum
        $user = $request->user();

        // ---------------------------------------------------------
        // 2. LÓGICA DE NEGOCIO (UPSERT): Evitar votos duplicados
        // ---------------------------------------------------------
        // updateOrCreate() es una función muy potente de Eloquent.
        // Recibe dos arrays:
        // 1º Array (Condición de búsqueda): "Busca si este usuario ya votó en este evento"
        // 2º Array (Datos a guardar): "Si lo encuentras, actualiza sus estrellas. Si no, créalo."
        $rating = $event->ratings()->updateOrCreate(
            ['user_id' => $user->id],
            ['stars' => $request->stars]
        );

        // ---------------------------------------------------------
        // 3. CÁLCULO DE LA MEDIA EN TIEMPO REAL
        // ---------------------------------------------------------
        // En lugar de traer todos los votos a PHP y sumarlos manualmente, 
        // usamos avg('stars'). Esto le dice a MySQL que calcule la media 
        // a nivel de base de datos, lo cual es mil veces más rápido.
        $newAverage = $event->ratings()->avg('stars');

        // 4. Devolvemos la respuesta a React.
        // Al enviar 'new_average' y 'user_rating', permitimos que React actualice
        // los números en pantalla al instante sin tener que recargar toda la página.
        return response()->json([
            'message' => '¡Gracias por tu valoración!',
            'user_rating' => $rating->stars,
            'new_average' => round($newAverage, 1) // Redondeamos a 1 decimal (ej: 4.5)
        ]);
    }
}