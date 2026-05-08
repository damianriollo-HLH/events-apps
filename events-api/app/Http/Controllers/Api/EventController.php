<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use App\Notifications\EventEnrolledNotification;
use App\Notifications\EventCreatedNotification;

class EventController extends Controller
{
    // GET /api/events (Público - Con Buscador Avanzado)
    public function index(Request $request)
    {
        $query = Event::with(['category', 'user'])
            ->where('status', 'published');

        // ... (Los filtros de texto, ciudad, categoría y fecha se quedan igual, están perfectos) ...
        if ($request->has('search') && $request->input('search') != '') {
            $searchTerm = $request->input('search');
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'LIKE', "%{$searchTerm}%");
            });
        }

        if ($request->has('city') && $request->input('city') != '') {
            $city = $request->input('city');
            $query->where('location', 'LIKE', "%{$city}%");
        }

        if ($request->has('category') && $request->category != 'null') {
            $query->where('category_id', $request->input('category'));
        }

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

        // ORDENAMIENTO
        $sort = $request->input('sort', 'newest');
        
        switch ($sort) {
            case 'price_asc': $query->orderBy('price', 'asc'); break;
            case 'price_desc': $query->orderBy('price', 'desc'); break;
            case 'oldest': $query->orderBy('start_at', 'asc'); break;
            case 'newest': default: $query->orderBy('created_at', 'desc'); break;
        }

        $events = $query->paginate(9); 
        return response()->json($events);
    }

    // POST /api/events (Privado - Crear Evento)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_at' => 'required|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'price' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
            'capacity' => 'nullable|integer|min:1',
            'image' => 'nullable|image|max:2048',
            'location' => 'nullable|string|max:255',
            'external_link' => 'nullable|url|max:255' // <-- Validación del link externo
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $imageUrl = asset('storage/' . $path);
        }

        $event = $request->user()->events()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_at' => $validated['start_at'],
            'end_at' => $validated['end_at'] ?? $validated['start_at'],
            'price' => $validated['price'],
            'category_id' => $validated['category_id'],
            'capacity' => $validated['capacity'] ?? 50,
            'image' => $imageUrl,
            'location' => $validated['location'] ?? 'Online',
            'external_link' => $validated['external_link'] ?? null, // <-- Guardamos el link
            'status' => 'published'
        ]);
        // 🔥 Notificar al creador (Si tiene los mails activos)
        $user = $request->user();
        if ($user->email_notifications) {
            $user->notify(new EventCreatedNotification($event));
        }

        return response()->json($event, 201);
    }

    // GET /api/events/{id} (Público - Detalle)
    public function show($id)
    {
        /**
         * EAGER LOADING OPTIMIZADO:
         * Cargamos la relación de comentarios usando un "Closure" (función anónima)
         * para decirle a la base de datos que ya nos devuelva los comentarios ordenados
         * por el más reciente, junto con el usuario (autor) de cada uno.
         */
        $event = Event::with([
            'category', 
            'user', 
            'enrollments', 
            'comments' => function($query) {
                $query->orderBy('created_at', 'desc'); 
            },
            'comments.user' 
        ])
            ->withAvg('ratings', 'stars')
            ->findOrFail($id);
            
        $user = request()->user('sanctum');
        $userRating = 0;
        $isEnrolled = false;
        $canEdit = false;
        $isLiked = false;

        if ($user) {
            $existingRating = $event->ratings()->where('user_id', $user->id)->first();
            if ($existingRating) $userRating = $existingRating->stars;
            
            $isEnrolled = $event->enrollments()->where('user_id', $user->id)->exists();

            if ($user->id === $event->user_id || $user->role === 'admin') {
                $canEdit = true;
            }
            // Comprobamos si tiene el like
            $isLiked = $event->likes()->where('user_id', $user->id)->exists();
        }

        $event->user_rating = $userRating;
        $event->is_enrolled = $isEnrolled;
        $event->is_liked = $isLiked;
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
            'start_at' => 'required|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'price' => 'nullable|numeric',
            'category_id' => 'nullable|exists:categories,id',
            'capacity' => 'nullable|integer|min:1',
            'image' => 'nullable|image|max:2048',
            'location' => 'nullable|string|max:255',
            // OJO: 'nullable|url' permite que el usuario lo borre enviando un string vacío.
            // A veces el frontend envía 'null' como string, así que lo manejamos abajo.
            'external_link' => 'nullable|url|max:255' 
        ]);

        $dataToUpdate = [
            'title' => $validated['title'] ?? $event->title,
            'description' => $validated['description'] ?? $event->description,
            'start_at' => $validated['start_at'],
            'end_at' => $validated['end_at'] ?? $validated['start_at'],
            'price' => $validated['price'] ?? $event->price,
            'category_id' => $validated['category_id'] ?? $event->category_id,
            'capacity' => $validated['capacity'] ?? $event->capacity,
            'location' => $validated['location'] ?? $event->location,
        ];

        // Lógica segura para actualizar o borrar el external link
        if ($request->has('external_link')) {
             $dataToUpdate['external_link'] = $validated['external_link'];
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $dataToUpdate['image'] = asset('storage/' . $path);
        }

        $event->update($dataToUpdate);

        return response()->json(['message' => 'Evento actualizado', 'event' => $event]);
    }

    // POST /api/events/{id}/enroll (Privado - RSVP / Apuntarse)
    public function enroll(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $user = $request->user();

        // Simplificamos la validación. Por defecto asumimos 1 si no lo envían, 
        // ya que el nuevo modelo es de RSVP personal, no de compra en bloque.
        $request->validate(['quantity' => 'nullable|integer|min:1|max:10']);
        $quantity = $request->input('quantity', 1);

        if ($event->capacity < $quantity) {
            return response()->json(['message' => 'Aforo completo o insuficiente.'], 400);
        }

        $existing = $event->users()->where('user_id', $user->id)->first();
        if ($existing) {
            return response()->json(['message' => 'Ya te has apuntado a este evento.'], 400);
        }

        $event->decrement('capacity', $quantity);
        $event->users()->attach($user->id, [
            'quantity' => $quantity, 
            'created_at' => now(), 
            'updated_at' => now()
        ]);

        //LÓGICA DE NOTIFICACIONES (Con validación de privacidad)
        // Verificamos si la columna 'email_notifications' de la DB está en 1 (true)
        if ($user->email_notifications) {
            $user->notify(new EventEnrolledNotification($event));
        }

        return response()->json([
            'message' => "¡Te has apuntado con éxito!",
            'remaining_capacity' => $event->capacity
        ]);
    }

    // ... (El resto de tus métodos myEnrollments, myCreatedEvents, destroy, etc., se quedan igual) ...

    // GET /api/my-enrollments
    public function myEnrollments()
    {
        $user = auth('sanctum')->user();
        return response()->json($user->eventsAttending()->with(['category', 'user'])->get());
    }

    // GET /api/my-events
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
        //Seguridad
        // Verificamos si el usuario es el dueño O si es administrador usando 'is_admin'
        if ($event->user_id !== $request->user()->id && !$request->user()->is_admin) {
            return response()->json(['message' => 'No tienes permiso para realizar esta acción'], 403);
        }

        $event->delete();
        return response()->json(['message' => 'Evento eliminado correctamente']);
    }

    // GET /api/my-favorites (Eventos que me gustan)
    public function myFavorites()
    {
        $user = auth('sanctum')->user();
        
        // Técnica Senior (whereHas): Buscamos todos los eventos que 
        // tengan un registro en la tabla 'likes' con el ID de nuestro usuario.
        $events = Event::whereHas('likes', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })->with(['category', 'user'])->get();

        return response()->json($events);
    }

    // --- FUNCIONES DE ADMINISTRADOR ---
    public function adminIndex(Request $request)
    {
        $events = Event::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json($events);
    }

    public function toggleFeature(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $event->is_featured = !$event->is_featured; 
        $event->save();
        return response()->json([
            'message' => 'Estado destacado actualizado',
            'is_featured' => $event->is_featured
        ]);
    }
}