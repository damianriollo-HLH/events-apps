<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Event;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Clase DatabaseSeeder
 * * Se encarga de poblar la base de datos con datos iniciales y de prueba.
 * Define el usuario administrador del sistema, categorías estáticas y
 * genera registros aleatorios para usuarios y eventos.
 */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Ejecuta los seeders de la base de datos.
     *
     * @return void
     */
    public function run(): void
    {
        // 1. CREACIÓN DEL USUARIO ADMINISTRADOR PRINCIPAL
        // Usamos updateOrCreate para evitar duplicados si el seeder se ejecuta varias veces
        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('12345678'), // Contraseña establecida para pruebas
                'is_admin' => true, // <-- CRÍTICO: Bandera booleana para acceso a paneles de administración
            ]
        );

        // 2. CREACIÓN DE USUARIOS DE PRUEBA
        // Genera 10 usuarios estándar utilizando el Model Factory
        User::factory(10)->create();

        // 3. CREACIÓN DE CATEGORÍAS DEL SISTEMA
        // Definimos un array estático para asegurar que la plataforma siempre tenga estas opciones reales
        $nombresCategorias = [
            'Música y Conciertos',
            'Tecnología',
            'Deportes',
            'Arte y Cultura',
            'Gastronomía',
            'Entretenimiento'
        ];

        // Colección para almacenar las categorías creadas y pasarlas al factory de eventos
        $categorias = collect();

        foreach ($nombresCategorias as $nombre) {
            $categorias->push(Category::firstOrCreate(['name' => $nombre]));
        }

        // 4. CREACIÓN DE EVENTOS DE PRUEBA-DEMOSTRACIÓN (Para capturas y presentación)
        // 1. OBTENER LOS USUARIOS PARA EL REPARTO
        $admin = User::where('email', 'admin@admin.com')->first();
        $usuariosFactory = User::where('email', '!=', 'admin@admin.com')->take(2)->get();
        $user1 = $usuariosFactory[0];
        $user2 = $usuariosFactory[1];

