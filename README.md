# 🎟️ CaraLibre - Plataforma de Gestión de Eventos

![Estado del Proyecto](https://img.shields.io/badge/Estado-Finalizado-success)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)
![Laravel](https://img.shields.io/badge/Backend-Laravel_10-FF2D20?logo=laravel)
![MySQL](https://img.shields.io/badge/Base_de_Datos-MySQL-4479A1?logo=mysql)

**CaraLibre** es una plataforma web moderna e interactiva diseñada para descubrir, crear y compartir eventos únicos. Construida con una arquitectura Full Stack, permite a los usuarios gestionar sus asistencias, interactuar con la comunidad y organizar sus propios eventos con una experiencia de usuario (UX) fluida y atractiva.

---

## 🚀 Características Principales

- **🧑‍💻 Autenticación Segura:** Sistema de login y registro protegido con tokens JWT.
- **🗺️ Geolocalización Interactiva:** Integración con **Leaflet** y OpenStreetMap para seleccionar ubicaciones en un mapa interactivo con geocodificación inversa (convierte coordenadas en calles).
- **📱 Diseño Responsivo y Moderno:** Interfaz de usuario (UI) maquetada con **Bootstrap 5**, utilizando un patrón de diseño "Bento Grid" y notificaciones asíncronas no bloqueantes (`react-hot-toast`).
- **💬 Interacción Social:** Sistema de comentarios en tiempo real y valoración de eventos por estrellas.
- **❤️ Favoritos y Dashboard:** Panel de control personalizado para ver eventos próximos, asistidos, organizados y guardados.
- **🛡️ Validación Full Stack:** Protección de rutas en el Frontend y validación estricta de datos (HTTP 422) en el Backend.

---

## 🛠️ Tecnologías Utilizadas

### Frontend (Cliente)
- **React.js** (v18)
- **React Router Dom** (Navegación SPA)
- **Bootstrap 5** (Framework CSS)
- **React-Leaflet** (Mapas)
- **React-Hot-Toast** (Notificaciones)

### Backend (Servidor)
- **PHP / Laravel** (Framework MVC API REST)
- **MySQL / MariaDB** (Base de datos relacional)
- **Laravel Sanctum** (Autenticación API)

---

## ⚙️ Instalación y Configuración Local

Sigue estos pasos para desplegar el proyecto en tu entorno local. Es necesario tener instalados [Node.js](https://nodejs.org/), [Composer](https://getcomposer.org/) y [XAMPP](https://www.apachefriends.org/) (o similar).

1. Configuración del Backend (Laravel)
```bash
# Entra en la carpeta del backend
cd events-api

# Instala las dependencias de PHP
composer install

# Copia el archivo de entorno y genera la clave de la aplicación
cp .env.example .env
php artisan key:generate

# Configura tu base de datos en el archivo .env (DB_DATABASE=events_app)
# Luego, ejecuta las migraciones y los seeders para rellenar datos de prueba
php artisan migrate:fresh --seed

# Enciende el servidor local (por defecto en [http://127.0.0.1:8000](http://127.0.0.1:8000))
php artisan serve

2. Configuración del Frontend (React)
# Abre una nueva terminal y entra en la carpeta del frontend
cd events-web

# Instala las dependencias de Node
npm install

# Enciende el servidor de desarrollo
npm start

---
### La aplicación estará disponible en http://localhost:3000.
---

👤 Usuario de Prueba
Para probar las funcionalidades de administrador del panel, puedes utilizar las siguientes credenciales generadas por los Seeders:

Email: admin@admin.com

Contraseña: 12345678

---

👨‍💻 Autor
Desarrollado por Damián Riollo como Proyecto Final de Desarrollo de Aplicaciones Web (DAW).
IES Villa de Aspe