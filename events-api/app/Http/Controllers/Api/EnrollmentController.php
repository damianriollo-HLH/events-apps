<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Enrollment;
use Illuminate\Http\Request;

/**
 * =========================================================================
 * ENROLLMENT CONTROLLER (Controlador de Inscripciones)
 * =========================================================================
 * ¿Para qué sirve?: Gestiona la asistencia a los eventos. Interactúa con la 
 * tabla 'enrollments', que es la tabla pivote (N:M) que une a Users con Events.
 * * Relación con la Web (React):
 * - Se activa cuando el usuario pulsa el botón "📅 Me Apunto" en EventDetail.
 * - Se activa cuando el usuario pulsa "❌ Ya no puedo asistir" en el modal de confirmación.
 */
class EnrollmentController extends Controller
{
    /**
     * ---------------------------------------------------------------------
     * INSCRIBIRSE A UN EVENTO (Método: store)
     * ---------------------------------------------------------------------
     * Ruta: POST /api/events/{id}/enroll
     * ¿Qué hace?: Procesa la solicitud de asistencia de un usuario a un evento.
     * Antes de apuntarlo, realiza validaciones críticas de negocio (duplicados y aforo).
     */
    public function store(Request $request, $id)
    {
        // Buscamos el evento al que el usuario quiere apuntarse
        $event = Event::findOrFail($id);

        // Obtenemos de forma segura el usuario logueado mediante el Token de Sanctum
        $user = $request->user();

        // ---------------------------------------------------------
        // 1. REGLA DE NEGOCIO: Evitar inscripciones duplicadas
        // ---------------------------------------------------------
        // Buscamos si ya existe una fila en la tabla enrollments para este usuario y este evento
        $existing = Enrollment::where('event_id', $event->id)
                              ->where('user_id', $user->id)
                              ->first();

        // Si ya está apuntado, detenemos el proceso y avisamos a React (HTTP 409 Conflict)
        if ($existing) {
            return response()->json(['message' => 'Ya estás inscrito en este evento'], 409);
        }

        // ---------------------------------------------------------
        // 2. REGLA DE NEGOCIO: Control de Aforo Máximo
        // ---------------------------------------------------------
        // Contamos cuántas inscripciones reales tiene el evento y las comparamos 
        // con la capacidad (capacity) definida por el organizador.
        if ($event->enrollments()->count() >= $event->capacity) {
            // Si está lleno, devolvemos un HTTP 400 (Bad Request)
            return response()->json(['message' => 'El evento está lleno'], 400);
        }

        // ---------------------------------------------------------
        // 3. Crear inscripción
        // ---------------------------------------------------------
        // Si superó todas las pruebas, guardamos la inscripción en la base de datos
        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            // Estado por defecto. En un futuro, si hay pasarela de pago (Stripe), 
            // aquí se pondría 'pending' hasta que el pago se confirme.
            'status' => 'confirmed' 
        ]);

        return response()->json(['message' => 'Inscripción exitosa', 'enrollment' => $enrollment], 201);
    }

    /**
     * ---------------------------------------------------------------------
     * CANCELAR INSCRIPCIÓN / DESAPUNTARSE (Método: destroy)
     * ---------------------------------------------------------------------
     * Ruta: DELETE /api/events/{id}/enroll
     * ¿Qué hace?: Permite a un usuario liberar su plaza.
     */
    public function destroy(Request $request, $id)
    {
        // ---------------------------------------------------------
        // SEGURIDAD: Búsqueda cruzada
        // ---------------------------------------------------------
        // No borramos la inscripción buscando directamente un ID de inscripción.
        // Buscamos la inscripción que coincida EXACTAMENTE con el evento en cuestión
        // Y con el ID del usuario que está haciendo la petición.
        // Así evitamos que el usuario A pueda borrar la inscripción del usuario B.
        $enrollment = Enrollment::where('event_id', $id)
                                ->where('user_id', $request->user()->id)
                                ->firstOrFail();

        // Liberamos la plaza
        $enrollment->delete();

        return response()->json(['message' => 'Inscripción cancelada']);
    }
}