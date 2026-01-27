<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
{
    return [
        'name' => fake()->unique()->word(), // Genera una palabra única (ej: "Música")
        'description' => fake()->sentence(), // Una frase de descripción
        // 'image' => fake()->imageUrl(), // Opcional si tienes campo imagen
    ];
}
}
