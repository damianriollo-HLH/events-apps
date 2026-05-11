<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Este proyecto funciona como una API RESTful para un Frontend en React.
| Todas las rutas de datos están en routes/api.php.
| Aquí solo dejamos un mensaje de comprobación de estado (Health Check).
|
*/

Route::get('/', function () {
    return response()->json([
        'message' => '🚀 El Backend de CaraLibre está funcionando correctamente.',
        'status' => 'OK',
        'documentation' => 'Por favor, utiliza el Frontend en React (puerto 5173) para navegar.'
    ]);
});