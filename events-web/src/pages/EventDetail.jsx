import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- ESTADOS ---
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false); // Estado para saber si estoy apuntado

  // Estados para las estrellas
  const [rating, setRating] = useState(0); // Nota actual
  const [hover, setHover] = useState(0);   // Efecto visual (hover)

  // Datos de sesión
  const token = localStorage.getItem('auth_token');
  const currentUserId = parseInt(localStorage.getItem('user_id'));

  // 1. CARGAR DATOS DEL EVENTO
  useEffect(() => {
    const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`http://127.0.0.1:8000/api/events/${id}`, { headers })
      .then(res => res.json())
      .then(data => {
        setEvent(data);
        setLoading(false);

        if (data.user_rating) {
            setRating(data.user_rating);
        }
        
        setIsEnrolled(data.is_enrolled);
      })
      .catch(err => console.error("Error cargando evento:", err));
  }, [id, token]);


  // 2. FUNCIÓN PARA BORRAR EVENTO (Admin/Dueño)
  const handleDeleteEvent = async () => {
    if (!window.confirm("¿Seguro que quieres borrar este evento?")) return;
    
    const res = await fetch(`http://127.0.0.1:8000/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
        alert("Evento borrado");
        window.location.href = '/'; 
    } else {
        alert("No tienes permiso o hubo un error.");
    }
  };

  // 3. FUNCIÓN PARA VOTAR (ESTRELLAS)
  const handleRate = async (stars) => {
    if (!token) {
        alert("Debes iniciar sesión para votar.");
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/events/${id}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ stars: stars })
        });

        if (response.ok) {
            setRating(stars); 
            alert(`¡Gracias! Has votado con ${stars} estrellas ⭐`);
        } else {
            alert("Error al guardar tu voto.");
        }
    } catch (error) {
        console.error("Error votando:", error);
    }
  };

  // 4. FUNCIÓN PARA ENVIAR COMENTARIO
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/events/${id}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: newComment })
        });

        if (response.ok) {
            const commentCreated = await response.json();
            setEvent({ ...event, comments: [commentCreated, ...event.comments] });
            setNewComment(""); 
        } else {
            alert("Error al publicar comentario");
        }
    } catch (error) {
        console.error(error);
    }
  };

  // 5. FUNCIÓN PARA BORRAR COMENTARIO
  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("¿Borrar comentario?")) return;
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            setEvent({ ...event, comments: event.comments.filter(c => c.id !== commentId) });
        }
    } catch (error) { console.error(error); }
  };

  // (HEMOS QUITADO handleEnroll PORQUE AHORA LA COMPRA SE HACE EN CHECKOUT)

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!event) return <div className="container mt-5">Evento no encontrado</div>;

  return (
    <div className="container my-5">
      <Link to="/" className="btn btn-outline-secondary mb-3">← Volver</Link>
      
      <div className="row">
        {/* COLUMNA IZQUIERDA: DETALLES */}
        <div className="col-md-8">
            <div className="card shadow-sm mb-4">
                <img src={event.image || "https://placehold.co/800x400?text=Evento"} className="card-img-top" alt="Poster" />
                <div className="card-body">
                    <h1 className="card-title fw-bold">{event.title}</h1>
                    <p className="text-muted">📅 {new Date(event.start_at).toLocaleDateString()} | 📍 {event.location || 'Online'}</p>
                    <hr />
                    <p className="card-text lead">{event.description}</p>
                    <h3 className="text-success fw-bold">${event.price}</h3>
                    
                    {/* --- ZONA DE ESTRELLAS --- */}
                    <div className="mb-3 mt-4">
                        <span className="fw-bold me-2">Valora este evento:</span>
                        {[...Array(5)].map((star, index) => {
                            const ratingValue = index + 1;
                            return (
                                <span 
                                    key={ratingValue} 
                                    style={{ 
                                        cursor: 'pointer', 
                                        color: ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9", 
                                        fontSize: "2rem",
                                        transition: "color 0.2s"
                                    }}
                                    onClick={() => handleRate(ratingValue)}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                >
                                    ★
                                </span>
                            );
                        })}
                        <div className="text-muted small mt-1">
                            {event.ratings_avg_stars 
                                ? `Nota media: ${parseFloat(event.ratings_avg_stars).toFixed(1)} / 5` 
                                : "Sé el primero en votar"}
                        </div>
                    </div>

                    {/* --- BOTONES DE ADMIN / DUEÑO --- */}
                    {event.can_edit && (
                        <div className="mt-4 border-top pt-3">
                            <button onClick={handleDeleteEvent} className="btn btn-danger me-2">🗑 Borrar Evento</button>
                            <Link to={`/event/edit/${id}`} className="btn btn-primary">✏️ Editar Evento</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* ZONA DE COMENTARIOS */}
            <div className="card shadow-sm bg-light">
                <div className="card-body">
                    <h4 className="mb-4">💬 Comentarios ({event.comments ? event.comments.length : 0})</h4>
                    
                    {token ? (
                        <form onSubmit={handleCommentSubmit} className="mb-4 d-flex gap-2">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Escribe tu opinión..." 
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary">Enviar</button>
                        </form>
                    ) : (
                        <p className="text-muted">Debes <Link to="/login">iniciar sesión</Link> para comentar.</p>
                    )}

                    <div className="list-group list-group-flush">
                        {event.comments && event.comments.map(comment => (
                            <div key={comment.id} className="list-group-item bg-transparent d-flex align-items-start gap-3">
                                <img 
                                    src={comment.user.image || "https://ui-avatars.com/api/?name=" + comment.user.name + "&background=random"} 
                                    alt="Avatar" 
                                    className="rounded-circle"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between">
                                        <strong className="text-primary">{comment.user ? comment.user.name : 'Usuario'}</strong>
                                        {token && comment.user_id === currentUserId && (
                                            <button 
                                                onClick={() => handleCommentDelete(comment.id)} 
                                                className="btn btn-sm text-danger border-0 p-0"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-muted small d-block mb-1">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                    <p className="mb-0">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: SIDEBAR */}
        <div className="col-md-4">
            <div className="card shadow-sm p-4 sticky-top" style={{top: '20px'}}>
                <h5 className="text-muted mb-1">Precio por entrada</h5>
                <h2 className="fw-bold text-success mb-3">${event.price}</h2>
                
                <ul className="list-unstyled mb-4">
                    <li><strong>Categoría:</strong> {event.category ? event.category.name : 'General'}</li>
                    <li><strong>Organizador:</strong> {event.user ? event.user.name : 'Anónimo'}</li>
                </ul>
                
                {/* --- AQUÍ ESTÁ EL CAMBIO CLAVE --- */}
                {isEnrolled ? (
                    // CASO A: YA TIENE ENTRADA -> Muestra mensaje (o botón dashboard)
                    <div className="alert alert-success text-center">
                        <span className="d-block fs-2">✅</span>
                        <strong>¡Ya tienes entradas!</strong>
                        <Link to="/dashboard" className="btn btn-outline-success btn-sm w-100 mt-2">
                            Ver mis entradas
                        </Link>
                    </div>
                ) : (
                    // CASO B: NO TIENE ENTRADA -> Botón "Comprar" que lleva al Checkout
                    token ? (
                        <Link to={`/checkout/${id}`} className="btn btn-success w-100 btn-lg shadow-sm">
                            🎟 Conseguir Entradas
                        </Link>
                    ) : (
                        <Link to="/login" className="btn btn-primary w-100 btn-lg shadow-sm">
                            Iniciar Sesión para Comprar
                        </Link>
                    )
                )}

                <small className="text-muted d-block mt-3 text-center">
                    🔒 Compra 100% segura
                </small>
            </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;