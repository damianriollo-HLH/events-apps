// src/App.js
import { Routes, Route } from 'react-router-dom'; 
import AdminPanel from './pages/AdminPanel';
//Librería que mejora los alert ()
import { Toaster } from 'react-hot-toast';

// --- COMPONENTES DE DISEÑO (LAYOUT) ---
import Navbar from './components/Navbar'; 
import Footer from './components/Footer'; 
import './App.css'; // Estilos globales y variables CSS del Tema

// --- PÁGINAS (VISTAS) ---
import Home from './pages/Home'; 
import CreateEvent from './pages/CreateEvent';
import EventDetail from './pages/EventDetail'; 
import Login from './pages/Login';
import EditEvent from './pages/EditEvent';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Profile from './pages/Profile';

//Página Error 404
import NotFound from './pages/NotFound';

/**
 * Componente Raíz de la Aplicación CaraLibre.
 * Gestiona el Layout principal (Navbar y Footer) y el enrutamiento de las vistas.
 * * @returns {JSX.Element}
 */
function App() {
  return (
    // Fragmento de React: No ensucia el DOM con divs innecesarios
    <>
      {/*Ventana Emergente alert()*/}
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }} 
      />
      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR (Siempre visible) */}
      <Navbar />

      {/* 2. CONTENIDO PRINCIPAL (Cuerpo de la página) */}
      {/* La clase 'main-content' combinada con Flexbox en App.css asegura que el footer no flote */}
      <div className="main-content container mt-4 mb-5">
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />               {/* Página de Inicio */}
          <Route path="/event/:id" element={<EventDetail />} /> {/* Detalle de un evento */}
          <Route path="/login" element={<Login />} />         {/* Formulario de acceso */}
          <Route path="/register" element={<Register />} />   {/* Formulario de registro */}

          {/* RUTAS PRIVADAS (Requieren estar logueado) */}
          <Route path="/dashboard" element={<Dashboard />} />       {/* Panel de control */}
          <Route path="/profile" element={<Profile />} />           {/* Perfil de usuario */}
          <Route path="/create-event" element={<CreateEvent />} />  {/* Crear nuevo evento */}
          <Route path="/event/edit/:id" element={<EditEvent />} />  {/* Editar evento existente */}          
          <Route path="/admin" element={<AdminPanel />} />
          {/*LA RUTA 404 SIEMPRE DEBE SER LA ÚLTIMA */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* 3. PIE DE PÁGINA */}
      <Footer />
    </>
  );
}

export default App;