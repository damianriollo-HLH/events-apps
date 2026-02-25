import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- ESTADOS BÁSICOS ---
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false); 
  const [rating, setRating] = useState(0); 
  const [hover, setHover] = useState(0);   

  // --- ESTADOS PARA LA COMPRA (NUEVO) ---
  const [showModal, setShowModal] = useState(false); // Controla si se ve la ventana flotante
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem('auth_token');
  const currentUserId = parseInt(localStorage.getItem('user_id'));

  // 1. CARGAR DATOS
  useEffect(() => {
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`http://127.0.0.1:8000/api/events/${id}`, { headers })
      .then(res => res.json())
      .then(data => {
        setEvent(data);
        setLoading(false);
        if (data.user_rating) setRating(data.user_rating);
        setIsEnrolled(data.is_enrolled);
      })
      .catch(err => console.error("Error:", err));
  }, [id, token]);

  // 2. FUNCIÓN DE COMPRA / INSCRIPCIÓN (MODIFICADA)
  const handlePurchase = async () => {
    setProcessing(true);
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/events/${id}/enroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity: quantity })
        });

        const data = await response.json();

        if (response.ok) {
            setTimeout(() => {
                alert(data.message);
                setShowModal(false); // Cerramos el modal
                setIsEnrolled(true); // Actualizamos la vista
                setProcessing(false);
            }, 1000); // Pequeño efecto de "procesando..."
        } else {
            alert(data.message || "Error en la compra");
            setProcessing(false);
        }
    } catch (error) {
        alert("Error de conexión");
        setProcessing(false);
    }
  };

  // 3. INTENTAR CERRAR EL MODAL (Aviso de abandono)
  const handleCloseModal = () => {
    const confirmClose = window.confirm("¿Seguro que quieres abandonar la compra? Tus entradas no se guardarán.");
    if (confirmClose) {
        setShowModal(false);
        setQuantity(1); // Reseteamos cantidad
    }
  };

  // ... (Mantenemos las funciones handleRate, handleCommentSubmit, handleCommentDelete, handleDeleteEvent igual que ayer) ...
  // Por brevedad en este ejemplo, las dejo indicadas, asegúrate de mantenerlas de tu código anterior o copiarlas si las necesitas.
  const handleRate = async (stars) => { /* Tu código de ayer */ };
  const handleCommentSubmit = async (e) => { e.preventDefault(); /* Tu código de ayer */ };
  const handleCommentDelete = async (commentId) => { /* Tu código de ayer */ };
  const handleDeleteEvent = async () => { /* Tu código de ayer */ };


  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!event) return <div className="container mt-5">Evento no encontrado</div>;

  const isFree = parseFloat(event.price) === 0;
  const totalPrice = (parseFloat(event.price) * quantity).toFixed(2);
  const serviceFee = isFree ? 0 : (totalPrice * 0.05).toFixed(2);
  const finalTotal = (parseFloat(totalPrice) + parseFloat(serviceFee)).toFixed(2);

  return (
    <div className="container my-5 position-relative">
      <Link to="/" className="btn btn-outline-secondary mb-3">← Volver</Link>
      
      <div className="row">
        {/* COLUMNA IZQUIERDA: DETALLES (Mismo de ayer) */}
        <div className="col-md-8">
            <div className="card shadow-sm mb-4">
                <img src={event.image || "https://placehold.co/800x400"} className="card-img-top" alt="Poster" style={{maxHeight: '400px', objectFit:'cover'}} />
                <div className="card-body">
                    {isFree && <span className="badge bg-success mb-2 fs-6">¡Evento Gratuito!</span>}
                    <h1 className="card-title fw-bold">{event.title}</h1>
                    <p className="text-muted">📅 {new Date(event.start_at).toLocaleDateString()} | 📍 {event.location || 'Online'}</p>
                    <hr />
                    <p className="card-text lead">{event.description}</p>
                </div>
            </div>
            {/* Aquí iría la zona de comentarios que ya tenías */}
        </div>

        {/* COLUMNA DERECHA: SIDEBAR DE COMPRA */}
        <div className="col-md-4">
            <div className="card shadow-sm p-4 sticky-top" style={{top: '20px'}}>
                <h5 className="text-muted mb-1">{isFree ? 'Entrada' : 'Precio por entrada'}</h5>
                <h2 className={`fw-bold mb-3 ${isFree ? 'text-success' : 'text-dark'}`}>
                    {isFree ? 'GRATIS' : `$${event.price}`}
                </h2>
                
                <ul className="list-unstyled mb-4 text-muted small">
                    <li><strong>Aforo disponible:</strong> {event.capacity} plazas</li>
                    <li><strong>Categoría:</strong> {event.category?.name || 'General'}</li>
                </ul>
                
                {/* LÓGICA DEL BOTÓN PRINCIPAL */}
                {isEnrolled ? (
                    <div className="alert alert-success text-center">
                        <span className="d-block fs-2">✅</span>
                        <strong>¡Ya estás apuntado!</strong>
                        <Link to="/dashboard" className="btn btn-outline-success btn-sm w-100 mt-2">Ver mis entradas</Link>
                    </div>
                ) : event.capacity <= 0 ? (
                    <button className="btn btn-secondary w-100 btn-lg" disabled>Agotado</button>
                ) : !token ? (
                    <Link to="/login" className="btn btn-primary w-100 btn-lg shadow-sm">Iniciar Sesión para Inscribirse</Link>
                ) : isFree ? (
                    // EVENTO GRATIS: Compra directa con 1 clic (cantidad 1 por defecto)
                    <button onClick={() => { setQuantity(1); handlePurchase(); }} className="btn btn-success w-100 btn-lg shadow-sm" disabled={processing}>
                        {processing ? "Apuntando..." : "🎟 Inscribirse Gratis"}
                    </button>
                ) : (
                    // EVENTO DE PAGO: Abre el Pop-up (Modal)
                    <button onClick={() => setShowModal(true)} className="btn btn-dark w-100 btn-lg shadow-sm">
                        🎟 Conseguir Entradas
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* VENTANA FLOTANTE DE CHECKOUT (MODAL)                      */}
      {/* ======================================================= */}
      {showModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1040, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card shadow-lg border-0" style={{ width: '90%', maxWidth: '500px', zIndex: 1050, animation: 'fadeIn 0.3s' }}>
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center p-3">
                    <h5 className="mb-0 fw-bold">Finalizar Compra</h5>
                    <button onClick={handleCloseModal} className="btn-close btn-close-white" aria-label="Close"></button>
                </div>
                
                <div className="card-body p-4">
                    <h5 className="fw-bold">{event.title}</h5>
                    <p className="text-muted small mb-4">📍 {event.location || 'Online'} | 📅 {new Date(event.start_at).toLocaleDateString()}</p>

                    <div className="mb-4">
                        <label className="form-label fw-bold">Selecciona Entradas (Max 10)</label>
                        <div className="d-flex align-items-center gap-3">
                            <button className="btn btn-outline-secondary rounded-circle" style={{width: '40px', height: '40px'}} onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>-</button>
                            <span className="fs-4 fw-bold">{quantity}</span>
                            <button className="btn btn-outline-secondary rounded-circle" style={{width: '40px', height: '40px'}} onClick={() => setQuantity(q => Math.min(10, Math.min(event.capacity, q + 1)))}>+</button>
                        </div>
                    </div>

                    <div className="bg-light p-3 rounded mb-4">
                        <div className="d-flex justify-content-between mb-2">
                            <span>Entradas x {quantity}</span>
                            <span>${totalPrice}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2 text-muted small">
                            <span>Gastos de gestión (5%)</span>
                            <span>${serviceFee}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between fw-bold fs-5">
                            <span>Total a pagar</span>
                            <span className="text-success">${finalTotal}</span>
                        </div>
                    </div>

                    <button onClick={handlePurchase} className="btn btn-success w-100 btn-lg py-3 fw-bold" disabled={processing}>
                        {processing ? <span className="spinner-border spinner-border-sm me-2"></span> : `💳 Pagar $${finalTotal}`}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default EventDetail;