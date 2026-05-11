<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * =========================================================================
 * MODELO: RATING (Valoraciones / Estrellas)
 * =========================================================================
 * ¿Para qué sirve?: Representa la tabla 'ratings' en la base de datos.
 * Guarda las puntuaciones (de 1 a 5 estrellas) que un usuario le da a un evento.
 */
class Rating extends Model
{
    use HasFactory;

    /**
     * ---------------------------------------------------------------------
     * 1. PROTECCIÓN DE ASIGNACIÓN MASIVA
     * ---------------------------------------------------------------------
     */
    protected $fillable = [
        'user_id', 
        'event_id', 
        'stars'
    ];

    /**
     * ---------------------------------------------------------------------
     * 2. RELACIONES DE BASE DE DATOS
     * ---------------------------------------------------------------------
     */

    // Una valoración pertenece a un Usuario (el que vota)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Una valoración pertenece a un Evento (el que recibe el voto)
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}