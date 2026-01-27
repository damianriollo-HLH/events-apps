<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // REGISTRO DE USUARIO
    public function register(Request $request)
    {
        // 1. Validar datos
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed', // Espera un campo 'password_confirmation'
        ]);

        // 2. Crear usuario
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            // 'role' => 'user' // Por defecto
        ]);

        // 3. Crear el Token (La "pulsera VIP")
        $token = $user->createToken('auth_token')->plainTextToken;

        // 4. Devolver respuesta
        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    // LOGIN DE USUARIO
    public function login(Request $request)
    {
        // 1. Validar
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Intentar autenticar
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        // 3. Buscar usuario y generar token
        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Hola ' . $user->name,
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    // LOGOUT (Cerrar sesión)
    public function logout(Request $request)
    {
        // Borrar el token actual para que no sirva más
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }
}