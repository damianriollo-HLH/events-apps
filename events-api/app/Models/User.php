<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'image',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Un usuario puede crear muchos eventos
    public function events() {
        return $this->hasMany(Event::class);
    }

    // Un usuario puede inscribirse en muchos eventos
    public function enrollments() {
        return $this->hasMany(Enrollment::class);
    }
    
    // Eventos a los que el usuario dio like
    public function likedEvents() {
        return $this->belongsToMany(Event::class, 'likes', 'user_id', 'event_id')->withTimestamps();
    }
    
    // Un usuario puede tener muchos comentarios
    /* (Este lo dejaremos comentado hasta que creemos el modelo Comment)
    public function comments() {
        return $this->hasMany(Comment::class);
    }
    */
}
