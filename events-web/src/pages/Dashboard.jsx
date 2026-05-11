import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * =========================================================================
 * COMPONENTE: DASHBOARD (El Panel de Control del Usuario)
 * =========================================================================
 * ¿Para qué sirve?: Es la "zona privada" del usuario. Aquí puede ver a qué 
 * eventos asiste, cuáles ha organizado y cuáles tiene en favoritos.
 * Destaca por su alto rendimiento al usar promesas concurrentes y estados derivados.
 */
function Dashboard() {
  // -----------------------------------------------------------------------
  // 1. ESTADOS DE DATOS Y CARGA
  // -----------------------------------------------------------------------
  const [enrollments, setEnrollments] = useState([]); // Entradas compradas
  const [myEvents, setMyEvents] = useState([]);       // Eventos que yo he creado
  const [favorites, setFavorites] = useState([]);     // Eventos a los que di "Me gusta"
  const [loading, setLoading] = useState(true);
  
  // Datos del perfil sacados del LocalStorage
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userImage, setUserImage] = useState(null);

  // Control de la Interfaz (Pestañas y Modales)
  const [activeTab, setActiveTab] = useState('entradas');
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // -----------------------------------------------------------------------
  // 2. FUNCIÓN DE BORRADO (Actualización Optimista / Optimistic UI)
  // -----------------------------------------------------------------------
  const handleDeleteEvent = async (id) => {
    const token = localStorage.getItem('auth_token');
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/events/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            // Magia Reactiva: En lugar de volver a pedir todos los eventos al servidor,
            // filtramos el array local borrando el que coincide con el ID.
            // Esto hace que desaparezca de la pantalla al instante.
            setMyEvents(prevEvents => prevEvents.filter(ev => ev.id !== id)); 
            toast.success("Evento cancelado y eliminado");
        }
    } catch (error) {
        toast.error("Error de red al intentar eliminar el evento");
    }
  };

  // -----------------------------------------------------------------------
  // 3. EFECTO DE INICIALIZACIÓN (Peticiones Concurrentes)
  // -----------------------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        navigate('/login');
        return;
    }

    setUserName(localStorage.getItem('user_name') || 'Usuario');
    const rawImage = localStorage.getItem('user_image');
    setUserImage((rawImage && rawImage !== 'null' && rawImage !== 'undefined' && rawImage !== '') ? rawImage : null);    setUserEmail(localStorage.getItem('user_email') || 'usuario@caralibre.com');

    const headers = { 'Authorization': `Bearer ${token}` };

    // PROMISE.ALL: El Santo Grial del rendimiento.
    // En lugar de hacer 3 peticiones en cascada (que tardarían el triple),
    // disparamos las 3 a la vez y esperamos a que todas terminen para pintar la web.
    Promise.all([
        fetch('http://127.0.0.1:8000/api/my-enrollments', { headers }),
        fetch('http://127.0.0.1:8000/api/my-events', { headers }),
        fetch('http://127.0.0.1:8000/api/my-favorites', { headers }) 
    ])
    .then(async ([resEnroll, resEvents, resFavs]) => {
        const dataEnroll = await resEnroll.json();
        const dataEvents = await resEvents.json();
        // Controlamos los favoritos por si el usuario aún no tiene ninguno
        const dataFavs = resFavs.ok ? await resFavs.json() : []; 
        
        setEnrollments(dataEnroll);
        setMyEvents(dataEvents);
        setFavorites(dataFavs); 
        setLoading(false); // Apagamos el loader general
    })
    .catch(err => {
        console.error("Fallo en la inicialización del Dashboard:", err);
        toast.error("Error al cargar los datos del panel");
    });

  }, [navigate]);

  // -----------------------------------------------------------------------
  // 4. ESTADOS DERIVADOS (Filtrado de Fechas en Cliente)
  // -----------------------------------------------------------------------
  // Calculamos dinámicamente qué eventos son pasados y cuáles futuros
  // basándonos en la lista general de 'enrollments'. No necesitamos usar 'useState'
  // para esto, porque se recalcula automáticamente si 'enrollments' cambia.
  const now = new Date();
  const upcomingEnrollments = enrollments.filter(event => new Date(event.start_at) >= now);
  const pastEnrollments = enrollments.filter(event => new Date(event.start_at) < now);

  /**
   * Utilidad visual: Extrae el mes y el día para pintar el mini-calendario Bento
   */
  const getShortDate = (dateString) => {
      const date = new Date(dateString);
      return {
          month: date.toLocaleString('es-ES', { month: 'short' }).toUpperCase(),
          day: date.getDate()
      };
  };

  // Pantalla de carga inicial
  if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
            <div className="spinner-border text-primary" role="status"></div>
        </div>
      );
  }

  return (
    <div className="container py-5">
      <div className="row g-4">
        
        {/* --- COLUMNA IZQUIERDA: TARJETA DE PERFIL --- */}
        <div className="col-lg-4 col-xl-3">
            <div className="card shadow-sm border-0 h-100 rounded-4 text-center p-4 bg-body">
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

        {/* --- COLUMNA DERECHA: CONTENIDO Y PESTAÑAS --- */}
        <div className="col-lg-8 col-xl-9">
            
            {/* WIDGET: PRÓXIMOS EVENTOS */}
            <h4 className="fw-bold text-body mb-3">📅 Tus Próximos Eventos</h4>
            {upcomingEnrollments.length === 0 ? (
                <div className="alert alert-info border-0 rounded-4 shadow-sm bg-info bg-opacity-10 text-body">
                    Aún no tienes planes próximos. <Link to="/" className="fw-bold alert-link">¡Descubre qué hacer!</Link>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3 mb-5">
                    {upcomingEnrollments.slice(0, 3).map(event => (
                        <div key={event.id} className="position-relative card border-0 shadow-sm rounded-4 hover-effect overflow-hidden bg-body" style={{ transition: 'all 0.3s ease' }}>
                            <div className="row g-0 align-items-center">
                                <div className="col-md-4 col-5 position-relative p-0 h-100">
                                    <img 
                                        src={event.image || "https://placehold.co/300x200"} 
                                        className="img-fluid w-100 h-100 rounded-start-4" 
                                        style={{objectFit: 'cover', minHeight: '130px'}} 
                                        alt={event.title} 
                                    />
                                    <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center justify-content-center shadow-sm rounded-3"
                                         style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(6px)', width: '55px', height: '55px', lineHeight: '1.1' }}>
                                        <small className="text-dark fw-bold" style={{fontSize: '0.75rem'}}>{getShortDate(event.start_at).month}</small>
                                        <span className="text-dark fw-bolder fs-4">{getShortDate(event.start_at).day}</span>
                                    </div>
                                </div>
                                <div className="col-md-6 col-5 p-3 px-4">
                                    <h5 className="fw-bold mb-1 text-truncate text-body">{event.title}</h5>
                                    <small className="text-body-secondary">📍 {event.location?.split(' | ')[0] || 'Online'}</small>
                                </div>
                                <div className="col-md-2 col-2 text-center p-2">
                                    <Link to={`/event/${event.id}`} className="btn btn-primary rounded-circle d-flex justify-content-center align-items-center mx-auto shadow-sm stretched-link" style={{width: '45px', height: '45px'}}>
                                        ➔
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CONTENEDOR DE PESTAÑAS */}
            <div className="card shadow-sm border-0 rounded-4 bg-body">
                <div className="card-header bg-transparent border-bottom-0 pt-4 px-4">
                    <div className="nav nav-pills gap-2">
                        <button className={`nav-link rounded-pill fw-bold ${activeTab === 'entradas' ? 'active' : 'text-secondary'}`} onClick={() => setActiveTab('entradas')}>🎟 Entradas</button>
                        <button className={`nav-link rounded-pill fw-bold ${activeTab === 'favoritos' ? 'active' : 'text-secondary'}`} onClick={() => setActiveTab('favoritos')}>❤️ Favoritos</button>
                        <button className={`nav-link rounded-pill fw-bold ${activeTab === 'organizados' ? 'active' : 'text-secondary'}`} onClick={() => setActiveTab('organizados')}>🛠 Mis Eventos</button>
                    </div>
                </div>
                
                <div className="card-body p-4 overflow-y-auto" style={{ maxHeight: '450px' }}>
                    
                    {/* PESTAÑA: ENTRADAS */}
                    {activeTab === 'entradas' && (
                        enrollments.length === 0 ? (
                            <p className="text-body-secondary text-center my-4">No hay historial de entradas.</p>
                        ) : (
                            enrollments.map(event => (
                                <div key={event.id} className="position-relative d-flex align-items-center justify-content-between p-2 mb-3 border border-secondary-subtle rounded-4 bg-body shadow-sm hover-effect" style={{ transition: 'all 0.3s ease' }}>
                                    <div className="d-flex align-items-center gap-3 overflow-hidden w-75">
                                        <img src={event.image || "https://placehold.co/100x60"} alt="thumb" className="rounded-3 object-fit-cover" style={{width: '60px', height: '45px'}} />
                                        <div className="text-truncate">
                                            <h6 className="fw-bold mb-0 text-body text-truncate">{event.title}</h6>
                                            <small className="text-body-secondary">{new Date(event.start_at).toLocaleDateString()}</small>
                                        </div>
                                    </div>
                                    <Link to={`/event/${event.id}`} className="text-decoration-none text-primary fw-bold small pe-3 stretched-link">Ver</Link>
                                </div>
                            ))
                        )
                    )}

                    {/* PESTAÑA: FAVORITOS */}
                    {activeTab === 'favoritos' && (
                        favorites.length === 0 ? (
                            <p className="text-body-secondary text-center my-4">No tienes eventos en favoritos aún.</p>
                        ) : (
                            favorites.map(event => (
                                <div key={event.id} className="position-relative d-flex align-items-center justify-content-between p-2 mb-3 border border-secondary-subtle rounded-4 bg-body shadow-sm hover-effect" style={{ transition: 'all 0.3s ease' }}>
                                    <div className="d-flex align-items-center gap-3 overflow-hidden w-75">
                                        <img src={event.image || "https://placehold.co/100x60"} alt="thumb" className="rounded-3 object-fit-cover" style={{width: '60px', height: '45px'}} />
                                        <div className="text-truncate">
                                            <h6 className="fw-bold mb-0 text-body text-truncate">{event.title}</h6>
                                            <small className="text-body-secondary">📍 {event.location?.split(' | ')[0] || 'Online'}</small>
                                        </div>
                                    </div>
                                    <Link to={`/event/${event.id}`} className="btn btn-outline-danger btn-sm rounded-pill fw-bold px-3 stretched-link">❤️ Ver</Link>
                                </div>
                            ))
                        )
                    )}

                    {/* PESTAÑA: EVENTOS CREADOS */}
                    {activeTab === 'organizados' && (
                        myEvents.length === 0 ? (
                            <p className="text-body-secondary text-center my-4">No has organizado ningún evento.</p>
                        ) : (
                            <>
                                <div className="text-end mb-3">
                                    <Link to="/create-event" className="btn btn-sm btn-success rounded-pill fw-bold px-3">+ Nuevo Evento</Link>
                                </div>
                                {myEvents.map(event => (
                                    <div key={event.id} className="position-relative d-flex align-items-center justify-content-between p-2 mb-3 border border-secondary-subtle rounded-4 bg-body shadow-sm hover-effect" style={{ transition: 'all 0.3s ease' }}>
                                        <div className="d-flex align-items-center gap-3 overflow-hidden w-75">
                                            <img src={event.image || "https://placehold.co/100x60"} alt="thumb" className="rounded-3 object-fit-cover" style={{width: '60px', height: '45px'}} />
                                            <div className="text-truncate">
                                                <h6 className="fw-bold mb-0 text-truncate">
                                                    <Link to={`/event/${event.id}`} className="text-decoration-none text-body stretched-link">
                                                        {event.title}
                                                    </Link>
                                                </h6>
                                                <small className={event.capacity <= 0 ? "text-danger fw-bold" : "text-success fw-bold"}>
                                                    {event.capacity > 0 ? 'Activo' : 'Agotado'}
                                                </small>
                                            </div>
                                        </div>
                                        
                                        {/* Capa de botones de acción (z-index elevado para evitar conflictos con el stretched-link) */}
                                        <div className="d-flex gap-2 position-relative z-3">
                                            <Link to={`/event/edit/${event.id}`} className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" style={{width: '35px', height: '35px'}} title="Editar">
                                                ✏️
                                            </Link>
                                            <button 
                                                onClick={() => { setEventToDelete(event); setShowModal(true); }} 
                                                className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center" 
                                                style={{width: '35px', height: '35px'}} 
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )
                    )}

                </div>
            </div>

        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {showModal && (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg bg-body" style={{ borderRadius: '20px' }}>
                        <div className="modal-header border-0 pt-4 px-4">
                            <h5 className="modal-title fw-bold text-body">¿Cancelar evento?</h5>
                            <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body px-4">
                            <p className="text-body-secondary">Vas a eliminar <strong className="text-body">{eventToDelete?.title}</strong>. Los asistentes ya no podrán verlo.</p>
                        </div>
                        <div className="modal-footer border-0 p-4 gap-2">
                            <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowModal(false)}>Volver</button>
                            <button className="btn btn-danger rounded-pill px-4 fw-bold" onClick={() => {
                                handleDeleteEvent(eventToDelete.id);
                                setShowModal(false);
                            }}>Confirmar Borrado</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

export default Dashboard;