<?php

use Illuminate\Support\Facades\Route;
use App\Models\Event;

// Ruta para ver el detalle de un evento (Pública)
Route::get('/events/{id}', function ($id) {
    // Buscamos el evento y cargamos el conteo de likes
    // 'likes' se carga automáticamente por el $appends del modelo, 
    // pero findOrFail asegura que si no existe dé error 404.
    $event = Event::findOrFail($id);
    
    return view('events.show', ['event' => $event]);
});

// Ruta temporal para listar eventos (para que puedas hacer clic y probar)
Route::get('/events', function () {
    $events = Event::all();
    // Creamos una vista rápida lista (puedes mejorarla luego)
    return view('welcome', ['events' => $events]); 
});
