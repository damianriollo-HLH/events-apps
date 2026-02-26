import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// --- IMPORTACIONES DEL MAPA ---
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Arreglo para el icono por defecto del marcador en React
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// --- SUB-COMPONENTE: EL CLIC EN EL MAPA ---
function LocationPicker({ position, setPosition, setCity, setAddress }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]); // Ponemos la chincheta

            // Magia: Convertimos coordenadas en Ciudad y Calle (Geocodificación Inversa)
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then(res => res.json())
                .then(data => {
                    const addressData = data.address;
                    // Intentamos sacar la ciudad (a veces se llama town o village)
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

// --- COMPONENTE PRINCIPAL ---
function CreateEvent() {
  const navigate = useNavigate();
  
  // --- ESTADOS DEL FORMULARIO ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Fechas y Horas separadas para mejor UX
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState(''); 
  const [endTime, setEndTime] = useState(''); 

  // Ubicación estructurada
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  
  // Estado para las coordenadas del mapa (Por defecto Aspe)
  const [mapPosition, setMapPosition] = useState([38.3455, -0.7683]);
  // Lógica de Precio
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('');

  const [capacity, setCapacity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error(err));
  }, []);

  const handleImageChange = (e) => setImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Unimos Fechas y Horas para el Backend (Formato YYYY-MM-DD HH:MM)
    const finalStartAt = `${startDate} ${startTime}:00`;
    let finalEndAt = null;
    if (endDate && endTime) finalEndAt = `${endDate} ${endTime}:00`;
    
    // 2. Unimos la Ubicación para facilitar el filtro en el futuro
    // Guardaremos algo como: "Madrid | Calle Falsa 123"
    const finalLocation = city && address ? `${city} | ${address}` : (city || address || 'Online');

    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    
    formData.append('title', title);
    formData.append('description', description);
    formData.append('start_at', finalStartAt);
    if (finalEndAt) formData.append('end_at', finalEndAt);
    formData.append('location', finalLocation);
    formData.append('price', isFree ? 0 : price);
    formData.append('capacity', capacity);
    formData.append('category_id', categoryId);
    if (image) formData.append('image', image);

    try {
        const response = await fetch('http://127.0.0.1:8000/api/events', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
            body: formData
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('¡Evento creado con éxito! 🎉');
            navigate('/dashboard');
        } else {
            setError(data.message || 'Error al crear el evento.');
            setLoading(false);
        }
    } catch (err) {
        setError('Error de conexión.');
        setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow-lg border-0" style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div className="card-header bg-dark text-white p-4 text-center">
            <h2 className="mb-0">✨ Crear Nuevo Evento</h2>
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
                <div className="mb-4">
                    <label className="form-label fw-bold">Imagen de portada</label>
                    <input type="file" className="form-control" onChange={handleImageChange} accept="image/*" />
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
                    <div className="bg-light p-2 text-center text-muted small fw-bold">
                        👆 Haz clic en el mapa para ubicar tu evento
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

                <div className="row mb-4 bg-light p-3 rounded border">
                    <div className="col-md-4 mb-3 mb-md-0">
                        <label className="form-label fw-bold">Ciudad *</label>
                        <input type="text" className="form-control" placeholder="Autocompletado..." value={city} onChange={e => setCity(e.target.value)} required />
                    </div>
                    <div className="col-md-8">
                        <label className="form-label fw-bold">Dirección o Recinto *</label>
                        <input type="text" className="form-control" placeholder="Autocompletado..." value={address} onChange={e => setAddress(e.target.value)} required />
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
                        <input type="number" className="form-control" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} required />
                    </div>
                </div>

                <div className="p-3 bg-light rounded border mb-5">
                    <div className="form-check form-switch mb-3">
                        <input className="form-check-input fs-5" type="checkbox" role="switch" id="freeSwitch" checked={isFree} onChange={(e) => { setIsFree(e.target.checked); if(e.target.checked) setPrice(''); }} />
                        <label className="form-check-label fw-bold text-success fs-5 ms-2" htmlFor="freeSwitch">
                            ¡Entrada Gratuita!
                        </label>
                    </div>
                    {!isFree && (
                        <div className="input-group" style={{maxWidth: '300px'}}>
                            <span className="input-group-text bg-white fw-bold">Precio $</span>
                            <input type="number" className="form-control form-control-lg text-success fw-bold" min="1" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required={!isFree} placeholder="0.00" />
                        </div>
                    )}
                </div>

                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold fs-5 shadow" disabled={loading}>
                    {loading ? 'Procesando...' : '🚀 Publicar Evento'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;