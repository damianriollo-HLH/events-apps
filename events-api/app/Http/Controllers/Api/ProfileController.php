<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

/**
 * =========================================================================
 * PROFILE CONTROLLER (Controlador de Perfil de Usuario)
 * =========================================================================
 * ¿Para qué sirve?: Gestiona la actualización de los datos personales 
 * del usuario logueado, incluyendo su avatar y sus preferencias de notificaciones.
 * * Relación con la Web (React):
 * - Se dispara cuando el usuario está en el Dashboard, pulsa "Editar Perfil"
 * y envía el formulario de actualización.
 */
class ProfileController extends Controller
{
    /**
     * ---------------------------------------------------------------------
     * ACTUALIZAR PERFIL (Método: update)
     * ---------------------------------------------------------------------
     * Ruta: PUT /api/profile (Aunque internamente React enviará POST con _method=PUT para la foto)
     * ¿Qué hace?: Valida los nuevos datos, comprueba que el email no esté 
     * siendo usado por OTRA persona, sube el nuevo avatar si existe, y actualiza 
     * la base de datos.
     */
    public function update(Request $request)
    {
        // Rescatamos al usuario logueado de forma segura gracias a Sanctum
        $user = $request->user();

        // ---------------------------------------------------------
        // 1. VALIDACIÓN DE DATOS
        // ---------------------------------------------------------
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            
            // TRUCO SENIOR: Rule::unique('users')->ignore($user->id)
            // Le decimos a Laravel: "El email debe ser único en la tabla users...
            // ¡EXCEPTO si es el email que ya tiene el usuario actual!".
            // Así evitamos que dé error al guardar si el usuario no cambia su correo.
            'email' => [
                'required', 
                'email', 
                \Illuminate\Validation\Rule::unique('users')->ignore($user->id)
            ],
            
            // La contraseña es opcional (nullable). Solo la valida si el usuario escribe algo.
            // 'confirmed' exige que desde React llegue un campo 'password_confirmation' que coincida.
            'password' => 'nullable|min:6|confirmed',
            
            // La imagen es opcional, pero si llega, debe ser una imagen real y pesar menos de 2MB
            'image'   => 'nullable|image|max:2048', 
            
            'email_notifications' => 'required|boolean'
        ]);

        // ---------------------------------------------------------
        // 2. ACTUALIZACIÓN DE DATOS BÁSICOS
        // ---------------------------------------------------------
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        
        // Cuando enviamos datos mediante FormData desde React, los booleanos (true/false)
        // a veces llegan como strings ("true" o "false"). filter_var convierte esos strings
        // de vuelta a un formato booleano real que MySQL entienda (1 o 0).
        $user->email_notifications = filter_var($validated['email_notifications'], FILTER_VALIDATE_BOOLEAN);

        // Si el usuario rellenó el campo password, lo encriptamos y lo cambiamos.
        // Si lo dejó vacío, esta condición se ignora y conserva su contraseña antigua.
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        // ---------------------------------------------------------
        // 3. GESTIÓN DE LA FOTO DE PERFIL (AVATAR)
        // ---------------------------------------------------------
        if ($request->hasFile('image')) {
            // Guardamos el archivo físicamente en 'storage/app/public/users'
            $path = $request->file('image')->store('users', 'public');
            
            // Construimos la URL completa para que React pueda leerla (http://localhost:8000/storage/users/...)
            // y sobrescribimos el campo 'image' en la base de datos.
            $user->image = asset('storage/' . $path);
        }

        // 4. Guardamos todos los cambios en la base de datos
        $user->save();

        // 5. Devolvemos el usuario actualizado para que React refresque la vista al instante
        return response()->json([
            'message' => 'Perfil actualizado con foto 📸',
            'user' => $user
        ]);
    }
}