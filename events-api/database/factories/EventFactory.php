<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
// database/factories/EventFactory.php

public function definition(): array
{
    return [
        'title' => fake()->sentence(4), // Título de 4 palabras
        'description' => fake()->paragraph(),
        'start_at' => fake()->dateTimeBetween('now', '+1 month'), // Fecha inicio entre hoy y 1 mes
        'end_at' => fake()->dateTimeBetween('+1 month', '+2 months'), // Fecha fin posterior
        'price' => fake()->randomFloat(2, 10, 100), // Precio entre 10.00 y 100.00
        'address' => fake()->address(),
        'city' => fake()->city(),
        'lat' => fake()->latitude(), // ¡Importante para "Eventos Cercanos"!
        'lng' => fake()->longitude(), // ¡Importante para "Eventos Cercanos"!
        'capacity' => fake()->numberBetween(50, 500),
        'status' => 'published', // Para que salgan en la web pública
        
        // Datos para "Mejor Valorados"
        'avg_rating' => fake()->randomFloat(1, 1, 5), // Nota entre 1.0 y 5.0
        'ratings_count' => fake()->numberBetween(0, 100),

        // Relaciones (Creará IDs válidos automáticamente si no se los pasamos)
        'user_id' => \App\Models\User::factory(),
        'category_id' => \App\Models\Category::factory(),
    ];
}
}
