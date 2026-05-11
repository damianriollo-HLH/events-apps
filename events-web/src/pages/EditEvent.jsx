import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
// --- IMPORTACIONES DEL MAPA (Leaflet) ---
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';

// Configuración del icono de la chincheta (Corrección del bug de React-Leaflet)
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

/**
 * =========================================================================
 * COMPONENTE HIJO: LOCATION PICKER
 * =========================================================================
 * Geocodificación inversa: Traduce el clic en el mapa a una dirección en texto.
 */
function LocationPicker({ position, setPosition, setCity, setAddress }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);

            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then(res => res.json())
                .then(data => {
                    const addressData = data.address;
                    const foundCity = addressData.city || addressData.town || addressData.village || addressData.county || '';
                    const foundRoad = addressData.road || '';
                    const houseNumber = addressData.house_number || '';
                    
                    setCity(foundCity);
                    setAddress(`${foundRoad} ${houseNumber}`.trim() || data.display_name.split(',')[0]);
                })
                .catch(err => console.error("Error leyendo mapa:", err));
        },
    });
    return position ? <Marker position={position} icon={customIcon} /> : null;
}

/**
 * =========================================================================
 * COMPONENTE PRINCIPAL: EDIT EVENT
 * =========================================================================
 * ¿Para qué sirve?: Permite al usuario modificar un evento existente.
 * Reto principal: Desempaquetar los datos de Laravel (ej: fechas completas)
 * en fragmentos más pequeños para los inputs de React.
 */
