import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// --- IMPORTACIONES DEL MAPA ---
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icono del mapa
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

function EventDetail() {
  const { id } = useParams();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false); 

  const [processing, setProcessing] = useState(false);

  // Estado para las coordenadas del mapa
  const [mapCoords, setMapCoords] = useState(null);

  const token = localStorage.getItem('auth_token');

  // Obtenemos el ID del usuario logueado en número entero para validaciones
  const currentUserId = parseInt(localStorage.getItem('user_id')); 

  // --- ESTADOS PARA COMENTARIOS ---
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  /**
   * Envía un nuevo comentario a la API.
   * Si es exitoso, lo añade al estado local para evitar recargar la página (Optimistic UI).
   * 
   * @async
   * @param {Event} e - Evento del formulario
   */
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/events/${id}/comments`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ content: commentText })
        });

        if (response.ok) {
            const newComment = await response.json();
            // Actualizamos el estado del evento añadiendo el nuevo comentario al inicio del array
            setEvent(prevEvent => ({
                ...prevEvent,
                comments: [newComment, ...(prevEvent.comments || [])]
            }));
            setCommentText(''); // Limpiamos el textarea
        } else {
            alert('Error al publicar el comentario.');
        }
    } catch (error) {
        console.error("Error posteando comentario:", error);
        alert('Error de conexión.');
    } finally {
        setIsSubmittingComment(false);
    }
  };

  /**
   * Elimina un comentario de la base de datos y de la vista.
   * 
   * @async
   * @param {number} commentId - ID del comentario a borrar
   */
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("¿Estás seguro de que quieres borrar este comentario?")) return;

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            // Filtramos el array para quitar el comentario borrado de la vista
            setEvent(prevEvent => ({
                ...prevEvent,
                comments: prevEvent.comments.filter(c => c.id !== commentId)
            }));
        } else {
            alert("No se pudo borrar el comentario.");
        }
    } catch (error) {
        alert("Error de conexión al borrar.");
    }
  };

  // 1. CARGAR DATOS Y BUSCAR COORDENADAS
  useEffect(() => {
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`http://127.0.0.1:8000/api/events/${id}`, { headers })
      .then(res => res.json())
      .then(data => {
        setEvent(data);
        setIsEnrolled(data.is_enrolled);
        setLoading(false);

        // MAGIA DEL MAPA: Si hay ubicación y no es "Online", buscamos sus coordenadas
        if (data.location && data.location !== 'Online') {
            // Convertimos "Madrid | Calle X" a "Calle X, Madrid" para buscarlo mejor
            const searchQuery = data.location.split(' | ').reverse().join(', ');
            
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
                .then(res => res.json())
                .then(results => {
                    if (results && results.length > 0) {
                        setMapCoords([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
                    }
                })
                .catch(err => console.error("Error buscando en el mapa:", err));
        }
      })
      .catch(err => {
          console.error("Error:", err);
          setLoading(false);
      });
  }, [id, token]);

  /**
   * Maneja la inscripción (RSVP) del usuario al evento.
   * Envía una cantidad por defecto de 1 al backend para mantener la compatibilidad
   * con la base de datos actual (tabla enrollments).
   * 
   * @async
   * @function handleEnroll
   */
  const handleEnroll = async () => {
    setProcessing(true);
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/events/${id}/enroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            // Mantenemos quantity: 1 para que tu backend no falle con las validaciones actuales
            body: JSON.stringify({ quantity: 1 }) 
        });
        const data = await response.json();
        
        if (response.ok) {
            alert("¡Te has apuntado al evento correctamente! 📅");
            setIsEnrolled(true); 
        } else {
            alert(data.message || "Error al intentar apuntarse.");
        }
    } catch (error) {
        alert("Error de conexión");
    } finally {
        setProcessing(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!event) return <div className="container mt-5 text-center"><h3>Evento no encontrado</h3><Link to="/">Volver</Link></div>;

  const isFree = parseFloat(event.price) === 0;
  
  // Separar Ciudad y Dirección para mostrarlo bonito
  const locationParts = event.location ? event.location.split(' | ') : ['Online'];
  const city = locationParts[0];
  const address = locationParts[1] || '';

  return (
    <div className="container my-5 position-relative">
      <Link to="/" className="btn btn-outline-secondary mb-3">← Volver al inicio</Link>
      
      <div className="row">
        {/* COLUMNA IZQUIERDA: DETALLES */}
        <div className="col-md-8">
            <div className="card shadow-sm mb-4 border-0 overflow-hidden">
                <img src={event.image || "https://placehold.co/800x400"} className="card-img-top" alt="Poster" style={{maxHeight: '400px', objectFit:'cover'}} />
                <div className="card-body p-4 p-md-5">
                    {event.is_featured && <span className="badge bg-warning text-dark mb-3 me-2 fs-6">⭐ Destacado</span>}
                    {isFree && <span className="badge bg-success mb-3 fs-6">¡Gratis!</span>}
                    
                    <h1 className="card-title fw-bold mb-3">{event.title}</h1>
                    
                    <div className="d-flex flex-wrap gap-4 text-muted mb-4 pb-4 border-bottom">
                        <div>
                            <strong className="d-block">📅 Fecha y Hora</strong>
                            {new Date(event.start_at).toLocaleString()}
                        </div>
                        <div>
                            <strong className="d-block">📍 Ubicación</strong>
                            {city} {address && `- ${address}`}
                        </div>
                        <div>
                            <strong className="d-block">👤 Organiza</strong>
                            {event.user?.name || 'Usuario'}
                        </div>
                    </div>
                    
                    <h4 className="fw-bold mb-3">Acerca de este evento</h4>
                    <p className="card-text fs-5" style={{ whiteSpace: 'pre-line' }}>{event.description}</p>
                </div>
            </div>

           {/* --- ZONA SOCIAL: COMENTARIOS --- */}
            <div className="card shadow-sm border border-secondary-subtle mt-4 overflow-hidden rounded-4 mb-5 bg-body">
                {/* Cabecera sin bg-white para no romper el modo oscuro */}
                <div className="card-header bg-transparent p-4 border-bottom border-secondary-subtle">
                    <h4 className="fw-bold m-0 d-flex align-items-center gap-2 text-body">
                        💬 Conversación <span className="badge bg-primary rounded-pill fs-6">{event.comments?.length || 0}</span>
                    </h4>
                </div>
                
                <div className="card-body p-4">
                    
                    {/* 1. LISTA DE COMENTARIOS (Primero, para "leer la sala") */}
                    {event.comments && event.comments.length > 0 ? (
                        <div className="d-flex flex-column gap-4 mb-5">
                            {event.comments.map(comment => (
                                <div key={comment.id} className="d-flex gap-3">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${comment.user?.name}&background=random`} 
                                        alt={comment.user?.name} 
                                        className="rounded-circle shadow-sm mt-1" 
                                        style={{width: '45px', height: '45px', objectFit: 'cover'}} 
                                    />
                                    {/* Comentarios publicados: bg-body-tertiary (Fondo muy suave) */}
                                    <div className="flex-grow-1 bg-body-tertiary p-3 rounded-4 border border-secondary-subtle position-relative">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="fw-bold m-0 text-body">{comment.user?.name || 'Usuario Anónimo'}</h6>
                                            <small className="text-body-secondary" style={{fontSize: '0.8rem'}}>
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <p className="m-0 text-body" style={{whiteSpace: 'pre-line', fontSize: '0.95rem'}}>
                                            {comment.content}
                                        </p>
                                        
                                        {/* Botón de Borrar (Solo dueño) */}
                                        {currentUserId === comment.user_id && (
                                            <button 
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="btn btn-sm text-danger position-absolute top-0 end-0 mt-2 me-2 px-2 py-0 border-0 hover-effect bg-transparent fw-bold"
                                                title="Borrar comentario"
                                                style={{fontSize: '1.2rem'}}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-body-secondary py-4 mb-5 border border-secondary-subtle rounded-4 bg-body-tertiary mx-3 shadow-sm">
                            <span style={{fontSize: '2.5rem'}}>🌱</span>
                            <p className="mt-2 mb-0">No hay comentarios aún. ¡Sé el primero en opinar!</p>
                        </div>
                    )}

                    {/* 2. CAJA PARA ESCRIBIR (Abajo, zona de acción) */}
                    {token ? (
                        /* Formulario: bg-body-secondary (Fondo más oscuro/contrastado para destacar) */
                        <form onSubmit={handlePostComment} className="bg-body-secondary p-4 rounded-4 border border-secondary-subtle shadow-sm">
                            <h6 className="fw-bold text-body mb-3">Añadir un comentario</h6>
                            <div className="d-flex gap-3">
                                <img 
                                    src={localStorage.getItem('user_image') || `https://ui-avatars.com/api/?name=${localStorage.getItem('user_name')}&background=random`} 
                                    alt="Yo" 
                                    className="rounded-circle shadow-sm" 
                                    style={{width: '45px', height: '45px', objectFit: 'cover'}} 
                                />
                                <div className="flex-grow-1">
                                    <textarea 
                                        className="form-control border-secondary-subtle bg-body text-body shadow-none rounded-3" 
                                        rows="3" 
                                        placeholder="Escribe tu opinión aquí..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        required
                                        style={{resize: 'none'}}
                                    ></textarea>
                                    <div className="d-flex justify-content-end pt-3">
                                        <button type="submit" className="btn btn-primary rounded-pill fw-bold px-4 shadow-sm" disabled={isSubmittingComment || !commentText.trim()}>
                                            {isSubmittingComment ? 'Publicando...' : 'Publicar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="alert alert-secondary text-center rounded-4 border-0 m-0">
                            Debes <Link to="/login" className="fw-bold text-decoration-none">iniciar sesión</Link> para dejar un comentario.
                        </div>
                    )}
                </div>
            </div>

            {/* --- ZONA DEL MAPA (SOLO SI HAY COORDENADAS) --- */}
            {mapCoords && (
                <div className="card shadow-sm border-secondary border-opacity-25 mb-4 overflow-hidden bg-transparent">
                    <div className="card-header bg-transparent p-4 border-bottom border-secondary border-opacity-25">
                        <h4 className="fw-bold m-0 text-body">🗺️ Cómo llegar</h4>
                        <p className="text-secondary m-0 mt-1">{address ? `${address}, ${city}` : city}</p>
                    </div>
                    {/* Mapa de Solo Lectura (Sin eventos de clic) */}
                    <MapContainer center={mapCoords} zoom={15} style={{ height: '350px', width: '100%', zIndex: 0 }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap'
                        />
                        <Marker position={mapCoords} icon={customIcon} />
                    </MapContainer>
                </div>
            )}
            
        </div>

        {/* COLUMNA DERECHA: SIDEBAR DE ACCIÓN (RSVP / LINK EXTERNO) */}
        <div className="col-md-4">
            <div className="card shadow-sm p-4 sticky-top border-0 rounded-4" style={{top: '20px'}}>
                <div className="text-center mb-4">
                    <h5 className="text-muted mb-1">{isFree ? 'Entrada' : 'Precio estimado'}</h5>
                    <h2 className={`fw-bold display-5 m-0 ${isFree ? 'text-success' : 'text-dark'}`}>
                        {isFree ? 'GRATIS' : `$${event.price}`}
                    </h2>
                </div>
                
                <ul className="list-group list-group-flush mb-4 small">
                    <li className="list-group-item d-flex justify-content-between px-0">
                        <span className="text-muted">Aforo disponible:</span>
                        <strong>{event.capacity} plazas</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between px-0">
                        <span className="text-muted">Categoría:</span>
                        <strong>{event.category?.name || 'General'}</strong>
                    </li>
                </ul>
                
                {/* LÓGICA DE BOTONES: Link Externo + RSVP */}
                <div className="d-flex flex-column gap-3">
                    {/* 1. Botón de Compra Externa (Solo si hay enlace) */}
                    {event.external_link && (
                        <a 
                            href={event.external_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-dark w-100 btn-lg shadow-sm rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                        >
                            🔗 Comprar Entradas Oficiales
                        </a>
                    )}

                    {/* 2. Botón de RSVP Interno (CaraLibre) */}
                    {isEnrolled ? (
                        <div className="alert alert-success text-center border-0 bg-success bg-opacity-10 m-0 rounded-4">
                            <span className="d-block fs-3 mb-1">✅</span>
                            <strong className="d-block text-success mb-2">¡Evento Guardado!</strong>
                            <Link to="/dashboard" className="btn btn-success btn-sm w-100 rounded-pill">Ver en mi Dashboard</Link>
                        </div>
                    ) : event.capacity <= 0 ? (
                        <button className="btn btn-secondary w-100 btn-lg rounded-pill" disabled>Agotado</button>
                    ) : !token ? (
                        <Link to="/login" className="btn btn-outline-primary w-100 btn-lg rounded-pill">Inicia Sesión para Guardar</Link>
                    ) : (
                        <button 
                            onClick={handleEnroll} 
                            className={`btn w-100 btn-lg shadow-sm rounded-pill fw-bold ${event.external_link ? 'btn-outline-primary' : 'btn-primary'}`} 
                            disabled={processing}
                        >
                            {processing ? "Guardando..." : "📅 Guardar Evento / Me Apunto"}
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;