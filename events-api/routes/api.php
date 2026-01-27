<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\AuthController;

// --- Rutas de Autenticación Públicas ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- Rutas Protegidas (Requieren Token) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Obtener usuario actual
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // CREAR evento
    Route::post('/events', [EventController::class, 'store']);

    // EDITAR evento (NUEVO)
    Route::put('/events/{id}', [EventController::class, 'update']);

    // BORRAR evento (NUEVO)
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    
    // RUTAS DE COMENTARIOS
    Route::post('/events/{id}/comments', [App\Http\Controllers\Api\CommentController::class, 'store']);
    Route::delete('/comments/{id}', [App\Http\Controllers\Api\CommentController::class, 'destroy']);

    // LIKES
    Route::post('/events/{id}/like', [App\Http\Controllers\Api\LikeController::class, 'toggle']);

    // INSCRIPCIONES (Enrollments)
    Route::post('/events/{id}/enroll', [App\Http\Controllers\Api\EnrollmentController::class, 'store']);
    Route::delete('/events/{id}/enroll', [App\Http\Controllers\Api\EnrollmentController::class, 'destroy']);
    
    // Ver mis inscripciones (útil para "Mis Eventos")
    Route::get('/my-enrollments', function (Request $request) {
        return $request->user()->enrollments()->with('event')->get();
    });
    // RUTA PARA VOTAR
    Route::post('/events/{id}/rate', [App\Http\Controllers\Api\RatingController::class, 'store']);
    
    //Eventos creados por el usuario logeado
    Route::get('/my-events', function (Request $request) {
        return $request->user()->events()->orderBy('created_at', 'desc')->get();
    });
    

});

// --- Rutas Públicas (Cualquiera puede verlas) ---
Route::get('/events', [EventController::class, 'index']); // Lista de eventos
Route::get('/events/{id}', [EventController::class, 'show']); // Detalle de un evento