function EditEvent() {
  // Extraemos el ID del evento de la URL (ej: /event/edit/5)
  const { id } = useParams();
  const navigate = useNavigate();

  // -----------------------------------------------------------------------
  // 1. ESTADOS DEL FORMULARIO
  // -----------------------------------------------------------------------
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState(''); 
  const [endTime, setEndTime] = useState(''); 

  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');  
  // Estado para las coordenadas del mapa (Por defecto Aspe)
  const [mapPosition, setMapPosition] = useState([38.3455, -0.7683]); 
  
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('');
  const [externalLink, setExternalLink] = useState('');
  
  const [capacity, setCapacity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState(null);       // Nueva imagen (si sube una)
  const [currentImage, setCurrentImage] = useState(null); // Imagen actual (para mostrarla)

  // Estados de control (UI)
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true); // Bloquea la UI hasta cargar los datos viejos
  const [error, setError] = useState(null);

  const token = localStorage.getItem('auth_token');

  // -----------------------------------------------------------------------
  // 2. EFECTO DE MONTAJE (Cargar Datos Previos)
  // -----------------------------------------------------------------------
  useEffect(() => {
    // A. Cargar lista de categorías disponibles
    fetch('http://127.0.0.1:8000/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error(err));

    // B. Cargar los datos específicos del evento a editar
    fetch(`http://127.0.0.1:8000/api/events/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
          // Rellenamos los campos directos
          setTitle(data.title);
          setDescription(data.description);
          setCapacity(data.capacity);
          setCategoryId(data.category_id);
          setCurrentImage(data.image);

          // Rellenar Precio: ¿Es gratis?
          if (parseFloat(data.price) === 0) {
              setIsFree(true);
              setPrice('');
          } else {
              setIsFree(false);
              setPrice(data.price);
          }
          
          if (data.external_link) setExternalLink(data.external_link);

          // DESEMPAQUETADO DE FECHAS: Separar '2026-05-11 10:00:00' en Fecha y Hora
          if (data.start_at) {
              setStartDate(data.start_at.substring(0, 10)); // Coge YYYY-MM-DD
              setStartTime(data.start_at.substring(11, 16)); // Coge HH:MM
          }
          if (data.end_at) {
              setEndDate(data.end_at.substring(0, 10));
              setEndTime(data.end_at.substring(11, 16));
          }

          // DESEMPAQUETADO DE UBICACIÓN: Separar "Ciudad | Dirección"
          if (data.location && data.location !== 'Online') {
              const parts = data.location.split(' | ');
              setCity(parts[0] || '');
              setAddress(parts[1] || '');
          }

          setLoadingData(false); // Datos listos, apagamos el loader
      })
      .catch(err => {
          console.error(err);
          setError("Error cargando el evento.");
          setLoadingData(false);
      });
  }, [id, token]);


  const handleImageChange = (e) => setImage(e.target.files[0]);

  // -----------------------------------------------------------------------
  // 3. ENVÍO DEL FORMULARIO (Actualización)
  // -----------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Volvemos a empaquetar fechas y ubicación para Laravel
    const finalStartAt = `${startDate} ${startTime}:00`;
    let finalEndAt = null;
    if (endDate && endTime) finalEndAt = `${endDate} ${endTime}:00`;
    const finalLocation = city && address ? `${city} | ${address}` : (city || address || 'Online');

    // Usamos FormData porque podría haber una nueva imagen adjunta
    const formData = new FormData();
    
    // === TRUCO MAESTRO ===
    // HTML/FormData nativo no soporta el método PUT. 
    // Engañamos a Laravel enviando un POST normal, pero le añadimos este campo oculto
    // para que el Backend sepa que realmente queremos hacer un PUT (Update).
    formData.append('_method', 'PUT'); 
    
    formData.append('title', title);
    formData.append('description', description);
    formData.append('start_at', finalStartAt);
    if (finalEndAt) formData.append('end_at', finalEndAt);
    formData.append('location', finalLocation);
    formData.append('price', isFree ? 0 : price);
    if (isFree || !externalLink) {
        formData.append('external_link', '');
    } else {
        formData.append('external_link', externalLink);
    }
    formData.append('capacity', capacity);
    formData.append('category_id', categoryId);
    
    // Si subió una foto nueva, la machacamos; si no, Laravel mantiene la vieja.
    if (image) formData.append('image', image);

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/events/${id}`, {
            method: 'POST', // OJO: Es POST por el truco de arriba
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // Feedback visual elegante (Toast)
            toast.success('¡Evento actualizado con éxito! ✏️', {
                style: {
                    borderRadius: '10px',
                    background: '#1f2229',
                    color: '#f8fafc',
                },
            });
            // UX: Esperamos un segundo para que el usuario lea el mensaje
            setTimeout(() => {
                navigate(`/event/${id}`); 
            }, 800);
        } else {
            setError(data.message || 'Error al actualizar el evento.');
            setLoading(false);
        }
    } catch (err) {
        setError('Error de conexión.');
        setLoading(false);
    }
  };

  // Loader de protección: Si los datos viejos no han cargado, no mostramos el formulario
  if (loadingData) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container my-5">
      <Link to={`/event/${id}`} className="btn btn-outline-secondary mb-3">← Volver al evento</Link>
      
      <div className="card shadow-lg border-0" style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div className="card-header bg-primary text-white p-4 text-center">
            <h2 className="mb-0">✏️ Editar Evento</h2>
        </div>
        
        <div className="card-body p-4 p-md-5">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* 1. INFO BÁSICA */}
                <h5 className="text-primary border-bottom pb-2 mb-4">1. Información Básica</h5>
                <div className="mb-4">
                    <label className="form-label fw-bold">Título del Evento</label>
                    <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                
                <div className="mb-4 p-3 rounded border text-body shadow-sm">
                    <label className="form-label fw-bold">Cambiar Imagen de portada</label>
                    {currentImage && (
                        <div className="mb-3 d-flex align-items-center gap-3 bg-transparent p-2 rounded border-secondary border-opacity-25 border">
                            <img src={currentImage} alt="Actual" className="shadow-sm" style={{ height: '60px', width: '90px', borderRadius: '5px', objectFit: 'cover' }} />
                            <small className="text-secondary fw-bold">Imagen actual promocional</small>
                        </div>
                    )}
                    <input type="file" className="form-control" onChange={handleImageChange} accept="image/*" />
                    <small className="text-secondary mt-1 d-block">Déjalo en blanco si no quieres cambiar la foto actual.</small>
                </div>

                <div className="mb-4">
                    <label className="form-label fw-bold">Descripción</label>
                    <textarea className="form-control" rows="3" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
                </div>

                {/* 2. CUÁNDO (FECHAS Y HORAS) */}
                <h5 className="text-primary border-bottom pb-2 mb-4 mt-5">2. ¿Cuándo será?</h5>
                <div className="row mb-4">
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold text-success">Inicio *</label>
                        <div className="d-flex gap-2">
                            <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                            <input type="time" className="form-control" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                        </div>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold text-muted">Fin (Opcional)</label>
                        <div className="d-flex gap-2">
                            <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
                            <input type="time" className="form-control" value={endTime} onChange={e => setEndTime(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* --- 3. DÓNDE (MAPA INTERACTIVO) --- */}
                <h5 className="text-primary border-bottom pb-2 mb-4 mt-4">3. ¿Dónde será?</h5>
                
                <div className="mb-3 rounded overflow-hidden shadow-sm border">
                    <div className="p-2 text-center text-secondary small fw-bold border-bottom">
                        👆 Haz clic en el mapa para actualizar la ubicación
                    </div>
                    <MapContainer center={mapPosition} zoom={14} style={{ height: '300px', width: '100%', zIndex: 0 }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <LocationPicker 
                            position={mapPosition} 
                            setPosition={setMapPosition} 
                            setCity={setCity} 
                            setAddress={setAddress} 
                        />
                    </MapContainer>
                </div>

                <div className="row mx-0 mb-4 p-3 rounded border text-body mt-3 shadow-sm">
                    <div className="col-md-4 mb-3 mb-md-0 px-2">
                        <label className="form-label fw-bold">Ciudad *</label>
                        <input type="text" className="form-control" value={city} onChange={e => setCity(e.target.value)} required />
                    </div>
                    <div className="col-md-8 px-2">
                        <label className="form-label fw-bold">Dirección o Recinto *</label>
                        <input type="text" className="form-control" placeholder="Ej: Teatro Principal..." value={address} onChange={e => setAddress(e.target.value)} required />
                    </div>
                </div>

                {/* 4. DETALLES Y ENTRADAS */}
                <h5 className="text-primary border-bottom pb-2 mb-4 mt-5">4. Entradas y Aforo</h5>
                <div className="row mb-4">
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Categoría *</label>
                        <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                            <option value="">-- Selecciona --</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Aforo Máximo *</label>
                        <input 
                            type="number" 
                            className="form-control" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} required />
                    </div>
                </div>

                <div className="p-3 rounded border mb-5 text-body shadow-sm">
                    <div className="form-check form-switch mb-3">
                        <input className="form-check-input fs-5 border-secondary" type="checkbox" role="switch" id="freeSwitch" checked={isFree} onChange={(e) => { setIsFree(e.target.checked); if(e.target.checked) setPrice(''); }} />
                        <label className="form-check-label fw-bold text-success fs-5 ms-2" htmlFor="freeSwitch">
                            ¡Entrada Gratuita!
                        </label>
                    </div>
                    {!isFree && (
                        <div className="input-group" style={{maxWidth: '300px'}}>
                            <span className="input-group-text fw-bold">Precio $</span>
                            <input 
                            type="number" 
                            className="form-control form-control-lg text-success fw-bold" 
                            min="1" 
                            step="0.01" 
                            value={price} 
                            onChange={e => setPrice(e.target.value)} required={!isFree} 
                            placeholder="0.00" />
                        </div>
                    )}
                </div>

                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold fs-5 shadow" disabled={loading}>
                    {loading ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}

export default EditEvent;