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
        $user = $request->user();

        // 1. Validar (Imagen opcional, máx 2MB)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', \Illuminate\Validation\Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|min:6|confirmed',
            'image'   => 'nullable|image|max:2048' // Validación de foto
        ]);

        // 2. Actualizar datos básicos
        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        // 3. --- GESTIÓN DE LA FOTO DE PERFIL ---
        if ($request->hasFile('image')) {
            // Guardamos en carpeta 'users' dentro de public
            $path = $request->file('image')->store('users', 'public');
            $user->image = asset('storage/' . $path);
        }

        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado con foto 📸',
            'user' => $user
        ]);
    }
}