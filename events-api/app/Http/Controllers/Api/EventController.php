<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    // GET /api/events (Público - Con Buscador Avanzado)
    public function index(Request $request)
    {
        $query = Event::with(['category', 'user'])
            ->where('status', 'published');

        // 1. FILTRO DE TEXTO (Título, Descripción O CIUDAD)
        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                  // IMPORTANTE: Esto fallará si no tienes la columna 'location' en la BD
                  ->orWhere('location', 'LIKE', "%{$searchTerm}%"); 
            });
        }

        // 2. FILTRO POR CATEGORÍA
        if ($request->has('category') && $request->category != 'null') {
            $query->where('category_id', $request->input('category'));
        }

        // 3. FILTRO POR FECHA
        if ($request->has('date')) {
            $dateFilter = $request->input('date');
            $today = now()->format('Y-m-d');

            switch ($dateFilter) {
                case 'today':
                    $query->whereDate('start_at', $today);
                    break;
                case 'tomorrow':
                    $query->whereDate('start_at', now()->addDay()->format('Y-m-d'));
                    break;
                case 'week':
                    $query->whereBetween('start_at', [$today, now()->addDays(7)->format('Y-m-d')]);
                    break;
            }
        }

        // 4. ORDENAMIENTO
        $sort = $request->input('sort', 'newest');
        
        switch ($sort) {
            case 'price_asc': $query->orderBy('price', 'asc'); break;
            case 'price_desc': $query->orderBy('price', 'desc'); break;
            case 'oldest': $query->orderBy('start_at', 'asc'); break;
            case 'newest': default: $query->orderBy('created_at', 'desc'); break;
        }

        return response()->json($query->get());
    }

    // POST /api/events (Privado - Crear Evento)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date',
            'price' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
            'capacity' => 'nullable|integer|min:1',
            'image' => 'nullable|image|max:2048',
            'location' => 'nullable|string|max:255' // <--- Aceptamos ubicación
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $imageUrl = asset('storage/' . $path);
        }

        $event = $request->user()->events()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_at' => $validated['date'],
            'end_at' => $validated['date'],
            'price' => $validated['price'],
            'category_id' => $validated['category_id'],
            'capacity' => $validated['capacity'] ?? 50,
            'image' => $imageUrl,
            'location' => $validated['location'] ?? 'Online', // <--- Guardamos ubicación
            'status' => 'published'
        ]);

        return response()->json($event, 201);
    }

    // GET /api/events/{id} (Público - Detalle)
    public function show($id)
    {
        $event = Event::with(['category', 'user', 'enrollments', 'comments.user'])
            ->withAvg('ratings', 'stars')
            ->findOrFail($id);
            
        $user = request()->user('sanctum');
        $userRating = 0;
        $isEnrolled = false;
        $canEdit = false;

        if ($user) {
            $existingRating = $event->ratings()->where('user_id', $user->id)->first();
            if ($existingRating) $userRating = $existingRating->stars;
            
            $isEnrolled = $event->enrollments()->where('user_id', $user->id)->exists();

            if ($user->id === $event->user_id || $user->role === 'admin') {
                $canEdit = true;
            }
        }

        $event->user_rating = $userRating;
        $event->is_enrolled = $isEnrolled;
        $event->can_edit = $canEdit;

        return response()->json($event);
    }

    // PUT /api/events/{id} (Privado - Editar)
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        if ($event->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'date' => 'nullable|date',
            'price' => 'nullable|numeric',
            'category_id' => 'nullable|exists:categories,id',
            'capacity' => 'nullable|integer|min:1',
            'image' => 'nullable|image|max:2048',
            'location' => 'nullable|string|max:255'
        ]);

        $dataToUpdate = [
            'title' => $validated['title'] ?? $event->title,
            'description' => $validated['description'] ?? $event->description,
            'start_at' => $validated['date'] ?? $event->start_at,
            'end_at' => $validated['date'] ?? $event->end_at,
            'price' => $validated['price'] ?? $event->price,
            'category_id' => $validated['category_id'] ?? $event->category_id,
            'capacity' => $validated['capacity'] ?? $event->capacity,
            'location' => $validated['location'] ?? $event->location,
        ];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $dataToUpdate['image'] = asset('storage/' . $path);
        }

        $event->update($dataToUpdate);

        return response()->json(['message' => 'Evento actualizado', 'event' => $event]);
    }

    // POST /api/events/{id}/enroll (Privado - Comprar Entradas)
    // ¡¡ESTA ES LA QUE TE FALTABA!!
    public function enroll(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $user = $request->user();

        $request->validate(['quantity' => 'required|integer|min:1|max:10']);
        $quantity = $request->input('quantity');

        if ($event->capacity < $quantity) {
            return response()->json(['message' => 'Solo quedan ' . $event->capacity . ' entradas.'], 400);
        }

        $existing = $event->users()->where('user_id', $user->id)->first();
        if ($existing) {
            return response()->json(['message' => 'Ya tienes entradas para este evento.'], 400);
        }

        $event->decrement('capacity', $quantity);
        $event->users()->attach($user->id, [
            'quantity' => $quantity, 
            'created_at' => now(), 
            'updated_at' => now()
        ]);

        return response()->json([
            'message' => "¡Has conseguido {$quantity} entradas con éxito!",
            'remaining_capacity' => $event->capacity
        ]);
    }

    // GET /api/my-enrollments (Eventos a los que voy)
    public function myEnrollments()
    {
        $user = auth('sanctum')->user();
        
        // Usamos el modelo User para acceder a los eventos via la relación 'events()'
        // Ojo: Asegúrate de tener la relación inversa en User.php si usas esto.
        // PERO para no liarte, vamos a modificar tu query actual para incluir el PIVOT:
        
        $events = $user->eventsAttending()->with('category')->get();
        // Nota: Para que esto funcione bien, necesitamos definir eventsAttending en User.php
        // O mejor, mantengamos tu lógica pero accediendo al dato pivot.
        
        // LA FORMA MÁS FÁCIL SIN TOCAR MUCHO:
        // Laravel devuelve el campo 'pivot' automáticamente si lo pusimos en el modelo.
        // Simplemente nos aseguramos de usar la relación correcta.
        
        // Vamos a cambiar esta función por esta versión más limpia:
        return response()->json($user->eventsAttending()->with(['category', 'user'])->get());
    }

    // GET /api/my-events (Eventos que yo organicé)
    public function myCreatedEvents()
    {
        $user = auth('sanctum')->user();
        $events = Event::where('user_id', $user->id)->with('category')->get();
        return response()->json($events);
    }
    
    // DELETE /api/events/{id}
    public function destroy(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        if ($event->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'No permiso'], 403);
        }
        $event->delete();
        return response()->json(['message' => 'Eliminado']);
    }
}