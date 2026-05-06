<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta las migraciones.
     * Añadimos el campo external_link para los link de venta de entrada.
     * 
     * @return void
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Se añade después del campo 'price' para mantener un orden lógico.
            // Es nullable porque los eventos gratuitos podrían no necesitar enlace externo.
            $table->string('external_link')->nullable()->after('price');
        });
    }

    /**
     * Revierte las migraciones.
     * 
     * @return void
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('external_link');
        });
    }
};