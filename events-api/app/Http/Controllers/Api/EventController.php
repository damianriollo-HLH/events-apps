<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    // GET /api/events (Público - Ver lista)
    public function index()
    {
        // Traemos eventos con su categoría y creador para mostrarlos bonitos
        $events = Event::with(['category', 'user'])
            ->where('status', 'published')     // Solo los publicados
            ->orderBy('avg_rating', 'desc')    // Primero los mejor valorados
            ->orderBy('start_at', 'asc')       // Luego los más próximos
            ->get();

        return response()->json($events);
    }

    // POST /api/events (Privado - Crear Evento)
    public function store(Request $request)
    {
        // 1. Validamos los datos que vienen del formulario
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date',
            'price' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
            'capacity' => 'nullable|integer|min:1' // <--- NUEVO: Aceptamos aforo (opcional)
        ]);

        // 2. Creamos el evento asociado al usuario logueado
        // Usamos el operador '??' para decir: "Si no envían capacidad, pon 50 por defecto"
        $event = $request->user()->events()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_at' => $validated['date'],
            'end_at' => $validated['date'],
            'price' => $validated['price'],
            'category_id' => $validated['category_id'],
            'capacity' => $validated['capacity'] ?? 50, // <--- SOLUCIÓN AL BUG "EVENTO LLENO"
            'status' => 'published'
        ]);

        return response()->json($event, 201);
    }

    // GET /api/events/{id} (Público - Ver Detalle)
    public function show($id)
    {
        // 1. Buscamos el evento
        $event = Event::with(['category', 'user', 'enrollments', 'comments.user'])
            ->withAvg('ratings', 'stars')
            ->findOrFail($id);
            
        // 2. Valores iniciales
        $user = request()->user('sanctum');
        $userRating = 0;
        $isEnrolled = false;
        $canEdit = false; // <--- NUEVO: Por defecto nadie puede editar

        if ($user) {
            // A. Valoración
            $existingRating = $event->ratings()->where('user_id', $user->id)->first();
            if ($existingRating) $userRating = $existingRating->stars;
            
            // B. Inscripción
            $isEnrolled = $event->enrollments()->where('user_id', $user->id)->exists();

            // C. PERMISOS (Aquí está la magia)
            // Puede editar si: Es el dueño (user_id coinciden) O es admin
            if ($user->id === $event->user_id || $user->role === 'admin') {
                $canEdit = true;
            }
        }

        // 3. Añadimos datos extra al JSON
        $event->user_rating = $userRating;
        $event->is_enrolled = $isEnrolled;
        $event->can_edit = $canEdit; // <--- Enviamos el permiso al Frontend

        return response()->json($event);
    }

    // PUT /api/events/{id} (Privado - Editar Evento)
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        // --- SEGURIDAD: Solo el dueño o el admin pueden editar ---
        $isOwner = $event->user_id === $request->user()->id;
        $isAdmin = $request->user()->role === 'admin';

        if (!$isOwner && !$isAdmin) {
            return response()->json(['message' => 'No tienes permiso para editar este evento'], 403);
        }

        // Validamos (nullable significa que no es obligatorio enviar el dato si no ha cambiado)
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'date' => 'nullable|date',
            'price' => 'nullable|numeric',
            'category_id' => 'nullable|exists:categories,id',
            'capacity' => 'nullable|integer|min:1' // <--- NUEVO: Permitir editar aforo
        ]);

        // Actualizamos solo lo que venga en la petición
        $event->update([
            'title' => $validated['title'] ?? $event->title,
            'description' => $validated['description'] ?? $event->description,
            'start_at' => $validated['date'] ?? $event->start_at,
            'end_at' => $validated['date'] ?? $event->end_at,
            'price' => $validated['price'] ?? $event->price,
            'category_id' => $validated['category_id'] ?? $event->category_id,
            'capacity' => $validated['capacity'] ?? $event->capacity, // <--- NUEVO
        ]);

        return response()->json(['message' => 'Evento actualizado', 'event' => $event]);
    }

    // DELETE /api/events/{id} (Privado - Borrar Evento)
    public function destroy(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        
        // --- SEGURIDAD ---
        $isOwner = $event->user_id === $request->user()->id;
        $isAdmin = $request->user()->role === 'admin';

        if (!$isOwner && !$isAdmin) {
            return response()->json(['message' => 'No tienes permiso para eliminar este evento'], 403);
        }
        
        // Borramos el evento (y sus comentarios/inscripciones por cascada)
        $event->delete();

        return response()->json(['message' => 'Evento eliminado correctamente']);
    }

    // GET /api/my-events (Privado - Mis Entradas)
    public function myEvents()
    {
        $user = auth('sanctum')->user();

        // TRADUCCIÓN: "Dame los eventos DONDE TENGA (whereHas) inscripciones de ESTE usuario"
        $events = Event::whereHas('enrollments', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with(['category', 'user']) // Traemos datos extra para la tarjeta
        ->get();

        return response()->json($events);
    }
}