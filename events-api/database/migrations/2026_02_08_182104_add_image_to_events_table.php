<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('events', function (Blueprint $table) {
            // Añadimos la columna 'image' que puede estar vacía (nullable)
            // La ponemos después de la descripción para ser ordenados
            $table->string('image')->nullable()->after('description');
        });
    }

    public function down()
    {
        Schema::table('events', function (Blueprint $table) {
            // Si deshacemos la migración, borramos la columna
            $table->dropColumn('image');
        });
    }
};
