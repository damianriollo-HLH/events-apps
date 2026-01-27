<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    // Campos permitidos para guardar masivamente
    protected $fillable = ['content', 'user_id', 'event_id'];

    // Relación: Un comentario pertenece a un Usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación: Un comentario pertenece a un Evento
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}