// 2. DEFINICIÓN DE LOS 18 EVENTOS
        $eventosDemo = [
            // --- USER 1 (5 Eventos) ---
            [
                'title' => 'Tardeo Indie Aspe',
                'description' => 'Música en directo en el corazón de Aspe. Bandas locales y el mejor ambiente.',
                'start_at' => '2026-05-10 17:00:00',
                'end_at' => '2026-05-10 23:59:00',
                'location' => 'Aspe | Plaza Mayor',
                'price' => 15.00,
                'capacity' => 300,
                'category_id' => 1, 
                'image' => 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&auto=format&fit=crop',
                'user_id' => $user1->id,
                'external_link' => 'https://www.ticketmaster.es'
            ],
            [
                'title' => 'Masterclass IA y React',
                'description' => 'Aprende a integrar modelos de IA en tus aplicaciones de React. Nivel intermedio.',
                'start_at' => '2026-05-12 10:00:00',
                'end_at' => '2026-05-12 14:00:00', // <-- AÑADIDO
                'location' => 'Alicante | Distrito Digital',
                'price' => 45.00,
                'capacity' => 50,
                'category_id' => 2, 
                'image' => 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=800&auto=format&fit=crop',
                'user_id' => $user1->id,
                'external_link' => 'https://www.eventbrite.es'
            ],
            [
                'title' => 'Torneo Tenis Mesa Aspe',
                'description' => 'Abierto de tenis de mesa para todas las edades en el pabellón municipal.',
                'start_at' => '2026-05-13 16:30:00',
                'end_at' => '2026-05-13 20:30:00',
                'location' => 'Aspe | Pabellón Deportivo',
                'price' => 0.00,
                'capacity' => 100,
                'category_id' => 3, 
                'image' => 'https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=800&auto=format&fit=crop',
                'user_id' => $user1->id,
            ],
            [
                'title' => 'Ruta Modernista Novelda',
                'description' => 'Visita guiada por los edificios más emblemáticos del modernismo noveldense.',
                'start_at' => '2026-05-14 11:00:00',
                'end_at' => '2026-05-14 13:00:00', 
                'location' => 'Novelda | Casa Museo Modernista',
                'price' => 0.00,
                'capacity' => 25,
                'category_id' => 4, 
                'image' => 'https://images.unsplash.com/photo-1518998053574-53f1f61f93ea?q=80&w=800&auto=format&fit=crop',
                'user_id' => $user1->id,
            ],
            [
                'title' => 'Cata de Vinos del Vinalopó',
                'description' => 'Degustación de vinos locales acompañados de quesos y embutidos de la zona.',
                'start_at' => '2026-05-15 20:00:00',
                'end_at' => '2026-05-15 23:00:00', 
                'location' => 'Aspe | Bodega Tradicional',
                'price' => 25.00,
                'capacity' => 40,
                'category_id' => 5, 
                'image' => 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop',
                'user_id' => $user1->id,
                'external_link' => 'https://www.ticketmaster.es'
            ],

            // --- USER 2 (5 Eventos) ---
            [
                'title' => 'Monólogo: Risas en el Puerto',
                'description' => 'Noche de comedia frente al mar con los mejores cómicos del circuito nacional.',
                'start_at' => '2026-05-16 22:00:00',
                'end_at' => '2026-05-16 23:59:00',
                'location' => 'Alicante | Puerto de Alicante',
                'price' => 0.00,
                'capacity' => 200,
                'category_id' => 6, 
                'image' => 'https://images.unsplash.com/photo-1514525253361-bee8718a300c?q=80&w=800&auto=format&fit=crop',
                'user_id' => $user2->id,
            ],
            [
                'title' => 'Jazz en el Casino',
                'description' => 'Velada de Jazz clásico en el salón principal del Casino de Novelda.',
                'start_at' => '2026-05-17 19:30:00',
                'end_at' => '2026-05-17 22:30:00', 
                'location' => 'Novelda | Casino de Novelda',
                'price' => 12.00,
                'capacity' => 80,
                'category_id' => 1, 
                'image' => 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&auto=format&fit=crop',
                'user_id' => $user2->id,
                'external_link' => 'https://www.ticketmaster.es'
            ],
            [
                'title' => 'Workshop: Seguridad en la Red',
                'description' => 'Taller práctico sobre cómo proteger tus datos personales y dispositivos.',
                'start_at' => '2026-05-11 17:00:00',
                'end_at' => '2026-05-11 19:00:00',
                'location' => 'Novelda | Centro Cívico',
                'price' => 10.00,
                'capacity' => 30,
                'category_id' => 2, 
                'image' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
                'user_id' => $user2->id,
                'external_link' => 'https://www.eventbrite.es'
            ],
            [
                'title' => 'Yoga al Aire Libre',
                'description' => 'Sesión de Yoga matinal para empezar la semana con energía y paz.',
                'start_at' => '2026-05-12 08:30:00',
                'end_at' => '2026-05-12 10:00:00', 
                'location' => 'Aspe | Parque La Coca',
                'price' => 0.00,
                'capacity' => 50,
                'category_id' => 3, 
                'image' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
                'user_id' => $user2->id,
            ],
            [
                'title' => 'Expo Fotografía "Mar y Sal"',
                'description' => 'Inauguración de la exposición fotográfica sobre las salinas y el litoral alicantino.',
                'start_at' => '2026-05-13 19:00:00',
                'end_at' => '2026-05-13 21:00:00', 
                'location' => 'Alicante | MACA',
                'price' => 5.00,
                'capacity' => 150,
                'category_id' => 4, 
                'image' => 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=800&auto=format&fit=crop',
                'user_id' => $user2->id,
                'external_link' => 'https://www.ticketmaster.es'
            ],

            // --- ADMIN (8 Eventos) ---
            [
                'title' => 'Taller de Arroces Alicantinos',
                'description' => 'Aprende los secretos del auténtico arroz a banda y arroz con costra.',
                'start_at' => '2026-05-14 10:30:00',
                'end_at' => '2026-05-14 14:30:00', 
                'location' => 'Aspe | Escuela Gastronómica',
                'price' => 0.00,
                'capacity' => 15,
                'category_id' => 5, 
                'image' => 'https://images.unsplash.com/photo-1512058560366-cd242959b4fe?q=80&w=800&auto=format&fit=crop',
                'user_id' => $admin->id,
            ],
            [
                'title' => 'Escape Room Exterior Novelda',
                'description' => 'Resuelve los enigmas por las calles de Novelda antes de que se agote el tiempo.',
                'start_at' => '2026-05-15 18:00:00',
                'end_at' => '2026-05-15 20:00:00', 
                'location' => 'Novelda | Centro Urbano',
                'price' => 12.00,
                'capacity' => 40,
                'category_id' => 6, 
                'image' => 'https://images.unsplash.com/photo-1519074063912-ad25b5ce3d69?q=80&w=800&auto=format&fit=crop',
                'user_id' => $admin->id,
                'external_link' => 'https://www.ticketmaster.es'
            ],
            [
                'title' => 'Concierto Órgano Basílica',
                'description' => 'Recital sacro de órgano en la Basílica de Nuestra Señora del Socorro.',
                'start_at' => '2026-05-16 20:30:00',
                'end_at' => '2026-05-16 22:00:00', 
                'location' => 'Aspe | Basílica del Socorro',
                'price' => 0.00,
                'capacity' => 300,
                'category_id' => 1, 
                'image' => 'https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?q=80&w=800&auto=format&fit=crop',
                'user_id' => $admin->id,
            ],
            [
                'title' => 'Feria Tecnológica Juvenil',
                'description' => 'Drones, robótica y videojuegos. Lo último para los más jóvenes.',
                'start_at' => '2026-05-10 11:00:00',
                'end_at' => '2026-05-10 20:00:00', 
                'location' => 'Alicante | Las Cigarreras',
                'price' => 8.00,
                'capacity' => 400,
                'category_id' => 2, 
                'image' => 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800&auto=format&fit=crop',
                'user_id' => $admin->id,
                'external_link' => 'https://www.ticketmaster.es'
            ],
            [
                'title' => 'Ruta Ciclista Sierra de Aspe',
                'description' => 'Salida en grupo para MTB por los senderos más espectaculares de la sierra.',
                'start_at' => '2026-05-11 09:00:00',
                'end_at' => '2026-05-11 13:00:00', 
                'location' => 'Aspe | Salida Pabellón',
                'price' => 5.00,
                'capacity' => 100,
                'category_id' => 3, 
                'image' => 'https://images.unsplash.com/photo-1541625602330-2277a4c4b28d?q=80&w=800&auto=format&fit=crop',
                'user_id' => $admin->id,
                'external_link' => 'https://www.ticketmaster.es'
            ],
            [
                'title' => 'Teatro: Clásicos de Siempre',
                'description' => 'Compañía nacional de teatro presenta una obra clásica adaptada.',
                'start_at' => '2026-05-12 21:00:00',
                'end_at' => '2026-05-12 23:30:00', 
                'location' => 'Novelda | Teatro Principal',
                'price' => 18.00,
                'capacity' => 450,
                'category_id' => 4, 
                'image' => 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=800&auto=format&fit=crop',
                'user_id' => $admin->id,
                'external_link' => 'https://www.ticketmaster.es'
            ],
            [
                'title' => 'Mercado Gastronómico Local',
                'description' => 'Productos de kilómetro cero: miel, aceite, fruta y repostería aspense.',
                'start_at' => '2026-05-13 10:00:00',
                'end_at' => '2026-05-13 18:00:00', 
                'location' => 'Aspe | Plaza de la Constitución',
                'price' => 0.00,
                'capacity' => 1000,
                'category_id' => 5, 
                'image' => 'https://images.unsplash.com/photo-1488459711616-d39715bc1218?q=80&w=800&auto=format&fit=crop',
                'user_id' => $admin->id,
            ],
            [
                'title' => 'Cine de Verano (Pre-estreno)',
                'description' => 'Proyección bajo las estrellas de uno de los éxitos del año.',
                'start_at' => '2026-05-14 22:30:00',
                'end_at' => '2026-05-15 01:00:00', 
                'location' => 'Alicante | Playa del Postiguet',
                'price' => 7.50,
                'capacity' => 500,
                'category_id' => 6, 
                'image' => 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop',
                'user_id' => $admin->id,
                'external_link' => 'https://www.ticketmaster.es'
            ],
        ];

        // 3. INSERTAR EN BASE DE DATOS
        foreach ($eventosDemo as $evento) {
            Event::create($evento);
        }
        // (Opcional) Si quiero eventos de relleno extra después de los bonitos:
        // Event::factory(14)->recycle($categorias)->create();
    }
}