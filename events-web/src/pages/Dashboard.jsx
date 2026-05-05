import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Componente Dashboard: Panel de control del usuario.
 * Arquitectura UI: Bento Grid Pattern.
 * Preparado para Dark Mode nativo.
 * * @returns {JSX.Element}
 */
function Dashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user_name');
    
    if (!token) {
        navigate('/login');
        return;
    }
    setUserName(user);

    const headers = { 'Authorization': `Bearer ${token}` };

    // Hacemos las dos peticiones en paralelo para no bloquear la UI
    Promise.all([
        fetch('http://127.0.0.1:8000/api/my-enrollments', { headers }),
        fetch('http://127.0.0.1:8000/api/my-events', { headers })
    ])
    .then(async ([resEnroll, resEvents]) => {
        const dataEnroll = await resEnroll.json();
        const dataEvents = await resEvents.json();
        
        setEnrollments(dataEnroll);
        setMyEvents(dataEvents);
        setLoading(false);
    })
    .catch(err => console.error("Error cargando dashboard:", err));

  }, [navigate]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
        <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="container py-4 mb-5">
      
      {/* ================================================= */}
      {/* 1. CABECERA: BENTO GRID DE BIENVENIDA Y ESTADÍSTICAS */}
      {/* ================================================= */}
      <div className="row g-4 mb-5">
        
        {/* Caja Bento 1: Mensaje de Bienvenida (Ocupa la mitad en PC, todo en móvil) */}
        <div className="col-12 col-lg-6">
            <div className="bento-card h-100 p-4 p-md-5 d-flex flex-column justify-content-center bg-primary text-white border-0 shadow-lg" style={{ borderRadius: 'var(--bento-radius-lg)' }}>
                <h2 className="fw-bold mb-2">👋 Hola, {userName}</h2>
                <p className="fs-5 opacity-75 mb-0">Aquí tienes el resumen visual de tu actividad en CaraLibre.</p>
            </div>
        </div>

        {/* Caja Bento 2: Estadística de Entradas (Ocupa un cuarto en PC) */}
        <div className="col-6 col-lg-3">
            <div className="bento-card h-100 p-4 d-flex flex-column justify-content-center align-items-center bg-body-tertiary">
                <h3 className="display-4 fw-bold text-primary mb-1">{enrollments.length}</h3>
                <span className="text-muted fw-semibold text-uppercase text-center" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                    Mis Entradas
                </span>
            </div>
        </div>

        {/* Caja Bento 3: Estadística de Eventos Creados (Ocupa un cuarto en PC) */}
        <div className="col-6 col-lg-3">
            <div className="bento-card h-100 p-4 d-flex flex-column justify-content-center align-items-center bg-body-tertiary">
                <h3 className="display-4 fw-bold text-success mb-1">{myEvents.length}</h3>
                <span className="text-muted fw-semibold text-uppercase text-center" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                    Eventos Creados
                </span>
            </div>
        </div>

      </div>

      {/* ================================================= */}
      {/* 2. CONTENIDO PRINCIPAL: LISTAS BENTO */}
      {/* ================================================= */}
      <div className="row g-4">
        
        {/* COLUMNA IZQUIERDA: MIS INSCRIPCIONES (ENTRADAS) */}
        <div className="col-lg-6">
            <div className="bento-card h-100 d-flex flex-column">
                <div className="p-4 border-bottom border-light-subtle d-flex justify-content-between align-items-center">
                    <h4 className="fw-bold text-primary m-0">🎟 Mis Entradas</h4>
                </div>
                
                <div className="p-4 flex-grow-1 bg-body">
                    {enrollments.length === 0 ? (
                        <div className="text-center py-5 bg-body-tertiary rounded-4">
                            <span style={{fontSize: '3rem'}}>🎫</span>
                            <p className="mt-3 text-muted">Aún no tienes planes.</p>
                            <Link to="/" className="btn btn-outline-primary btn-sm rounded-pill">Explorar Eventos</Link>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {enrollments.map(event => (
                                /* Sub-tarjeta para cada evento, usa bg-body-tertiary para asegurar contraste en modo oscuro */
                                <div key={event.id} className="p-3 bg-body-tertiary rounded-4 hover-effect transition-all border border-light-subtle">
                                    <div className="d-flex align-items-center gap-3">
                                        
                                        {/* Fecha Calendario */}
                                        <div className="text-center bg-body p-2 rounded-3 shadow-sm border border-light-subtle" style={{minWidth: '65px'}}>
                                            <small className="d-block text-uppercase fw-bold text-danger" style={{fontSize: '11px'}}>
                                                {new Date(event.start_at).toLocaleString('default', { month: 'short' })}
                                            </small>
                                            <strong className="d-block fs-4 lh-1 text-body">
                                                {new Date(event.start_at).getDate()}
                                            </strong>
                                        </div>
                                        
                                        {/* Info */}
                                        <div className="flex-grow-1 overflow-hidden">
                                            <h6 className="fw-bold mb-1 text-truncate text-body">{event.title}</h6>
                                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                                <small className="text-muted text-truncate" style={{maxWidth: '120px'}}>
                                                    📍 {event.location ? event.location.split(' | ')[0] : 'Online'}
                                                </small>
                                                <span className="badge bg-primary rounded-pill">
                                                    🎟 {event.pivot ? event.pivot.quantity : 1} Entradas
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Botón */}
                                        <Link to={`/event/${event.id}`} className="btn btn-sm text-primary fw-bold text-nowrap">
                                            Ver ➔
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: EVENTOS QUE ORGANIZO */}
        <div className="col-lg-6">
            <div className="bento-card h-100 d-flex flex-column">
                <div className="p-4 border-bottom border-light-subtle d-flex justify-content-between align-items-center">
                    <h4 className="fw-bold text-success m-0">📅 Eventos Organizados</h4>
                    <Link to="/create-event" className="btn btn-sm btn-success rounded-pill fw-bold px-3">+ Nuevo</Link>
                </div>
                
                <div className="p-4 flex-grow-1 bg-body">
                    {myEvents.length === 0 ? (
                        <div className="text-center py-5 bg-body-tertiary rounded-4">
                            <span style={{fontSize: '3rem'}}>✨</span>
                            <p className="mt-3 text-muted">No has creado ningún evento.</p>
                            <Link to="/create-event" className="btn btn-success btn-sm rounded-pill">Crear el primero</Link>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {myEvents.map(event => (
                                <div key={event.id} className="d-flex align-items-center justify-content-between p-3 bg-body-tertiary rounded-4 hover-effect transition-all border border-light-subtle">
                                    <div className="d-flex align-items-center gap-3 overflow-hidden">
                                        <img 
                                            src={event.image || "https://placehold.co/100"} 
                                            alt="thumb" 
                                            className="rounded-3 shadow-sm" 
                                            style={{width: '60px', height: '60px', objectFit: 'cover'}}
                                        />
                                        <div className="overflow-hidden">
                                            <h6 className="fw-bold mb-1 text-body text-truncate">{event.title}</h6>
                                            <small className="text-success fw-bold">${parseFloat(event.price) === 0 ? 'GRATIS' : event.price}</small>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex gap-2 ms-2">
                                        <Link to={`/event/${event.id}`} className="btn btn-sm btn-outline-secondary rounded-circle" style={{width: '32px', height: '32px', padding: '3px 0'}} title="Ver">
                                            👁️
                                        </Link>
                                        <Link to={`/event/edit/${event.id}`} className="btn btn-sm btn-outline-primary rounded-circle" style={{width: '32px', height: '32px', padding: '3px 0'}} title="Editar">
                                            ✏️
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;