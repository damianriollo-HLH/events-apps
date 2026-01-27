<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    // database/seeders/DatabaseSeeder.php

public function run(): void
{
    // 1. Crear un usuario admin para ti (para que puedas entrar luego)
    \App\Models\User::factory()->create([
        'name' => 'Admin User',
        'email' => 'admin@admin.com',
        'password' => bcrypt('password'), // La contraseña será 'password'
        // 'role' => 'admin', // Descomenta si ya tienes la columna 'role' en users
    ]);

    // 2. Crear 10 usuarios normales aleatorios
    \App\Models\User::factory(10)->create();

    // 3. Crear 5 categorías
    $categories = \App\Models\Category::factory(5)->create();

    // 4. Crear 50 eventos
    // (A cada evento le asignamos una categoría al azar de las que creamos arriba)
    \App\Models\Event::factory(50)->recycle($categories)->create();
}
}
