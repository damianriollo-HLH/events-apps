<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // IMPORTANTE: El motor de los Tokens

/**
 * =========================================================================
 * MODELO: USER (Usuarios del Sistema)
 * =========================================================================
 * ¿Para qué sirve?: Es la entidad más importante de seguridad. Representa 
 * a cualquier persona registrada en la plataforma (tanto clientes como admins).
 * * Conceptos clave para la defensa:
 * - Hereda de 'Authenticatable', no de 'Model', lo que le da poderes de login.
 * - Usa Sanctum para la generación de Tokens (API).
 */
class User extends Authenticatable
{
    /** * HasApiTokens: Permite emitir "pulseras VIP" (Tokens) para React.
     * HasFactory: Permite usar Seeders para generar usuarios falsos.
     * Notifiable: Permite enviar correos electrónicos (ej: EventCreatedNotification).
     */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * ---------------------------------------------------------------------
     * 1. ASIGNACIÓN MASIVA ($fillable)
     * ---------------------------------------------------------------------
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'image',
        'email_notifications',
        'is_admin', // Define si es un administrador del sistema
    ];

    /**
     * ---------------------------------------------------------------------
     * 2. PROTECCIÓN DE DATOS SENSIBLES ($hidden)
     * ---------------------------------------------------------------------
     * Los atributos que deben ocultarse automáticamente cuando Laravel
     * convierte este usuario en un JSON para enviarlo a React.
     */
    protected $hidden = [
        'password', // JAMÁS se envía la contraseña al frontend
        'remember_token',
    ];

    /**
     * ---------------------------------------------------------------------
     * 3. CONVERSIONES DE TIPOS ($casts)
     * ---------------------------------------------------------------------
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            // Le dice a Laravel que encripte/desencripte la contraseña automáticamente usando Hash
            'password' => 'hashed', 
        ];
    }

    /**
     * ---------------------------------------------------------------------
     * 4. RELACIONES DEL USUARIO
     * ---------------------------------------------------------------------
     */

    // 1:N - Un usuario puede CREAR/ORGANIZAR muchos eventos
    public function events() {
        return $this->hasMany(Event::class);
    }

    // 1:N - Un usuario puede realizar muchas INSCRIPCIONES (Apuntarse)
    public function enrollments() {
        return $this->hasMany(Enrollment::class);
    }
    
    // N:M - Eventos a los que el usuario dio LIKE (Favoritos)
    public function likedEvents() {
        return $this->belongsToMany(Event::class, 'likes', 'user_id', 'event_id')->withTimestamps();
    }
    
    // N:M - Eventos a los que el usuario ASISTE directamente
    // Cruza la tabla enrollments para darnos directamente los objetos Event
    public function eventsAttending()
    {
        return $this->belongsToMany(Event::class, 'enrollments')
                    ->withPivot('quantity')
                    ->withTimestamps();
    }
    
    // 1:N - Un usuario puede ESCRIBIR muchos comentarios
    public function comments() {
        return $this->hasMany(Comment::class);
    }
}