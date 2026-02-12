import { Routes, Route } from 'react-router-dom'; 

// --- COMPONENTES DE DISEÑO (LAYOUT) ---
import Navbar from './components/Navbar'; 
import Footer from './components/Footer'; // Importamos el nuevo pie de página
import './App.css'; // Estilos globales (fuentes, colores, etc.)

// --- PÁGINAS (VISTAS) ---
import Home from './pages/Home'; 
import CreateEvent from './pages/CreateEvent';
import EventDetail from './pages/EventDetail'; 
import Login from './pages/Login';
import EditEvent from './pages/EditEvent';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Profile from './pages/Profile';

// --- COMPONENTE PRINCIPAL APP ---
function App() {
  return (
    // Usamos un fragmento o div contenedor. 
    // Gracias al CSS en #root, esto ocupará toda la altura.
    <>
      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR (Siempre visible) */}
      <Navbar />

      {/* 2. CONTENIDO PRINCIPAL (Cuerpo de la página) */}
      {/* La clase 'main-content' hace que este bloque crezca para empujar el footer abajo */}
      <div className="main-content container mt-4 mb-5">
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />               {/* Página de Inicio */}
          <Route path="/event/:id" element={<EventDetail />} /> {/* Detalle de un evento */}
          <Route path="/login" element={<Login />} />         {/* Formulario de acceso */}
          <Route path="/register" element={<Register />} />   {/* Formulario de registro */}

          {/* RUTAS PRIVADAS (Requieren estar logueado) */}
          {/* En una app real, aquí usaríamos un componente <ProtectedRoute> */}
          <Route path="/dashboard" element={<Dashboard />} />       {/* Panel de control */}
          <Route path="/profile" element={<Profile />} />           {/* Perfil de usuario */}
          <Route path="/create-event" element={<CreateEvent />} />  {/* Crear nuevo evento */}
          <Route path="/event/edit/:id" element={<EditEvent />} />  {/* Editar evento existente */}
        </Routes>
      </div>

      {/* 3. PIE DE PÁGINA (Siempre al final) */}
      <Footer />
    </>
  );
}

export default App;