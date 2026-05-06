import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Componente Dashboard
 * Panel de control principal del usuario.
 */
function Dashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userImage, setUserImage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        navigate('/login');
        return;
    }

    setUserName(localStorage.getItem('user_name') || 'Usuario');
    setUserImage(localStorage.getItem('user_image'));
    setUserEmail(localStorage.getItem('user_email') || 'usuario@caralibre.com');

    const headers = { 'Authorization': `Bearer ${token}` };

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
    .catch(err => console.error("Error cargando el Dashboard:", err));

  }, [navigate]);

  const now = new Date();
  const upcomingEnrollments = enrollments.filter(event => new Date(event.start_at) >= now);
  const pastEnrollments = enrollments.filter(event => new Date(event.start_at) < now);

  /**
   * Extrae el mes y día para el recuadro difuminado.
   * @param {string} dateString - Fecha ISO del backend
   * @returns {Object} Objeto con el mes corto y el día
   */
  const getShortDate = (dateString) => {
      const date = new Date(dateString);
      return {
          month: date.toLocaleString('es-ES', { month: 'short' }).toUpperCase(),
          day: date.getDate()
      };
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
        <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="container py-5">
      <div className="row g-4">
        
        {/* ================================================= */}
        {/* COLUMNA IZQUIERDA: TARJETA DE PERFIL (col-lg-4)     */}
        {/* ================================================= */}
        <div className="col-lg-4 col-xl-3">
            <div className="card shadow-sm border-0 h-100 rounded-4 text-center p-4">
                <div className="mb-4">
                    <img 
                        src={userImage || `https://ui-avatars.com/api/?name=${userName}&background=random&size=150`} 
                        alt="Perfil" 
                        className="rounded-circle shadow-sm border border-3 border-primary-subtle"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                </div>
                <h4 className="fw-bold text-body mb-1">{userName}</h4>
                <p className="text-body-secondary small mb-3">{userEmail}</p>
                <Link to="/profile" className="btn btn-outline-primary rounded-pill px-4 mb-4 fw-bold">
                    Editar Perfil
                </Link>

                <hr className="text-secondary opacity-25" />

                <div className="row text-center mt-3 g-2">
                    <div className="col-4">
                        <h4 className="fw-bold text-body m-0">{myEvents.length}</h4>
                        <small className="text-body-secondary" style={{fontSize: '0.7rem'}}>Creaciones</small>
                    </div>
                    <div className="col-4 border-start border-end border-secondary-subtle">
                        <h4 className="fw-bold text-body m-0">{upcomingEnrollments.length}</h4>
                        <small className="text-body-secondary" style={{fontSize: '0.7rem'}}>Próximos</small>
                    </div>
                    <div className="col-4">
                        <h4 className="fw-bold text-body m-0">{pastEnrollments.length}</h4>
                        <small className="text-body-secondary" style={{fontSize: '0.7rem'}}>Asistidos</small>
                    </div>
                </div>
            </div>
        </div>

        {/* ================================================= */}
        {/* COLUMNA DERECHA: CONTENIDO Y LISTAS (col-lg-8)      */}
        {/* ================================================= */}
        <div className="col-lg-8 col-xl-9">
            
            {/* --- SECCIÓN A: PRÓXIMOS EVENTOS (Con Glassmorphism) --- */}
            <h4 className="fw-bold text-body mb-3">📅 Tus Próximos Eventos</h4>
            {upcomingEnrollments.length === 0 ? (
                <div className="alert alert-info border-0 rounded-4 shadow-sm bg-info bg-opacity-10 text-body">
                    Aún no tienes planes próximos. <Link to="/" className="fw-bold alert-link">¡Descubre qué hacer!</Link>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3 mb-5">
                    {upcomingEnrollments.slice(0, 3).map(event => (
                        <div key={event.id} className="card border-0 shadow-sm rounded-4 hover-effect overflow-hidden bg-body">
                            <div className="row g-0 align-items-center">
                                {/* Contenedor de Imagen con position-relative */}
                                <div className="col-md-4 col-5 position-relative p-0 h-100">
                                    <img 
                                        src={event.image || "https://placehold.co/300x200"} 
                                        className="img-fluid w-100 h-100 rounded-start-4" 
                                        style={{objectFit: 'cover', minHeight: '130px'}} 
                                        alt="evento" 
                                    />
                                    {/* 🌟 EFECTO GLASSMORPHISM: Recuadro difuminado en el centro */}
                                    <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center justify-content-center shadow-sm rounded-3"
                                         style={{
                                             background: 'rgba(255, 255, 255, 0.75)', // Fondo blanco translúcido
                                             backdropFilter: 'blur(6px)', // Efecto cristal (blur)
                                             width: '55px',
                                             height: '55px',
                                             lineHeight: '1.1'
                                         }}>
                                        <small className="text-dark fw-bold" style={{fontSize: '0.75rem'}}>{getShortDate(event.start_at).month}</small>
                                        <span className="text-dark fw-bolder fs-4">{getShortDate(event.start_at).day}</span>
                                    </div>
                                </div>
                                <div className="col-md-6 col-5 p-3 px-4">
                                    <h5 className="fw-bold mb-1 text-truncate text-body">{event.title}</h5>
                                    <small className="text-body-secondary">📍 {event.location?.split(' | ')[0] || 'Online'}</small>
                                </div>
                                <div className="col-md-2 col-2 text-center p-2">
                                    <Link to={`/event/${event.id}`} className="btn btn-primary rounded-circle d-flex justify-content-center align-items-center mx-auto shadow-sm" style={{width: '45px', height: '45px'}}>
                                        ➔
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- SECCIÓN B: LISTAS SECUNDARIAS (Boceto exacto) --- */}
            <div className="row g-4">
                
                {/* LISTA 1: HISTORIAL DE ENTRADAS */}
                <div className="col-md-6">
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                        <div className="card-header bg-transparent border-bottom-0 pt-4 pb-2">
                            <h5 className="fw-bold text-primary m-0">🎟 Historial de Entradas</h5>
                        </div>
                        <div className="card-body p-3 overflow-y-auto" style={{ maxHeight: '400px' }}>
                            {enrollments.length === 0 ? (
                                <p className="text-body-secondary text-center my-4">No hay historial.</p>
                            ) : (
                                enrollments.map(event => (
                                    /* 🔥 Diseño Cajas Alargadas (Rounded-pill-like) */
                                    <div key={event.id} className="d-flex align-items-center justify-content-between p-2 mb-3 border border-secondary-subtle rounded-4 bg-body shadow-sm hover-effect">
                                        <div className="d-flex align-items-center gap-3 overflow-hidden w-75">
                                            <img src={event.image || "https://placehold.co/100x60"} alt="thumb" className="rounded-3 object-fit-cover" style={{width: '60px', height: '45px'}} />
                                            <div className="text-truncate">
                                                <h6 className="fw-bold mb-0 text-body text-truncate">{event.title}</h6>
                                                <small className="text-body-secondary">{new Date(event.start_at).toLocaleDateString()}</small>
                                            </div>
                                        </div>
                                        <Link to={`/event/${event.id}`} className="text-decoration-none text-primary fw-bold small pe-3">Ver</Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* LISTA 2: EVENTOS ORGANIZADOS */}
                <div className="col-md-6">
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                        <div className="card-header bg-transparent border-bottom-0 pt-4 pb-2 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold text-success m-0">🛠 Organizados</h5>
                            <Link to="/create-event" className="btn btn-sm btn-success rounded-pill fw-bold px-3">+ Nuevo</Link>
                        </div>
                        <div className="card-body p-3 overflow-y-auto" style={{ maxHeight: '400px' }}>
                            {myEvents.length === 0 ? (
                                <p className="text-body-secondary text-center my-4">No has creado eventos.</p>
                            ) : (
                                myEvents.map(event => (
                                    /* 🔥 Diseño Cajas Alargadas */
                                    <div key={event.id} className="d-flex align-items-center justify-content-between p-2 mb-3 border border-secondary-subtle rounded-4 bg-body shadow-sm hover-effect">
                                        <div className="d-flex align-items-center gap-3 overflow-hidden w-75">
                                            <img src={event.image || "https://placehold.co/100x60"} alt="thumb" className="rounded-3 object-fit-cover" style={{width: '60px', height: '45px'}} />
                                            <div className="text-truncate">
                                                <h6 className="fw-bold mb-0 text-body text-truncate">{event.title}</h6>
                                                <small className={event.capacity <= 0 ? "text-danger fw-bold" : "text-success fw-bold"}>
                                                    {event.capacity > 0 ? 'Activo' : 'Agotado'}
                                                </small>
                                            </div>
                                        </div>
                                        <Link to={`/event/edit/${event.id}`} className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '35px', height: '35px'}} title="Editar">
                                            ✏️
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;