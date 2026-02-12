import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

    // Hacemos las dos peticiones en paralelo
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
    .catch(err => console.error(err));

  }, [navigate]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
        <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="container py-4">
      
      {/* 1. CABECERA CON BIENVENIDA Y ESTADÍSTICAS */}
      <div className="row mb-5 align-items-center">
        <div className="col-md-6">
            <h2 className="fw-bold mb-0">👋 Hola, {userName}</h2>
            <p className="text-muted">Aquí tienes el resumen de tu actividad.</p>
        </div>
        <div className="col-md-6">
            <div className="row g-3">
                {/* Tarjeta Estadística 1 */}
                <div className="col-6">
                    <div className="card shadow-sm border-0 bg-primary text-white p-3 text-center">
                        <h3 className="fw-bold mb-0">{enrollments.length}</h3>
                        <small>Entradas</small>
                    </div>
                </div>
                {/* Tarjeta Estadística 2 */}
                <div className="col-6">
                    <div className="card shadow-sm border-0 bg-success text-white p-3 text-center">
                        <h3 className="fw-bold mb-0">{myEvents.length}</h3>
                        <small>Eventos Creados</small>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="row g-4">
        {/* ================================================= */}
        {/* 2. COLUMNA IZQUIERDA: MIS INSCRIPCIONES (ENTRADAS) */}
        {/* ================================================= */}
        <div className="col-lg-6">
            <div className="card shadow border-0 h-100">
                <div className="card-header bg-white border-0 pt-4 px-4">
                    <h4 className="fw-bold text-primary">🎟 Mis Entradas</h4>
                </div>
                <div className="card-body px-4 pb-4">
                    {enrollments.length === 0 ? (
                        <div className="text-center py-5 bg-light rounded-3">
                            <span style={{fontSize: '3rem'}}>🎫</span>
                            <p className="mt-3 text-muted">Aún no tienes planes.</p>
                            <Link to="/" className="btn btn-outline-primary btn-sm">Explorar Eventos</Link>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {enrollments.map(event => (
                                <div key={event.id} className="card border-0 shadow-sm p-3 hover-effect" style={{backgroundColor: '#f8f9fa'}}>
                                    <div className="d-flex align-items-center gap-3">
                                        {/* Fecha Calendario */}
                                        <div className="text-center bg-white p-2 rounded shadow-sm" style={{minWidth: '60px'}}>
                                            <small className="d-block text-uppercase fw-bold text-danger" style={{fontSize: '10px'}}>
                                                {new Date(event.start_at).toLocaleString('default', { month: 'short' })}
                                            </small>
                                            <strong className="d-block fs-4 lh-1">
                                                {new Date(event.start_at).getDate()}
                                            </strong>
                                        </div>
                                        
                                        {/* Info */}
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-1">{event.title}</h6>
                                            <small className="text-muted">📍 {event.location || 'Online'}</small>
                                        </div>
                                        
                                        {/* Botón */}
                                        <Link to={`/event/${event.id}`} className="btn btn-sm btn-light text-primary">
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

        {/* ================================================= */}
        {/* 3. COLUMNA DERECHA: EVENTOS QUE ORGANIZO */}
        {/* ================================================= */}
        <div className="col-lg-6">
            <div className="card shadow border-0 h-100">
                <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                    <h4 className="fw-bold text-success">📅 Eventos Organizados</h4>
                    <Link to="/create-event" className="btn btn-sm btn-success">+ Nuevo</Link>
                </div>
                <div className="card-body px-4 pb-4">
                    {myEvents.length === 0 ? (
                        <div className="text-center py-5 bg-light rounded-3">
                            <span style={{fontSize: '3rem'}}>✨</span>
                            <p className="mt-3 text-muted">No has creado ningún evento.</p>
                            <Link to="/create-event" className="btn btn-success btn-sm">Crear el primero</Link>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {myEvents.map(event => (
                                <div key={event.id} className="d-flex align-items-center justify-content-between p-3 bg-white rounded shadow-sm border hover-effect">
                                    <div className="d-flex align-items-center gap-3">
                                        <img 
                                            src={event.image || "https://placehold.co/100"} 
                                            alt="thumb" 
                                            className="rounded" 
                                            style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                        />
                                        <div>
                                            <h6 className="fw-bold mb-0 text-dark">{event.title}</h6>
                                            <small className="text-success fw-bold">${event.price}</small>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex gap-2">
                                        <Link to={`/event/${event.id}`} className="btn btn-sm btn-outline-secondary" title="Ver">
                                            👁️
                                        </Link>
                                        <Link to={`/event/edit/${event.id}`} className="btn btn-sm btn-outline-primary" title="Editar">
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