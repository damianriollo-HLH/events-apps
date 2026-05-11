<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

/**
 * =========================================================================
 * CATEGORY CONTROLLER (Controlador de Categorías)
 * =========================================================================
 * Gestiona todo el catálogo de categorías ("Música", "Deportes", etc.).
 * Es un CRUD completo (Crear, Leer, Actualizar, Borrar).
 * * * Relación con la Web (React):
 * - Cuando el usuario abre la barra lateral de "Filtros" en la Home, React llama a este 
 * controlador (método index) para rellenar el menú desplegable.
 * - Cuando un organizador va a "Crear Nuevo Evento", el selector de categorías 
 * también se alimenta de aquí.
 * - Los métodos store, update y destroy están pensados para el Panel de Administración.
 */
class CategoryController extends Controller
{
    /**
     * ---------------------------------------------------------------------
     * LEER TODAS LAS CATEGORÍAS (Método: index)
     * ---------------------------------------------------------------------
     * Va a la tabla 'categories', saca todos los registros y
     * los devuelve a React en formato JSON.
     */
    public function index()
    {
        return response()->json(Category::all());
    }

    /**
     * ---------------------------------------------------------------------
     * CREAR CATEGORÍA (Método: store)
     * ---------------------------------------------------------------------
     * ¿Qué hace?: Recibe los datos desde React para crear una nueva categoría.
     */
    public function store(Request $request)
    {
        // 1. Validar: Comprobamos que el nombre sea obligatorio y, muy importante,
        // que sea ÚNICO ('unique:categories'). No podemos tener dos categorías "Música".
        $validated = $request->validate([
            'name' => 'required|string|unique:categories|max:50',
            'description' => 'nullable|string|max:255', // El campo descripción es opcional (nullable)
        ]);

        // 2. Crear en base de datos usando asignación masiva (Mass Assignment).
        $category = Category::create($validated);
        
        // 3. Devolver respuesta con código HTTP 201 (Created).
        return response()->json(['message' => 'Categoría creada', 'category' => $category], 201);
    }

    /**
     * ---------------------------------------------------------------------
     * ACTUALIZAR CATEGORÍA (Método: update)
     * ---------------------------------------------------------------------
     * ¿Qué hace?: Permite al administrador cambiar el nombre o descripción.
     */
    public function update(Request $request, $id)
    {
        // 1. Buscar la categoría. Si no existe la ID, Laravel devuelve error 404 automáticamente gracias a 'findOrFail'.
        $category = Category::findOrFail($id);

        // 2. Validar los nuevos datos. 
        // TRUCO TÉCNICO AQUÍ: 'unique:categories,name,' . $id
        // Le decimos a Laravel: "El nombre debe ser único, EXCEPTO si es el de la 
        // categoría que estoy editando ahora mismo". Si no ponemos esto, al darle a guardar 
        // sin cambiar el nombre, Laravel daría error diciendo que el nombre ya existe.
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:categories,name,' . $id,
            'description' => 'nullable|string|max:255',
        ]);

        // 3. Actualizar y guardar en base de datos.
        $category->update($validated);
        return response()->json(['message' => 'Categoría actualizada', 'category' => $category]);
    }

    /**
     * ---------------------------------------------------------------------
     * BORRAR CATEGORÍA (Método: destroy)
     * ---------------------------------------------------------------------
     * ¿Qué hace?: Elimina una categoría, PERO con una medida de seguridad.
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        
        // MEDIDA DE SEGURIDAD (Integridad Referencial):
        // Verificamos si esta categoría tiene eventos asociados. 
        // ¿Por qué?: Si borramos la categoría "Deportes", todos los eventos deportivos 
        // de la base de datos se quedarían "huérfanos" (con un category_id que ya no existe),
        // lo que rompería la aplicación en React al intentar mostrarlos.
        if ($category->events()->count() > 0) {
            // Devolvemos un código 409 (Conflict). React leerá esto y podrá mostrar 
            // un alert diciendo: "¡Ey! Primero borra o cambia de categoría los eventos".
            return response()->json(['message' => 'No se puede borrar una categoría con eventos asignados'], 409);
        }

        // Si no tiene eventos, procedemos a borrarla con seguridad.
        $category->delete();
        return response()->json(['message' => 'Categoría eliminada']);
    }
}