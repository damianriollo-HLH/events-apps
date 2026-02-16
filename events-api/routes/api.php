<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Category;

// Importamos los Controladores de forma ordenada
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\RatingController;
// use App\Http\Controllers\Api\EnrollmentController; // (Ya no lo usamos, usamos EventController)

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ========================================================================
// 1. RUTAS PÚBLICAS (No necesitan Login)
// ========================================================================

// Autenticación
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Categorías
Route::get('/categories', function () {
    return Category::all();
});

// Eventos (Listado y Detalle)
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);


// ========================================================================
// 2. RUTAS PROTEGIDAS (Necesitan Token / Estar Logueado)
// ========================================================================

Route::middleware('auth:sanctum')->group(function () {
    
    // --- USUARIO ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/profile', [ProfileController::class, 'update']); // Editar Perfil

    // --- GESTIÓN DE EVENTOS (CRUD) ---
    Route::post('/events', [EventController::class, 'store']);       // Crear
    Route::put('/events/{id}', [EventController::class, 'update']);  // Editar
    Route::delete('/events/{id}', [EventController::class, 'destroy']); // Borrar

    // --- COMPRA / INSCRIPCIÓN ---
    // Usamos la nueva función 'enroll' del EventController que soporta cantidad
    Route::post('/events/{id}/enroll', [EventController::class, 'enroll']);

    // --- DASHBOARD (Mis datos) ---
    // Eventos a los que voy (Mis Entradas)
    Route::get('/my-enrollments', [EventController::class, 'myEnrollments']); 
    // Eventos que yo organicé
    Route::get('/my-events', [EventController::class, 'myCreatedEvents']);   

    // --- INTERACCIÓN SOCIAL ---
    // Comentarios
    Route::post('/events/{id}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
    
    // Valoraciones (Estrellas)
    Route::post('/events/{id}/rate', [RatingController::class, 'store']);

    // Likes (Si tienes este controlador, descoméntalo. Si no, déjalo así)
    // Route::post('/events/{id}/like', [App\Http\Controllers\Api\LikeController::class, 'toggle']);
});