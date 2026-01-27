<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    // Inscribirse a un evento
    public function store(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $user = $request->user();

        // 1. Verificar si ya está inscrito
        $existing = Enrollment::where('event_id', $event->id)
                              ->where('user_id', $user->id)
                              ->first();

        if ($existing) {
            return response()->json(['message' => 'Ya estás inscrito en este evento'], 409);
        }

        // 2. Verificar aforo 
        if ($event->enrollments()->count() >= $event->capacity) {
            return response()->json(['message' => 'El evento está lleno'], 400);
        }

        // 3. Crear inscripción
        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'status' => 'confirmed' // O 'pending' si hay pago
        ]);

        return response()->json(['message' => 'Inscripción exitosa', 'enrollment' => $enrollment], 201);
    }

    // Desinscribirse (Cancelar)
    public function destroy(Request $request, $id)
    {
        // Buscamos la inscripción por ID del evento y ID del usuario
        $enrollment = Enrollment::where('event_id', $id)
                                ->where('user_id', $request->user()->id)
                                ->firstOrFail();

        $enrollment->delete();

        return response()->json(['message' => 'Inscripción cancelada']);
    }
}