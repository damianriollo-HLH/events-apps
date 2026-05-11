<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use App\Notifications\EventEnrolledNotification;
use App\Notifications\EventCreatedNotification;

/**
 * =========================================================================
 * EVENT CONTROLLER (Controlador Principal de Eventos)
 * =========================================================================
 * ¿Para qué sirve?: Es el corazón de CaraLibre. Gestiona el ciclo de vida 
 * completo de los eventos: creación, búsqueda, visualización y edición.
 * * * Conceptos clave:
 * - API RESTful: Proporcionamos datos en JSON para que React los pinte.
 * - Eager Loading: Optimizamos las consultas SQL para evitar el problema N+1.
 * - Seguridad: Validamos quién puede editar o borrar cada evento.
 */
class EventController extends Controller
{
    /**
     * ---------------------------------------------------------------------
     * LISTAR EVENTOS CON BUSCADOR (Método: index) - PÚBLICO
     * ---------------------------------------------------------------------
     * ¿Qué hace?: Devuelve los eventos publicados. Implementa un motor de 
     * búsqueda que filtra por texto, ciudad, categoría y fecha.
     */
    public function index(Request $request)
    {
        // 1. Iniciamos la consulta con Eager Loading ('with').
        // Traemos la categoría y el usuario de golpe para ahorrar consultas a la BD.
        $query = Event::with(['category', 'user'])
            ->where('status', 'published');

        // 2. Filtro de búsqueda por texto (Título o Descripción)
        if ($request->has('search') && $request->input('search') != '') {
            $searchTerm = $request->input('search');
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'LIKE', "%{$searchTerm}%");
            });
        }

        // 3. Filtro por Ciudad (Busca dentro del campo 'location')
        if ($request->has('city') && $request->input('city') != '') {
            $city = $request->input('city');
            $query->where('location', 'LIKE', "%{$city}%");
        }

        // 4. Filtro por Categoría
        if ($request->has('category') && $request->category != 'null') {
            $query->where('category_id', $request->input('category'));
        }

        // 5. Filtro de Fecha (Hoy, Mañana, Esta Semana)
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

        // 6. Ordenamiento dinámico según lo que el usuario elija en el select
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'price_asc': $query->orderBy('price', 'asc'); break;
            case 'price_desc': $query->orderBy('price', 'desc'); break;
            case 'oldest': $query->orderBy('start_at', 'asc'); break;
            case 'newest': default: $query->orderBy('created_at', 'desc'); break;
        }

        // 7. Paginación: Enviamos 9 eventos por página para que React los muestre.
        $events = $query->paginate(9); 
        return response()->json($events);
    }

    /**
     * ---------------------------------------------------------------------
     * CREAR UN EVENTO (Método: store) - PRIVADO
     * ---------------------------------------------------------------------
     * ¿Qué hace?: Valida los datos recibidos (Multipart/FormData), guarda 
     * la imagen en el storage y crea el registro en la base de datos.
     */
    public function store(Request $request)
    {
        // 1. Validar datos: Laravel comprueba tipos de datos y reglas de negocio.
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
            'external_link' => 'nullable|url|max:255' 
        ]);

        // 2. Gestión de la imagen promocional
        $imageUrl = null;
        if ($request->hasFile('image')) {
            // Se guarda en storage/app/public/events y se genera una URL pública
            $path = $request->file('image')->store('events', 'public');
            $imageUrl = asset('storage/' . $path);
        }

        // 3. Creación del evento asociado al usuario autenticado
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
            'external_link' => $validated['external_link'] ?? null,
            'status' => 'published'
        ]);

        // 4. Sistema de Notificaciones: Enviamos un email al creador si lo tiene activado.
        $user = $request->user();
        if ($user->email_notifications) {
            $user->notify(new EventCreatedNotification($event));
        }

        return response()->json($event, 201);
    }

    /**
     * ---------------------------------------------------------------------
     * VER DETALLES DEL EVENTO (Método: show) - PÚBLICO
     * ---------------------------------------------------------------------
     * ¿Qué hace?: Devuelve toda la información necesaria para pintar la 
     * página 'EventDetail'. Incluye comentarios, media de estrellas y 
     * el estado de la relación con el usuario que está mirando (like, etc).
     */
    public function show($id)
    {
        // EAGER LOADING MASIVO: Traemos el evento con todas sus relaciones anidadas.
        $event = Event::with([
            'category', 
            'user', 
            'enrollments', 
            'comments' => function($query) {
                $query->orderBy('created_at', 'desc'); // Comentarios más recientes primero
            },
            'comments.user' // Autor de cada comentario
        ])
            ->withAvg('ratings', 'stars') // SQL calcula la media de valoraciones al vuelo
            ->findOrFail($id);
            
        // Identificamos al usuario (si está logueado) para calcular estados personalizados
        $user = request()->user('sanctum');
        $userRating = 0;
        $isEnrolled = false;
        $canEdit = false;
        $isLiked = false;

        if ($user) {
            $existingRating = $event->ratings()->where('user_id', $user->id)->first();
            if ($existingRating) $userRating = $existingRating->stars;
            
            $isEnrolled = $event->enrollments()->where('user_id', $user->id)->exists();

            // Seguridad: Verificamos si el usuario tiene permisos de edición (dueño o admin)
            if ($user->id === $event->user_id || $user->role === 'admin') {
                $canEdit = true;
            }
            $isLiked = $event->likes()->where('user_id', $user->id)->exists();
        }

        // Inyectamos campos virtuales al objeto JSON para que React los lea fácilmente
        $event->user_rating = $userRating;
        $event->is_enrolled = $isEnrolled;
        $event->is_liked = $isLiked;
        $event->can_edit = $canEdit;

        return response()->json($event);
    }

    /**
     * ---------------------------------------------------------------------
     * EDITAR EVENTO (Método: update) - PRIVADO
     * ---------------------------------------------------------------------
     */
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        // Seguridad: Solo el dueño o un admin pueden editar
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

    /**
     * ---------------------------------------------------------------------
     * APUNTARSE AL EVENTO (Método: enroll)
     * ---------------------------------------------------------------------
     */
    public function enroll(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $user = $request->user();

        $request->validate(['quantity' => 'nullable|integer|min:1|max:10']);
        $quantity = $request->input('quantity', 1);

        if ($event->capacity < $quantity) {
            return response()->json(['message' => 'Aforo completo o insuficiente.'], 400);
        }

        $existing = $event->users()->where('user_id', $user->id)->first();
        if ($existing) {
            return response()->json(['message' => 'Ya te has apuntado a este evento.'], 400);
        }

        // Restamos el aforo de la base de datos
        $event->decrement('capacity', $quantity);
        // Creamos la relación en la tabla pivote enrollments
        $event->users()->attach($user->id, [
            'quantity' => $quantity, 
            'created_at' => now(), 
            'updated_at' => now()
        ]);

        // Notificación de asistencia por email
        if ($user->email_notifications) {
            $user->notify(new EventEnrolledNotification($event));
        }

        return response()->json([
            'message' => "¡Te has apuntado con éxito!",
            'remaining_capacity' => $event->capacity
        ]);
    }
    
    public function unenroll($id)
    {
        try {
            // Buscamos la inscripción directamente en la tabla pivote
            \DB::table('enrollments')
                ->where('user_id', auth()->id())
                ->where('event_id', $id)
                ->delete();

            return response()->json(['message' => 'Asistencia cancelada con éxito'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al cancelar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * ---------------------------------------------------------------------
     * LISTADOS PERSONALES (Mis Inscripciones / Mis Eventos Creados)
     * ---------------------------------------------------------------------
     */
    public function myEnrollments()
    {
        $user = auth('sanctum')->user();
        return response()->json($user->eventsAttending()->with(['category', 'user'])->get());
    }

    public function myCreatedEvents()
    {
        $user = auth('sanctum')->user();
        $events = Event::where('user_id', $user->id)->with('category')->get();
        return response()->json($events);
    }
    
    /**
     * ---------------------------------------------------------------------
     * ELIMINAR EVENTO (Método: destroy)
     * ---------------------------------------------------------------------
     */
    public function destroy(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        
        // Solo el dueño o un admin pueden borrar
        if ($event->user_id !== $request->user()->id && !$request->user()->is_admin) {
            return response()->json(['message' => 'No tienes permiso para realizar esta acción'], 403);
        }

        $event->delete();
        return response()->json(['message' => 'Evento eliminado correctamente']);
    }

    /**
     * ---------------------------------------------------------------------
     * FAVORITOS (Método: myFavorites)
     * ---------------------------------------------------------------------
     * Usa la técnica 'whereHas' para buscar eventos que tengan likes del usuario.
     */
    public function myFavorites()
    {
        $user = auth('sanctum')->user();
        
        // whereHas: Buscamos todos los eventos que 
        // tengan un registro en la tabla 'likes' con el ID de nuestro usuario.
        $events = Event::whereHas('likes', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })->with(['category', 'user'])->get();

        return response()->json($events);
    }

    /**
     * ---------------------------------------------------------------------
     * ADMINISTRACIÓN (Panel Admin)
     * ---------------------------------------------------------------------
     */
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