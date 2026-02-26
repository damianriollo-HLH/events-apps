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

  // Estados para la compra
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);

  // Estado para las coordenadas del mapa
  const [mapCoords, setMapCoords] = useState(null);

  const token = localStorage.getItem('auth_token');

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

  // 2. FUNCIÓN DE COMPRA (Igual que ayer)
  const handlePurchase = async () => {
    setProcessing(true);
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/events/${id}/enroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ quantity: quantity })
        });
        const data = await response.json();
        if (response.ok) {
            setTimeout(() => {
                alert(data.message);
                setShowModal(false); 
                setIsEnrolled(true); 
                setProcessing(false);
            }, 1000);
        } else {
            alert(data.message || "Error en la compra");
            setProcessing(false);
        }
    } catch (error) {
        alert("Error de conexión");
        setProcessing(false);
    }
  };

  const handleCloseModal = () => {
    if (window.confirm("¿Seguro que quieres abandonar la compra?")) {
        setShowModal(false);
        setQuantity(1);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!event) return <div className="container mt-5 text-center"><h3>Evento no encontrado</h3><Link to="/">Volver</Link></div>;

  const isFree = parseFloat(event.price) === 0;
  const totalPrice = (parseFloat(event.price) * quantity).toFixed(2);
  const serviceFee = isFree ? 0 : (totalPrice * 0.05).toFixed(2);
  const finalTotal = (parseFloat(totalPrice) + parseFloat(serviceFee)).toFixed(2);

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
                            <strong className="d-block text-dark">📅 Fecha y Hora</strong>
                            {new Date(event.start_at).toLocaleString()}
                        </div>
                        <div>
                            <strong className="d-block text-dark">📍 Ubicación</strong>
                            {city} {address && `- ${address}`}
                        </div>
                        <div>
                            <strong className="d-block text-dark">👤 Organiza</strong>
                            {event.user?.name || 'Usuario'}
                        </div>
                    </div>
                    
                    <h4 className="fw-bold mb-3">Acerca de este evento</h4>
                    <p className="card-text fs-5" style={{ whiteSpace: 'pre-line' }}>{event.description}</p>
                </div>
            </div>

            {/* --- ZONA DEL MAPA (SOLO SI HAY COORDENADAS) --- */}
            {mapCoords && (
                <div className="card shadow-sm border-0 mb-4 overflow-hidden">
                    <div className="card-header bg-white p-4 border-bottom-0">
                        <h4 className="fw-bold m-0">🗺️ Cómo llegar</h4>
                        <p className="text-muted m-0">{address ? `${address}, ${city}` : city}</p>
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

        {/* COLUMNA DERECHA: SIDEBAR DE COMPRA */}
        <div className="col-md-4">
            <div className="card shadow-sm p-4 sticky-top border-0" style={{top: '20px'}}>
                <div className="text-center mb-4">
                    <h5 className="text-muted mb-1">{isFree ? 'Entrada' : 'Precio por entrada'}</h5>
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
                
                {/* LÓGICA DEL BOTÓN PRINCIPAL */}
                {isEnrolled ? (
                    <div className="alert alert-success text-center border-0 bg-success bg-opacity-10">
                        <span className="d-block fs-1 mb-2">✅</span>
                        <strong className="d-block text-success mb-2">¡Ya tienes tus entradas!</strong>
                        <Link to="/dashboard" className="btn btn-success btn-sm w-100 rounded-pill">Ver mis entradas</Link>
                    </div>
                ) : event.capacity <= 0 ? (
                    <button className="btn btn-secondary w-100 btn-lg rounded-pill" disabled>Agotado</button>
                ) : !token ? (
                    <Link to="/login" className="btn btn-primary w-100 btn-lg shadow-sm rounded-pill">Inicia Sesión para Comprar</Link>
                ) : isFree ? (
                    <button onClick={() => { setQuantity(1); handlePurchase(); }} className="btn btn-success w-100 btn-lg shadow-sm rounded-pill fw-bold" disabled={processing}>
                        {processing ? "Apuntando..." : "🎟 Inscribirse Gratis"}
                    </button>
                ) : (
                    <button onClick={() => setShowModal(true)} className="btn btn-dark w-100 btn-lg shadow-sm rounded-pill fw-bold">
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
            <div className="card shadow-lg border-0 rounded-4" style={{ width: '90%', maxWidth: '450px', zIndex: 1050, animation: 'fadeIn 0.3s' }}>
                <div className="card-header bg-white border-bottom-0 d-flex justify-content-between align-items-center p-4 pb-0">
                    <h4 className="mb-0 fw-bold">Finalizar Compra</h4>
                    <button onClick={handleCloseModal} className="btn-close" aria-label="Close"></button>
                </div>
                
                <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4 bg-light p-3 rounded-3">
                        <div style={{width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden'}}>
                            <img src={event.image || "https://placehold.co/100x100"} alt="mini" className="w-100 h-100" style={{objectFit: 'cover'}}/>
                        </div>
                        <div>
                            <h6 className="fw-bold mb-1 text-truncate" style={{maxWidth: '250px'}}>{event.title}</h6>
                            <small className="text-muted">📅 {new Date(event.start_at).toLocaleDateString()}</small>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-bold text-muted small text-uppercase">Cantidad de Entradas</label>
                        <div className="d-flex align-items-center gap-3">
                            <button className="btn btn-outline-dark rounded-circle d-flex justify-content-center align-items-center" style={{width: '40px', height: '40px'}} onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>-</button>
                            <span className="fs-3 fw-bold">{quantity}</span>
                            <button className="btn btn-outline-dark rounded-circle d-flex justify-content-center align-items-center" style={{width: '40px', height: '40px'}} onClick={() => setQuantity(q => Math.min(10, Math.min(event.capacity, q + 1)))}>+</button>
                        </div>
                    </div>

                    <div className="bg-light p-4 rounded-4 mb-4">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Entradas x {quantity}</span>
                            <span className="fw-bold">${totalPrice}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                            <span className="text-muted">Gastos de gestión (5%)</span>
                            <span className="fw-bold">${serviceFee}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold fs-5">Total a pagar</span>
                            <span className="text-success fw-bold fs-3">${finalTotal}</span>
                        </div>
                    </div>

                    <button onClick={handlePurchase} className="btn btn-primary w-100 btn-lg py-3 fw-bold rounded-pill shadow-sm" disabled={processing}>
                        {processing ? <span className="spinner-border spinner-border-sm me-2"></span> : `💳 Pagar de forma segura`}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default EventDetail;