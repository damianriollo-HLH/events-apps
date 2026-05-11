import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * =========================================================================
 * COMPONENTE: MY EVENTS (Mis Entradas / Inscripciones)
 * =========================================================================
 * ¿Para qué sirve?: Vista dedicada exclusiva para ver todas las entradas 
 * que ha adquirido el usuario. Sirve como un listado ampliado del widget
 * que aparece en el Dashboard.
 */
function MyEvents() {
  // -----------------------------------------------------------------------
  // 1. ESTADOS (Memoria del componente)
  // -----------------------------------------------------------------------
  const [events, setEvents] = useState([]);     // Array de eventos inscritos
  const [loading, setLoading] = useState(true); // Control del spinner visual
  
  // Variables de entorno de la sesión
  const token = localStorage.getItem('auth_token');
  const navigate = useNavigate();

  // -----------------------------------------------------------------------
  // 2. EFECTO DE CARGA Y PROTECCIÓN DE RUTA
  // -----------------------------------------------------------------------
  useEffect(() => {
    // PROTECCIÓN FRONTEND: Si un usuario anónimo fuerza la URL '/mis-entradas',
    // lo interceptamos antes de que cargue nada y lo mandamos al Login.
    if (!token) {
        navigate('/login');
        return;
    }

    // PETICIÓN A LA API: Pedimos las inscripciones (enrollments) al backend
    fetch('http://127.0.0.1:8000/api/my-enrollments', {
        headers: {
            'Authorization': `Bearer ${token}`, // Identificación segura
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
    })
    .then(data => {
        setEvents(data);   // Guardamos el array de eventos
        setLoading(false); // Apagamos el estado de carga
    })
    .catch(err => {
        console.error("Error cargando mis entradas:", err);
        setLoading(false);
    });
  }, [token, navigate]);

  // -----------------------------------------------------------------------
  // 3. RENDERIZADO CONDICIONAL (UI)
  // -----------------------------------------------------------------------
  
  // A. Estado de Carga
  if (loading) {
      return (
          <div className="d-flex justify-content-center mt-5">
              <div className="spinner-border text-primary" role="status"></div>
          </div>
      );
  }

  return (
    <div className="container my-5" style={{ minHeight: '60vh' }}>
      <h2 className="fw-bold mb-4 text-body">🎟 Mis Entradas</h2>
      
      {/* SWITCH DE RENDERIZADO: ¿Hay entradas o la lista está vacía? */}
      {events.length === 0 ? (
        
        // B. Estado Vacío (Empty State)
        <div className="bento-card p-5 text-center bg-body border border-secondary-subtle rounded-4 shadow-sm">
            <span style={{fontSize: '3rem'}}>🎫</span>
            <h4 className="text-body-secondary mt-3">Aún no tienes entradas</h4>
            <p className="text-muted">Anímate y descubre todo lo que está pasando a tu alrededor.</p>
            <Link to="/" className="btn btn-primary mt-2 rounded-pill fw-bold px-4">¡Explorar eventos!</Link>
        </div>

      ) : (
        
        // C. Estado con Datos (Grid de Tarjetas)
        <div className="row g-4">
            {events.map(event => (
                <div key={event.id} className="col-md-6 col-lg-4">
                    <div className="bento-card h-100 bg-body shadow-sm border border-secondary-subtle rounded-4 d-flex flex-column overflow-hidden hover-effect">
                        
                        {/* Cabecera de la tarjeta con la imagen del evento */}
                        <div style={{ height: '150px', overflow: 'hidden' }}>
                            <img 
                                src={event.image || "https://placehold.co/400x200"} 
                                alt={event.title} 
                                className="w-100 h-100 object-fit-cover"
                            />
                        </div>

                        {/* Cuerpo de la tarjeta */}
                        <div className="p-4 flex-grow-1 d-flex flex-column">
                            <h5 className="fw-bold text-body text-truncate mb-2">{event.title}</h5>
                            
                            <p className="text-body-secondary small mb-3">
                                📅 {new Date(event.start_at).toLocaleDateString()} a las {new Date(event.start_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            
                            {/* mt-auto empuja los elementos inferiores hacia abajo */}
                            <div className="mt-auto">
                                <span className="badge bg-success bg-opacity-10 text-success border border-success mb-3 px-3 py-2 rounded-pill">
                                    Inscrito ✅
                                </span>
                                
                                <Link to={`/event/${event.id}`} className="btn btn-outline-primary w-100 rounded-pill fw-bold">
                                    Ver Detalles
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default MyEvents;