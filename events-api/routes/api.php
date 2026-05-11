<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Category;

// Importamos los Controladores de forma ordenada
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\LikeController;

/*
|--------------------------------------------------------------------------
| API Routes (El Mapa de CaraLibre)
|--------------------------------------------------------------------------
| Aquí es donde registramos todas las URLs a las que React puede llamar.
*/

// ========================================================================
// 1. RUTAS PÚBLICAS (El Escaparate - No necesitan Login)
// ========================================================================

// Autenticación (Para poder entrar al sistema)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Categorías (Devolvemos todas directamente usando una función anónima)
Route::get('/categories', function () {
    return Category::all();
});

// Eventos (El Catálogo Público)
Route::get('/events', [EventController::class, 'index']);      // Buscador y listado
Route::get('/events/{id}', [EventController::class, 'show']);  // Ver detalles de un evento


// ========================================================================
// 2. RUTAS PROTEGIDAS (Zona VIP - Necesitan Token Sanctum)
// ========================================================================
// Todo lo que esté dentro de este "group" requiere que el usuario haya iniciado sesión.
Route::middleware('auth:sanctum')->group(function () {

    // --------------------------------------------------------------------
    // ZONA DE ADMINISTRACIÓN (Doble barrera de seguridad)
    // --------------------------------------------------------------------
    // Solo entran si están logueados (arriba) Y si el AdminMiddleware da el OK.
    Route::middleware('admin')->group(function () {
        Route::get('/admin/events', [EventController::class, 'adminIndex']);
        Route::put('/admin/events/{id}/feature', [EventController::class, 'toggleFeature']);
        
        // CRUD completo de Categorías (apiResource crea las 5 rutas automáticamente)
        Route::apiResource('categories-admin', CategoryController::class)
            ->parameters(['categories-admin' => 'id']);
    });    
    
    // --------------------------------------------------------------------
    // ZONA DE USUARIO NORMAL (Cualquiera registrado)
    // --------------------------------------------------------------------

    // Perfil y Sesión
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user(); // Devuelve quién soy según mi token
    });
    Route::put('/profile', [ProfileController::class, 'update']); // Guardar cambios de perfil

    // CRUD de Eventos (Organizar eventos propios)
    Route::post('/events', [EventController::class, 'store']);       // Crear
    Route::put('/events/{id}', [EventController::class, 'update']);  // Editar
    Route::delete('/events/{id}', [EventController::class, 'destroy']); // Borrar

    // Inscripciones (Apuntarse / Comprar entrada)
    Route::post('/events/{id}/enroll', [EventController::class, 'enroll']);
    Route::delete('/events/{id}/enroll', [EventController::class, 'unenroll']);

    // Listados del Dashboard (Mis cosas)
    Route::get('/my-enrollments', [EventController::class, 'myEnrollments']); // Mis entradas
    Route::get('/my-events', [EventController::class, 'myCreatedEvents']);    // Eventos que organicé
    Route::get('/my-favorites', [EventController::class, 'myFavorites']);     // Corazones rojos

    // Interacción Social (Comentarios, Valoraciones y Likes)
    Route::post('/events/{id}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
    Route::post('/events/{id}/rate', [RatingController::class, 'store']);
    Route::post('/events/{id}/like', [LikeController::class, 'toggle']);
});