import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
  const [mapCoords, setMapCoords] = useState(null);
  const token = localStorage.getItem('auth_token');
  const currentUserId = parseInt(localStorage.getItem('user_id'));
  const isAdmin = localStorage.getItem('is_admin') === '1';

  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); 
  const [isLiked, setIsLiked] = useState(false);
  const [likeProcessing, setLikeProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false); 
  const [eventToDelete, setEventToDelete] = useState(null);

  // --- MÉTODOS ---

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
            setEvent(prevEvent => ({
                ...prevEvent,
                comments: [newComment, ...(prevEvent.comments || [])]
            }));
            setCommentText('');
            toast.success('Comentario publicado');
        } else {
            toast.error('Error al publicar el comentario.');        
        }
    } catch (error) {
        toast.error('Error de conexión.');
    } finally {
        setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) return;

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            setEvent(prevEvent => ({
                ...prevEvent,
                comments: prevEvent.comments.filter(c => c.id !== commentId)
            }));
            toast.success("Comentario eliminado");
        } else {
            toast.error("No se pudo borrar el comentario.");
        }
    } catch (error) {
        toast.error("Error de conexión al borrar.");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`http://127.0.0.1:8000/api/events/${id}`, { headers })
      .then(res => {
          if (!res.ok) throw new Error("Error cargando evento");
          return res.json();
      })
      .then(data => {
        setEvent(data);
        setIsEnrolled(data.is_enrolled);
        setUserRating(data.user_rating || 0);
        setIsLiked(data.is_liked || false);
        setLoading(false);

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
          setLoading(false);
          toast.error("No se pudo cargar el evento");
      });
  }, [id, token]);

  const handleEnroll = async () => {
    setProcessing(true);
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/events/${id}/enroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ quantity: 1 }) 
        });
        const data = await response.json();
        if (response.ok) {
            toast.success("¡Te has apuntado al evento correctamente! 📅");
            setIsEnrolled(true); 
        } else {
            toast.error(data.message || "Aforo completo o error.");
        }
    } catch (error) {
        toast.error("Error de conexión");
    } finally {
        setProcessing(false);
    }
  };

  const handleUnenroll = async () => {
    setProcessing(true);
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/events/${id}/enroll`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            setIsEnrolled(false); 
            toast.success("Asistencia cancelada.");
        } else {
            toast.error("No se pudo cancelar la asistencia.");
        }
    } catch (error) {
        toast.error("Error al procesar la solicitud.");
    } finally {
        setProcessing(false);
        setShowModal(false);
    }
  };

  const handleRate = async (stars) => {
    if (!token) return toast.error("Debes iniciar sesión para valorar.");
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/events/${id}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ stars })
        });
        const data = await res.json();
        if (res.ok) {
            setUserRating(data.user_rating);
            setEvent(prev => ({ ...prev, ratings_avg_stars: data.new_average }));
            toast.success('¡Gracias por tu valoración!');
        } else {
            toast.error(data.message);
        }
    } catch (err) {
        toast.error("Error de conexión");
    }
  };

  const handleToggleLike = async () => {
    if (!token) return toast.error("Inicia sesión para añadir a favoritos.");
    setLikeProcessing(true);
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/events/${id}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (res.ok) {
            setIsLiked(data.is_liked);
            toast.success(data.is_liked ? 'Añadido a favoritos ❤️' : 'Quitado de favoritos 🤍');
        }
    } catch (error) {
        toast.error("Error al marcar favorito");
    } finally {
        setLikeProcessing(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!event) return <div className="container mt-5 text-center"><h3>Evento no encontrado</h3><Link to="/">Volver</Link></div>;

  const isFree = parseFloat(event.price) === 0;
  const locationParts = event.location ? event.location.split(' | ') : ['Online'];
  const city = locationParts[0];
  const address = locationParts[1] || '';

  return (
    <div className="container my-5 position-relative">
      <Link to="/" className="btn btn-outline-secondary mb-3">← Volver al inicio</Link>
      
      <div className="row">
        <div className="col-md-8">
            <div className="card shadow-sm mb-4 border-0 overflow-hidden bg-body">
                <img src={event.image || "https://placehold.co/800x400"} className="card-img-top" alt="Poster" style={{maxHeight: '400px', objectFit:'cover'}} />
                <div className="card-body p-4 p-md-5">
                    
                    {/* SOLUCIÓN 1: Evitar pintar el "0" usando operador ternario */}
                    {event.is_featured ? <span className="badge bg-warning text-dark mb-3 me-2 fs-6">⭐ Destacado</span> : null}
                    {isFree ? <span className="badge bg-success mb-3 fs-6">¡Gratis!</span> : null}
                    
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <h1 className="card-title fw-bold m-0">{event.title}</h1>
                        <button 
                            onClick={handleToggleLike}
                            disabled={likeProcessing}
                            className={`btn rounded-circle shadow-sm d-flex align-items-center justify-content-center ${isLiked ? 'bg-danger-subtle text-danger' : 'bg-body text-secondary border'}`}
                            style={{ width: '45px', height: '45px', fontSize: '1.2rem' }}
                            title={isLiked ? "Quitar de favoritos" : "Añadir a favoritos"}
                        >
                            {isLiked ? '❤️' : '🤍'}
                        </button>
                    </div>
                    
                    <div className="d-flex flex-wrap gap-4 text-muted mb-4 pb-4 border-bottom border-secondary-subtle">
                        <div><strong className="d-block text-body">📅 Fecha y Hora</strong>{new Date(event.start_at).toLocaleString()}</div>
                        <div><strong className="d-block text-body">📍 Ubicación</strong>{city} {address && `- ${address}`}</div>
                        <div><strong className="d-block text-body">👤 Organiza</strong>{event.user?.name || 'Usuario'}</div>
                    </div>
                    <h4 className="fw-bold mb-3">Acerca de este evento</h4>
                    <p className="card-text fs-5" style={{ whiteSpace: 'pre-line' }}>{event.description}</p>
                </div>
            </div>

            <div className="bg-body-tertiary px-4 py-3 border-bottom border-secondary-subtle d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 rounded-top-4">
                <div className="d-flex align-items-center gap-2">
                    <span className="fs-2 text-warning">★</span>
                    <div>
                        <h5 className="fw-bold m-0 text-body">
                            {event.ratings_avg_stars ? parseFloat(event.ratings_avg_stars).toFixed(1) : 'Nuevo'}
                            <span className="text-body-secondary fs-6 fw-normal ms-1">/ 5.0</span>
                        </h5>
                        <small className="text-body-secondary">Nota media</small>
                    </div>
                </div>
                <div className="text-md-end">
                    <small className="d-block text-body-secondary mb-1 fw-bold">{userRating > 0 ? 'Tu valoración:' : 'Valora este evento:'}</small>
                    <div className="d-flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => handleRate(star)} onMouseEnter={() => setHoverRating(star)} className="btn btn-link p-0 text-decoration-none" style={{ fontSize: '1.8rem', color: (hoverRating || userRating) >= star ? '#ffc107' : '#e4e5e9' }} disabled={!token}>★</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border border-secondary-subtle mt-4 overflow-hidden rounded-4 mb-5 bg-body">
                <div className="card-header bg-transparent p-4 border-bottom border-secondary-subtle">
                    <h4 className="fw-bold m-0 d-flex align-items-center gap-2 text-body">
                        💬 Conversación <span className="badge bg-primary rounded-pill fs-6">{event.comments?.length || 0}</span>
                    </h4>
                </div>
                <div className="card-body p-4">
                    {event.comments && event.comments.length > 0 ? (
                        <div className="d-flex flex-column gap-4 mb-5">
                            {event.comments.map(comment => (
                                <div key={comment.id} className="d-flex gap-3">
                                    <img src={`https://ui-avatars.com/api/?name=${comment.user?.name}&background=random`} alt={comment.user?.name} className="rounded-circle shadow-sm mt-1" style={{width: '45px', height: '45px', objectFit: 'cover'}} />
                                    
                                    {/* SOLUCIÓN 2: Adiós position-absolute. Usamos Flexbox para alinear perfectamente la fecha y la X */}
                                    <div className="flex-grow-1 bg-body-tertiary p-3 rounded-4 border border-secondary-subtle">
                                        <div className="d-flex justify-content-between align-items-start mb-2"> 
                                            <h6 className="fw-bold m-0 text-body pt-1">
                                                {comment.user?.name || 'Usuario Anónimo'}
                                            </h6>
                                            <div className="d-flex align-items-center gap-3">
                                                <small className="text-body-secondary text-nowrap" style={{fontSize: '0.85rem'}}>
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </small>
                                                {(currentUserId === comment.user_id || isAdmin) && (
                                                    <button 
                                                        onClick={() => handleDeleteComment(comment.id)} 
                                                        className="btn btn-sm text-danger p-0 border-0 bg-transparent fw-bold" 
                                                        style={{fontSize: '1.4rem', lineHeight: '0.5'}}
                                                        title="Borrar comentario"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <p className="m-0 text-body" style={{whiteSpace: 'pre-line', fontSize: '0.95rem'}}>
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-body-secondary py-4 mb-5 border border-secondary-subtle rounded-4 bg-body-tertiary mx-3 shadow-sm">
                            <span style={{fontSize: '2.5rem'}}>🌱</span>
                            <p className="mt-2 mb-0">¡Sé el primero en opinar!</p>
                        </div>
                    )}
                    {token ? (
                        <form onSubmit={handlePostComment} className="bg-body-secondary p-4 rounded-4 border border-secondary-subtle shadow-sm mx-auto" style={{ maxWidth: '800px' }}>
                            <h6 className="fw-bold text-body mb-3">Añadir un comentario</h6>
                            <div className="d-flex gap-3 align-items-start">
                                <img src={localStorage.getItem('user_image') || `https://ui-avatars.com/api/?name=${localStorage.getItem('user_name')}&background=random`} alt="Yo" className="rounded-circle shadow-sm" style={{width: '45px', height: '45px', objectFit: 'cover'}} />
                                <div className="flex-grow-1">
                                    <textarea className="form-control border-secondary-subtle bg-body text-body shadow-sm rounded-3" rows="3" placeholder="Escribe tu opinión..." value={commentText} onChange={(e) => setCommentText(e.target.value)} required style={{resize: 'none'}}></textarea>
                                    <div className="d-flex justify-content-end pt-3">
                                        <button type="submit" className="btn btn-primary rounded-pill fw-bold px-4 shadow-sm" disabled={isSubmittingComment || !commentText.trim()}>{isSubmittingComment ? 'Publicando...' : 'Publicar'}</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="alert alert-secondary text-center rounded-4 border-0 m-0">Debes <Link to="/login" className="fw-bold text-decoration-none">iniciar sesión</Link> para comentar.</div>
                    )}
                </div>
            </div>

            {mapCoords && (
                <div className="card shadow-sm border-secondary border-opacity-25 mb-4 overflow-hidden bg-transparent rounded-4">
                    <div className="card-header bg-transparent p-4 border-bottom border-secondary border-opacity-25">
                        <h4 className="fw-bold m-0 text-body">🗺️ Cómo llegar</h4>
                        <p className="text-secondary m-0 mt-1">{address ? `${address}, ${city}` : city}</p>
                    </div>
                    <MapContainer center={mapCoords} zoom={15} style={{ height: '350px', width: '100%', zIndex: 0 }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                        <Marker position={mapCoords} icon={customIcon} />
                    </MapContainer>
                </div>
            )}
        </div>

        <div className="col-md-4">
            <div className="card shadow-sm p-4 sticky-top border-0 rounded-4 bg-body" style={{top: '20px'}}>
                <div className="text-center mb-4">
                    <h5 className="text-muted mb-1">{isFree ? 'Entrada' : 'Precio estimado'}</h5>
                    <h2 className={`fw-bold display-5 m-0 ${isFree ? 'text-success' : 'text-primary'}`}>{isFree ? 'GRATIS' : `$${event.price}`}</h2>
                </div>
                <ul className="list-group list-group-flush mb-4 small bg-transparent">
                    <li className="list-group-item d-flex justify-content-between px-0 bg-transparent border-secondary border-opacity-10 text-body"><span>Aforo disponible:</span><strong>{event.capacity} plazas</strong></li>
                    <li className="list-group-item d-flex justify-content-between px-0 bg-transparent border-0 text-body"><span>Categoría:</span><strong>{event.category?.name || 'General'}</strong></li>
                </ul>
                <div className="d-flex flex-column gap-3">
                    {event.external_link && (
                        <a href={event.external_link} target="_blank" rel="noopener noreferrer" className="btn btn-dark w-100 btn-lg shadow-sm rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2">🔗 Entradas Oficiales</a>
                    )}
                    {isEnrolled ? (
                        <div className="alert alert-success text-center border-0 bg-success bg-opacity-10 m-0 rounded-4 p-4 shadow-sm">
                            <span className="d-block fs-2 mb-2">✅</span>
                            <strong className="d-block text-success mb-3 fs-5">¡Estás apuntado!</strong>
                            <div className="d-flex flex-column gap-2">
                                <Link to="/dashboard" className="btn btn-success btn-sm rounded-pill fw-bold">Ver Dashboard</Link>
                                <button onClick={() => setShowModal(true)} className="btn btn-link text-danger text-decoration-none small fw-bold mt-2">❌ Ya no puedo asistir</button>
                            </div>
                        </div>
                    ) : event.capacity <= 0 ? (
                        <button className="btn btn-secondary w-100 btn-lg rounded-pill" disabled>Agotado</button>
                    ) : !token ? (
                        <Link to="/login" className="btn btn-outline-primary w-100 btn-lg rounded-pill">Inicia Sesión para Guardar</Link>
                    ) : (
                        <button onClick={handleEnroll} className={`btn w-100 btn-lg shadow-sm rounded-pill fw-bold ${event.external_link ? 'btn-outline-primary' : 'btn-primary'}`} disabled={processing}>{processing ? "Guardando..." : "📅 Me Apunto"}</button>
                    )}
                </div>
            </div>
        </div>
      </div>

      {showModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000 }}>
              <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 shadow-lg rounded-4 bg-body">
                      <div className="modal-header border-0 pt-4 px-4">
                          <h5 className="modal-title fw-bold text-body">¿Ya no puedes ir? 😢</h5>
                          <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                      </div>
                      <div className="modal-body px-4 text-secondary">Si confirmas, dejarás de estar inscrito en <strong>{event?.title}</strong>. ¡Tu plaza quedará libre!</div>
                      <div className="modal-footer border-0 p-4 gap-2">
                          <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowModal(false)}>Volver</button>
                          <button className="btn btn-danger rounded-pill px-4 fw-bold" onClick={handleUnenroll} disabled={processing}>{processing ? "Procesando..." : "Confirmar cancelación"}</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

export default EventDetail;