<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Enrollment;

/**
 * =========================================================================
 * MODELO: EVENT (El corazón del proyecto)
 * =========================================================================
 * ¿Para qué sirve?: Representa la tabla 'events' de la base de datos.
 * Es la entidad principal de CaraLibre, alrededor de la cual giran todas 
 * las demás tablas (usuarios, categorías, comentarios, valoraciones).
 */
class Event extends Model
{
    use HasFactory;

    /**
     * ---------------------------------------------------------------------
     * 1. PROTECCIÓN DE ASIGNACIÓN MASIVA ($fillable)
     * ---------------------------------------------------------------------
     * La "lista blanca" de columnas que podemos rellenar de golpe cuando
     * recibimos datos desde el formulario de creación en React.
     */
    protected $fillable = [
        'user_id',
        'category_id',
        'is_featured',
        'title',
        'slug',
        'description',
        'poster_url',
        'start_at',
        'end_at',
        'capacity',
        'location',
        'image',
        'price',
        'external_link',
        'status',
        'address',
        'location_name',
        'city',
        'province',
        'postal_code',
        'country',
        'lat',
        'lng',
        'avg_rating',     // Para guardar la media de estrellas
        'ratings_count',  // Para saber cuántos votos tiene
    ];

    /**
     * ---------------------------------------------------------------------
     * 2. CONVERSIONES AUTOMÁTICAS ($casts)
     * ---------------------------------------------------------------------
     * Convierte los datos que vienen crudos de la base de datos (texto) 
     * en tipos de datos de PHP mucho más útiles para trabajar.
     */
    protected $casts = [
        // Convierte las fechas de texto ('2026-05-11 10:00:00') en objetos "Carbon".
        // Esto permite hacer cosas en PHP como: $evento->start_at->diffForHumans()
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        // Se asegura de que el precio se trate matemáticamente con 2 decimales, no como un texto.
        'price' => 'decimal:2',
    ];

    /**
     * ---------------------------------------------------------------------
     * 3. RELACIONES (1:N y N:M)
     * ---------------------------------------------------------------------
     */

    // Un evento pertenece a un Usuario (el creador/organizador)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Un evento pertenece a una Categoría temática
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Un evento tiene MUCHAS inscripciones (modelo pivot explícito)
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    // Un evento tiene MUCHOS comentarios.
    // TRUCO: Le indicamos que por defecto los traiga ordenados del más nuevo al más viejo.
    public function comments()
    {
        return $this->hasMany(Comment::class)->orderBy('created_at', 'desc');
    }

    // Un evento tiene MUCHAS valoraciones (Estrellas)
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    // ---------------------------------------------------------------------
    // RELACIONES DE MUCHOS A MUCHOS (Tablas Pivote Directas)
    // ---------------------------------------------------------------------

    // A un evento le pueden dar LIKE muchos usuarios. (Se usa la tabla 'likes')
    public function likes()
    {
        return $this->belongsToMany(User::class, 'likes', 'event_id', 'user_id')->withTimestamps();
    }

    // A un evento asisten MUCHOS usuarios.
    // Aunque tenemos la relación 'enrollments' (hasMany), esta relación directa (belongsToMany)
    // nos permite saltarnos la tabla intermedia y acceder directamente a los datos del usuario.
    public function users()
    {
        // ->withPivot('quantity') permite sacar datos extra que estén en la tabla de unión.
        return $this->belongsToMany(User::class, 'enrollments')
                    ->withPivot('quantity') 
                    ->withTimestamps();
    }

    /**
     * ---------------------------------------------------------------------
     * 4. ATRIBUTOS VIRTUALES (Accessors & Appends)
     * ---------------------------------------------------------------------
     * Son "columnas fantasma". No existen en la base de datos real, pero 
     * Laravel las calcula sobre la marcha y las mete en el JSON para React.
     */

    // Atributo virtual para saber si el usuario logueado le dio like a este evento.
    // En React se leerá simplemente como: event.is_liked
    public function getIsLikedAttribute()
    {
        if (auth('sanctum')->check()) {
            return $this->likes()->where('user_id', auth('sanctum')->id())->exists();
        }
        return false;
    }
    
    // Atributo virtual para obtener el número total de likes
    // En React se leerá como: event.likes_count
    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }
    
    // IMPORTANTE: $appends es la orden que le dice a Laravel: 
    // "Cada vez que envíes un Evento a React, adjúntale estas columnas fantasma".
    protected $appends = ['is_liked', 'likes_count'];
}