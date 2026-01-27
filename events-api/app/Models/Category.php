<?php

namespace App\Models;

// 1. IMPORTANTE: Esta línea debe estar aquí arriba
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    // 2. IMPORTANTE: Esta línea debe estar DENTRO de la clase
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    public function events() {
        return $this->hasMany(Event::class);
    }
}