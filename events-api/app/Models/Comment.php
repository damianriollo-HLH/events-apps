<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * =========================================================================
 * MODELO: COMMENT (Comentarios de los Eventos)
 * =========================================================================
 * ¿Para qué sirve?: Representa la tabla 'comments' en la base de datos.
 * Actúa como el puente que conecta a un usuario con un evento a través 
 * de un mensaje de texto.
 */
class Comment extends Model
{
    // Permite usar "Factories" para generar comentarios falsos de prueba
    use HasFactory;

    /**
     * ---------------------------------------------------------------------
     * 1. PROTECCIÓN DE ASIGNACIÓN MASIVA
     * ---------------------------------------------------------------------
     * Especificamos qué campos pueden ser rellenados directamente usando 
     * el método create() en el controlador.
     */
    protected $fillable = [
        'content', 
        'user_id', 
        'event_id'
    ];

    /**
     * ---------------------------------------------------------------------
     * 2. RELACIONES DE BASE DE DATOS (Las Claves Foráneas)
     * ---------------------------------------------------------------------
     */

    /**
     * Relación: Un comentario pertenece a un Usuario (Autor).
     * En SQL, esto significa que nuestra tabla 'comments' tiene una 
     * clave foránea 'user_id' que apunta a la tabla 'users'.
     * * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        // Traducción literal: "Este comentario pertenece a..."
        return $this->belongsTo(User::class);
    }

    /**
     * Relación: Un comentario pertenece a un Evento (El muro donde se publica).
     * En SQL, significa que hay una clave foránea 'event_id' que apunta a 'events'.
     * * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}