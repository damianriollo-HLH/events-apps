<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    // PUT /api/profile
    public function update(Request $request)
    {
        $user = $request->user(); // El usuario logueado

        // 1. Validar datos
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            // El email debe ser único, pero ignorando mi propio ID (para que no de error si no lo cambio)
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|min:6|confirmed', // 'confirmed' busca password_confirmation
        ]);

        // 2. Actualizar nombre y email
        $user->name = $validated['name'];
        $user->email = $validated['email'];

        // 3. Si escribió contraseña nueva, la encriptamos y guardamos
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user' => $user
        ]);
    }
}