<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    // GET /api/events (Público)
    public function index()
    {
        $events = Event::with(['category', 'user'])
            ->where('status', 'published')
            ->orderBy('avg_rating', 'desc')
            ->orderBy('start_at', 'asc')
            ->get();

        return response()->json($events);
    }

    // POST /api/events (Privado)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date',
            'price' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
        ]);

        $event = $request->user()->events()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_at' => $validated['date'],
            'end_at' => $validated['date'],
            'price' => $validated['price'],
            'category_id' => $validated['category_id'],
            'status' => 'published'
        ]);

        return response()->json($event, 201);
    }

    // GET /api/events/{id} (Público)
    public function show($id)
    {
        $event = Event::with(['category', 'user', 'enrollments', 'comments.user'])
        ->withAvg('ratings', 'stars') // 'withAvg' nos calcula automáticamente el promedio de la columna 'stars'
        ->findOrFail($id);   
        // Comprobamos si el usuario actual ha votado
        // Usamos 'sanctum' para ver si quien pide el evento está logueado
        $user = request()->user('sanctum');
        $userRating = 0;
        $isEnrolled = false;

        if ($user) {
            // Buscamos si existe un voto de este usuario para este evento
            $existingRating = $event->ratings()->where('user_id', $user->id)->first();
            if ($existingRating) {
                $userRating = $existingRating->stars;
            }
            //buscamos si está inscripto
            $isEnrolled = $event->enrollments()->where('user_id', $user->id)->exists();
        }

        //Añadimos ese dato "extra" al JSON de respuesta
        $event->user_rating = $userRating;
        $event->is_enrolled = $isEnrolled;

        return response()->json($event);
    }

    // PUT /api/events/{id} (Privado - NUEVO)
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        // --- LÓGICA DE ROLES ---
        $isOwner = $event->user_id === $request->user()->id;
        $isAdmin = $request->user()->role === 'admin';

        // Si NO es dueño Y TAMPOCO es admin -> Bloqueado
        if (!$isOwner && !$isAdmin) {
            return response()->json(['message' => 'No tienes permiso para editar este evento'], 403);
        }

        // Validamos datos (nullable para que no sea obligatorio enviar todo)
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'date' => 'nullable|date',
            'price' => 'nullable|numeric',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        // Actualizamos solo lo que venga en la petición
        $event->update([
            'title' => $validated['title'] ?? $event->title,
            'description' => $validated['description'] ?? $event->description,
            'start_at' => $validated['date'] ?? $event->start_at,
            'end_at' => $validated['date'] ?? $event->end_at, // Mantenemos la lógica de fecha
            'price' => $validated['price'] ?? $event->price,
            'category_id' => $validated['category_id'] ?? $event->category_id,
        ]);

        return response()->json(['message' => 'Evento actualizado', 'event' => $event]);
    }

    // DELETE /api/events/{id} (Privado - NUEVO)
    public function destroy(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        // --- LÓGICA DE ROLES ---
        $isOwner = $event->user_id === $request->user()->id;
        $isAdmin = $request->user()->role === 'admin';

        if (!$isOwner && !$isAdmin) {
            return response()->json(['message' => 'No tienes permiso para eliminar este evento'], 403);
        }
        // -----------------------------
        $event->delete();

        return response()->json(['message' => 'Evento eliminado correctamente']);
    }
}