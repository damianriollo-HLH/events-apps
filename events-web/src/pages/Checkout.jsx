import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function Checkout() {
  const { id } = useParams(); // ID del evento
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1); // Por defecto 1 entrada
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); // Estado "Pagando..."
  const [error, setError] = useState(null);

  // Cargar datos del evento para mostrar resumen
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/events/${id}`)
      .then(res => res.json())
      .then(data => {
        setEvent(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, [id]);

  const handlePurchase = async () => {
    setProcessing(true);
    setError(null);
    const token = localStorage.getItem('auth_token');

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/events/${id}/enroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ quantity: quantity }) // Enviamos la cantidad
        });

        const data = await response.json();

        if (response.ok) {
            // ÉXITO: Simulamos un pequeño delay para que parezca que procesa el pago
            setTimeout(() => {
                alert(data.message); // "¡Has conseguido X entradas!"
                navigate('/dashboard'); // Te lleva a tus entradas
            }, 1500);
        } else {
            setError(data.message || "Error en la compra");
            setProcessing(false);
        }
    } catch (err) {
        setError("Error de conexión");
        setProcessing(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  if (!event) return <div className="text-center py-5">Evento no encontrado</div>;

  // Cálculos de precio
  const pricePerTicket = parseFloat(event.price);
  const totalPrice = (pricePerTicket * quantity).toFixed(2);
  const serviceFee = (totalPrice * 0.05).toFixed(2); // 5% de gastos de gestión (falso, para realismo)
  const finalTotal = (parseFloat(totalPrice) + parseFloat(serviceFee)).toFixed(2);

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        {/* COLUMNA IZQUIERDA: RESUMEN DEL EVENTO */}
        <div className="col-md-5 mb-4">
            <div className="card shadow-sm border-0">
                <img 
                    src={event.image || "https://placehold.co/600x400"} 
                    className="card-img-top" 
                    alt="Evento" 
                    style={{height: '200px', objectFit: 'cover'}}
                />
                <div className="card-body">
                    <h4 className="fw-bold">{event.title}</h4>
                    <p className="text-muted mb-1">📅 {new Date(event.start_at).toLocaleDateString()} • 📍 {event.location || 'Online'}</p>
                    <hr />
                    <p className="small">{event.description.substring(0, 100)}...</p>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: SELECCIÓN Y PAGO */}
        <div className="col-md-5">
            <div className="card shadow-lg border-0 p-4">
                <h3 className="fw-bold mb-4">Finalizar Compra</h3>
                
                {error && <div className="alert alert-danger">{error}</div>}

                {/* SELECTOR DE CANTIDAD */}
                <div className="mb-4">
                    <label className="form-label fw-bold">Selecciona Entradas</label>
                    <div className="d-flex align-items-center gap-3">
                        <button 
                            className="btn btn-outline-secondary rounded-circle" 
                            style={{width: '40px', height: '40px'}}
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                        >-</button>
                        <span className="fs-4 fw-bold">{quantity}</span>
                        <button 
                            className="btn btn-outline-secondary rounded-circle"
                            style={{width: '40px', height: '40px'}}
                            onClick={() => setQuantity(q => Math.min(10, q + 1))} // Máx 10
                        >+</button>
                    </div>
                </div>

                {/* RESUMEN DE PRECIOS */}
                <div className="bg-light p-3 rounded mb-4">
                    <div className="d-flex justify-content-between mb-2">
                        <span>Entradas x {quantity}</span>
                        <span>${totalPrice}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 text-muted small">
                        <span>Gastos de gestión</span>
                        <span>${serviceFee}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold fs-5">
                        <span>Total a pagar</span>
                        <span className="text-success">${finalTotal}</span>
                    </div>
                </div>

                {/* BOTÓN DE PAGAR */}
                <button 
                    onClick={handlePurchase} 
                    className="btn btn-success w-100 btn-lg py-3 fw-bold shadow-sm"
                    disabled={processing}
                >
                    {processing ? (
                        <span><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</span>
                    ) : (
                        `Pagar $${finalTotal}`
                    )}
                </button>
                
                <div className="text-center mt-3">
                    <Link to={`/event/${id}`} className="text-muted small text-decoration-none">Cancelar y volver</Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;