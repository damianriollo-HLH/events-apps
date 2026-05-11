<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * =========================================================================
 * MODELO: LIKE (Favoritos / Me Gusta)
 * =========================================================================
 * ¿Para qué sirve?: Representa la tabla pivote 'likes' en la base de datos.
 * Resuelve la relación de Muchos a Muchos (N:M) entre Usuarios y Eventos
 * para el sistema de favoritos.
 */
class Like extends Model
{
    // Permite usar "Factories" para generar "me gustas" falsos en pruebas
    use HasFactory;

    /**
     * ---------------------------------------------------------------------
     * 1. PROTECCIÓN DE ASIGNACIÓN MASIVA
     * ---------------------------------------------------------------------
     * Lista blanca de campos. Evita que un usuario malintencionado pueda 
     * inyectar columnas no deseadas si usamos Like::create().
     */
    protected $fillable = [
        'user_id',
        'event_id'
    ];

    /**
     * ---------------------------------------------------------------------
     * 2. RELACIONES DE BASE DE DATOS (Claves Foráneas)
     * ---------------------------------------------------------------------
     */

    /**
     * Relación: Un "Like" pertenece a un Usuario específico.
     * La tabla 'likes' tiene la columna 'user_id' que apunta a la tabla 'users'.
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user() {
        return $this->belongsTo(User::class);
    } 

    /**
     * Relación: Un "Like" pertenece a un Evento específico.
     * La tabla 'likes' tiene la columna 'event_id' que apunta a la tabla 'events'.
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function event() {
        return $this->belongsTo(Event::class);
    }
}