<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Relación con Users
        $table->foreignId('category_id')->constrained()->onDelete('cascade'); // Relación con Categories
        
        $table->string('title');
        $table->string('slug')->nullable();
        $table->text('description');
        $table->string('poster_url')->nullable();
        
        $table->dateTime('start_at');
        $table->dateTime('end_at');
        
        $table->integer('capacity')->default(0);
        $table->decimal('price', 8, 2)->default(0);
        $table->string('status')->default('draft');
        
        // Ubicación
        $table->string('location_name')->nullable();
        $table->string('address')->nullable();
        $table->string('city')->nullable();
        $table->string('province')->nullable();
        $table->string('postal_code')->nullable();
        $table->string('country')->nullable();
        $table->decimal('lat', 10, 8)->nullable(); // Latitud
        $table->decimal('lng', 11, 8)->nullable(); // Longitud
        
        // Valoraciones
        $table->decimal('avg_rating', 3, 2)->default(0);
        $table->unsignedInteger('ratings_count')->default(0);

        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
