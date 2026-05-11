<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * =========================================================================
 * MODELO: ENROLLMENT (Inscripciones / Asistentes)
 * =========================================================================
 * ¿Para qué sirve?: Este modelo representa la "Tabla Intermedia" o "Pivote" 
 * que une a los Usuarios con los Eventos. Resuelve la relación de Muchos a Muchos 
 * (Un usuario va a muchos eventos, un evento tiene muchos usuarios).
 */
class Enrollment extends Model
{
    use HasFactory;

    /**
     * ---------------------------------------------------------------------
     * 1. PROTECCIÓN DE ASIGNACIÓN MASIVA
     * ---------------------------------------------------------------------
     * Campos que podemos rellenar automáticamente al hacer Enrollment::create()
     * 'status' está preparado para futuras integraciones (ej: pending/confirmed con Stripe).
     */
    protected $fillable = [
        'user_id', 
        'event_id', 
        'status'
    ]; 

    /**
     * ---------------------------------------------------------------------
     * 2. RELACIONES DE BASE DE DATOS
     * ---------------------------------------------------------------------
     */

    /**
     * Relación: Una inscripción pertenece a un Usuario específico.
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación: Una inscripción pertenece a un Evento específico.
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}