<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    /**
     * Los atributos que se pueden asignar masivamente.
     * Deben coincidir con las columnas de tu tabla en phpMyAdmin.
     */
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'description',
        'poster_url',
        'start_at',
        'end_at',
        'capacity',
        'price',
        'status',
        'location_name',
        'address',
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
     * Conversiones automáticas de tipos de datos.
     * Esto ayuda a que Laravel trate las fechas como objetos de fecha y no texto.
     */
    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'price' => 'decimal:2',
    ];

    // --- RELACIONES ---

    // Un evento pertenece a un Usuario (el creador)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Un evento pertenece a una Categoría
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Un evento tiene muchas inscripciones (gente apuntada)
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    // Un evento tiene muchos comentarios
    public function comments()
    {
        // Los ordenamos para que salgan primero los más nuevos
        return $this->hasMany(Comment::class)->orderBy('created_at', 'desc');
    }
    public function likes()
    {
        return $this->belongsToMany(User::class, 'likes', 'event_id', 'user_id')->withTimestamps();
    }
    // Relación: Un evento tiene muchas valoraciones
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    // Atributo virtual para saber si el usuario logueado le dio like
    // Se usa: $event->is_liked
    public function getIsLikedAttribute()
    {
        if (auth('sanctum')->check()) {
            return $this->likes()->where('user_id', auth('sanctum')->id())->exists();
        }
        return false;
    }
    
    // Contar likes
    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }
    
    // IMPORTANTE: Añade 'is_liked' y 'likes_count' al array $appends si quieres que salga siempre en el JSON
    protected $appends = ['is_liked', 'likes_count'];
}