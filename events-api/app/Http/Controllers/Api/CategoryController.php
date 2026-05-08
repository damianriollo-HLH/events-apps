<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // READ: Listar todas (Esta ya la tenías en routes/api.php, pero mejor aquí)
    public function index()
    {
        return response()->json(Category::all());
    }

    // CREATE: Guardar una nueva
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories|max:50',
            'description' => 'nullable|string|max:255',
        ]);

        $category = Category::create($validated);
        return response()->json(['message' => 'Categoría creada', 'category' => $category], 201);
    }

    // UPDATE: Editar una existente (¡Este es el que te faltaba para completar el CRUD!)
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:categories,name,' . $id,
            'description' => 'nullable|string|max:255',
        ]);

        $category->update($validated);
        return response()->json(['message' => 'Categoría actualizada', 'category' => $category]);
    }

    // DELETE: Borrar
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        
        // Verificamos si tiene eventos asociados para evitar errores de integridad
        if ($category->events()->count() > 0) {
            return response()->json(['message' => 'No se puede borrar una categoría con eventos asignados'], 409);
        }

        $category->delete();
        return response()->json(['message' => 'Categoría eliminada']);
    }
}