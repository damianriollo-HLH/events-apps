import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
//Reemplaza alert()
import toast from 'react-hot-toast';
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

  // --- ESTADOS PARA VALORACIONES ---
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); // Para el efecto visual al pasar el ratón

  const [isLiked, setIsLiked] = useState(false);
  const [likeProcessing, setLikeProcessing] = useState(false);

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
            toast.success('Comentario publicado'); // feedback al usuario
        } else {
            toast.error('Error al publicar el comentario.');        
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
  
  //Scroll to Top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Se ejecuta una sola vez al montar el componente

// 1. CARGAR DATOS Y BUSCAR COORDENADAS
  useEffect(() => {
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`http://127.0.0.1:8000/api/events/${id}`, { headers })
      .then(res => {
          if (!res.ok) throw new Error("Error cargando evento");
          return res.json();
      })
      .then(data => {
        // Guardamos todo el objeto del evento
        setEvent(data);
        
        // Actualizamos los estados individuales con lo que responde la API
        setIsEnrolled(data.is_enrolled);
        
        // Seteamos la valoración que el usuario ya le dio (si existe)
        // Esto hace que las estrellas aparezcan marcadas al cargar la página
        setUserRating(data.user_rating || 0);

        // Seteamos si el usuario le dio Like anteriormente
        // Gracias al protected $appends = ['is_liked'] que pusimos en el Modelo Event.php
        setIsLiked(data.is_liked || false);

        setLoading(false);

        // LÓGICA DEL MAPA (Mantenemos tu código igual)
        if (data.location && data.location !== 'Online') {
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
            // ANTES: alert("¡Te has apuntado al evento correctamente! 📅");
            toast.success("¡Te has apuntado al evento correctamente! 📅");
            setIsEnrolled(true); 
        } else {
            // ANTES: alert(data.message || "Error al intentar apuntarse.");
            toast.error(data.message || "Aforo completo o error.");
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

  /**
   * Envía la valoración del usuario a la API.
   * @param {number} stars - Número de estrellas (1-5)
   */
  const handleRate = async (stars) => {
    if (!token) return toast.error("Debes iniciar sesión para valorar.");
    
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/events/${id}/rate`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ stars })
        });

        const data = await res.json();
        
        if (res.ok) {
            setUserRating(data.user_rating);
            // Actualizamos la media global en el objeto event para que se refleje al instante
            setEvent(prev => ({ ...prev, ratings_avg_stars: data.new_average }));
            toast.success('¡Gracias por tu valoración!'); // <-- Feedback visual
        } else {
            toast.error(data.message);
        }
    } catch (err) {
        toast.error("Error de conexión");
    }
  };
  /**
 * Añade o quita el evento de favoritos.
 */
const handleToggleLike = async () => {
    if (!token) return alert("Inicia sesión para añadir a favoritos.");
    setLikeProcessing(true);

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/events/${id}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const data = await res.json();

        if (res.ok) {
            setIsLiked(data.is_liked); // Actualizamos el estado con la respuesta del server
            if (data.is_liked) {
                toast.success('Añadido a favoritos ❤️');
            } else {
                toast.success('Quitado de favoritos 🤍');
            }
        }
    } catch (error) {
        console.error("Error toggling like:", error);
    } finally {
        setLikeProcessing(false);
    }
};

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
                    
                    {/* Título y Botón de Favorito en la misma línea */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <h1 className="card-title fw-bold m-0">{event.title}</h1>

                        <button 
                            onClick={handleToggleLike}
                            disabled={likeProcessing}
                            className={`btn rounded-circle shadow-sm d-flex align-items-center justify-content-center transition-transform hover-effect ${isLiked ? 'bg-danger-subtle text-danger' : 'bg-body text-secondary border'}`}
                            style={{ 
                                width: '45px', 
                                height: '45px', 
                                fontSize: '1.2rem',
                                transition: 'all 0.3s ease'
                            }}
                            title={isLiked ? "Quitar de favoritos" : "Añadir a favoritos"}
                        >
                            {isLiked ? '❤️' : '🤍'}
                        </button>
                    </div>
                    
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
            {/* INTERFAZ DE VALORACIÓN (ESTRELLAS) */}
                <div className="bg-body-tertiary px-4 py-3 border-bottom border-secondary-subtle d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    {/* Media Global */}
                    <div className="d-flex align-items-center gap-2">
                        <span className="fs-2 text-warning">★</span>
                        <div>
                            <h5 className="fw-bold m-0 text-body">
                                {event.ratings_avg_stars ? parseFloat(event.ratings_avg_stars).toFixed(1) : 'Nuevo'}
                                <span className="text-body-secondary fs-6 fw-normal ms-1">/ 5.0</span>
                            </h5>
                            <small className="text-body-secondary">Nota media del evento</small>
                        </div>
                    </div>

                    {/* Voto del Usuario */}
                    <div className="text-md-end">
                        <small className="d-block text-body-secondary mb-1 fw-bold">
                            {userRating > 0 ? 'Tu valoración:' : 'Valora este evento:'}
                        </small>
                        <div className="d-flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRate(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    className="btn btn-link p-0 text-decoration-none transition-transform hover-effect"
                                    style={{ 
                                        fontSize: '1.8rem', 
                                        color: (hoverRating || userRating) >= star ? '#ffc107' : '#e4e5e9',
                                        transform: hoverRating === star ? 'scale(1.2)' : 'scale(1)'
                                    }}
                                    disabled={!token}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
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
                        /* Añadimos mx-auto y un style con maxWidth para que no se estire al infinito en PC */
                        <form onSubmit={handlePostComment} className="bg-body-secondary p-4 rounded-4 border border-secondary-subtle shadow-sm mx-auto" style={{ maxWidth: '800px' }}>
                            <h6 className="fw-bold text-body mb-3">Añadir un comentario</h6>
                            <div className="d-flex gap-3 align-items-start">
                                <img 
                                    src={localStorage.getItem('user_image') || `https://ui-avatars.com/api/?name=${localStorage.getItem('user_name')}&background=random`} 
                                    alt="Yo" 
                                    className="rounded-circle shadow-sm" 
                                    style={{width: '45px', height: '45px', objectFit: 'cover'}} 
                                />
                                <div className="flex-grow-1">
                                    <textarea 
                                        className="form-control border-secondary-subtle bg-body text-body shadow-sm rounded-3" 
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