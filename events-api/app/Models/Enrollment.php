<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'event_id', 'status']; 
    // Nota: Si tu tabla 'enrollments' no tiene columna 'status', quítalo de aquí.

    // Relación: Una inscripción pertenece a un Usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación: Una inscripción pertenece a un Evento
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}