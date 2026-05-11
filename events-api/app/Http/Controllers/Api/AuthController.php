<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * =========================================================================
 * AUTH CONTROLLER (Controlador de Autenticación)
 * =========================================================================
 * Este archivo es el "Guardia de Seguridad" de la API.
 * Gestiona quién entra, quién sale y quién se registra en la base de datos.
 * * Relación con la Web (React):
 * - Cuando un usuario llena el formulario de "Crear Cuenta", React envía los datos a la función register().
 * - Cuando un usuario llena el formulario de "Login", React envía los datos a login().
 * - Cuando el usuario pulsa "Cerrar Sesión" en la barra de navegación, React llama a logout().
 * * Concepto clave: Usamos "Laravel Sanctum". Funciona entregando un Token (una especie de "pulsera VIP digital") al usuario cuando se loguea.
 *   React guarda ese token y lo enseña cada vez que quiere ver datos privados.
 */
class AuthController extends Controller
{
    /**
     * ---------------------------------------------------------------------
     * REGISTRO DE USUARIO (Método: register)
     * ---------------------------------------------------------------------
     * Recibe los datos del formulario de registro de React, 
     * comprueba que estén bien, guarda al usuario en MySQL y le da su token.
     */
    public function register(Request $request)
    {
        // 1. Validar datos: Laravel comprueba automáticamente que el email
        // no exista ya ('unique:users') y que las contraseñas coincidan ('confirmed').
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed', // Espera un campo 'password_confirmation' en React
        ]);

        // 2. Crear usuario en la base de datos.
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            // Hash::make encripta la contraseña para que no se vea en la BD.
            'password' => Hash::make($request->password), 
            // 'role' => 'user' // Si tuviéramos roles, aquí se asignaría el de por defecto
        ]);

        // 3. Crear el Token: El usuario ya existe, le creamos su "Pulsera VIP" de Sanctum.
        $token = $user->createToken('auth_token')->plainTextToken;

        // 4. Devolver respuesta: Enviamos un JSON a React con el token y un código 201 (Creado).
        // React agarrará este 'access_token' y lo guardará en su localStorage.
        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * ---------------------------------------------------------------------
     * LOGIN DE USUARIO (Método: login)
     * ---------------------------------------------------------------------
     * Verifica que el email y la contraseña coincidan con la BD.
     * Si es correcto, le genera un token para que pueda navegar por la web.
     */
    public function login(Request $request)
    {
        // 1. Validar que React nos haya enviado sí o sí un email y un password.
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Intentar autenticar: Auth::attempt busca el email y comprueba el Hash de la contraseña.
        // Si devuelve falso (!), significa que los datos están mal.
        if (!Auth::attempt($request->only('email', 'password'))) {
            // Devolvemos error 401 (No Autorizado) para que React muestre un mensaje en rojo.
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        // 3. Buscar usuario y generar token: Si llegó aquí, el login fue exitoso.
        // Buscamos sus datos y le creamos un nuevo Token de sesión.
        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        // 4. Responder a React con el token para que le dé acceso al Dashboard.
        return response()->json([
            'message' => 'Hola ' . $user->name,
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * ---------------------------------------------------------------------
     * LOGOUT / CERRAR SESIÓN (Método: logout)
     * ---------------------------------------------------------------------
     * Destruye el token del usuario en la base de datos.
     * Al hacer esto, si alguien intenta usar ese token viejo, Laravel lo rechazará.
     */
    public function logout(Request $request)
    {
        // Borrar el token actual de la base de datos (invalida la "pulsera").
        $request->user()->currentAccessToken()->delete();

        // Le decimos a React que todo salió bien para que redirija a la Home.
        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }
}