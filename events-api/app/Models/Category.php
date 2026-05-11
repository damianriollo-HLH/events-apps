<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * =========================================================================
 * MODELO: CATEGORY (Categorías de Eventos)
 * =========================================================================
 * ¿Para qué sirve?: Es la representación en código de la tabla 'categories' 
 * de la base de datos MySQL. Gestiona las temáticas a las que pertenecen 
 * los eventos (ej: Música, Deportes, Tecnología).
 */
class Category extends Model
{
    // Permite usar "Factories" para generar datos falsos de prueba (Seeders)
    use HasFactory;

    /**
     * ---------------------------------------------------------------------
     * 1. PROTECCIÓN DE ASIGNACIÓN MASIVA (Mass Assignment)
     * ---------------------------------------------------------------------
     * El array $fillable actúa como una "lista blanca" de seguridad.
     * Le decimos a Laravel exactamente qué columnas permitimos que se llenen 
     * de forma automática ("en masa") cuando recibimos datos de un formulario de React.
     */
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * ---------------------------------------------------------------------
     * 2. RELACIONES DE BASE DE DATOS (Eloquent Relationships)
     * ---------------------------------------------------------------------
     * Define cómo se relaciona esta tabla con la tabla de eventos.
     * En bases de datos relacionales, esto es una relación 1:N (Uno a Muchos).
     * * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function events() {
        // Traducción literal: "Esta categoría tiene muchos eventos"
        return $this->hasMany(Event::class);
    }
}