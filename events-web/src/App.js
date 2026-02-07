import { Routes, Route } from 'react-router-dom'; 
import Navbar from './components/Navbar'; 
import './App.css';

// Importamos las páginas desde sus archivos
import Home from './pages/Home'; 
import CreateEvent from './pages/CreateEvent';
import EventDetail from './pages/EventDetail'; 
import Login from './pages/Login';
import EditEvent from './pages/EditEvent';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';

// --- Componente Principal App ---
function App() {
  return (
    <div>
      {/* NAVBAR COMÚN PARA TODAS LAS PÁGINAS */}
      <Navbar />

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/event/edit/:id" element={<EditEvent />} />
          <Route path="/dashboard" element={<Dashboard />} /> 
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;