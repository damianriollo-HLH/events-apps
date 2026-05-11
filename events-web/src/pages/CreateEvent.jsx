import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

/**
 * =========================================================================
 * CONFIGURACIÓN LEAFLET (Solución a bug de iconos)
 * =========================================================================
 * React-Leaflet tiene un bug conocido donde no encuentra la ruta de las imágenes 
 * de los marcadores por defecto al compilar. Aquí forzamos la ruta manual.
 */
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

/**
 * =========================================================================
 * COMPONENTE HIJO: LOCATION PICKER (El Selector del Mapa)
 * =========================================================================
 * ¿Para qué sirve?: Escucha los clics en el mapa. Cuando el usuario hace clic,
 * captura la latitud/longitud y hace una petición a OpenStreetMap para 
 * traducir esas coordenadas en una dirección legible (Geocodificación Inversa).
 */
function LocationPicker({ position, setPosition, setCity, setAddress }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]); // Movemos la chincheta

            // API Externa: Nominatim (OpenStreetMap) -> Traduce Lat/Lng a Texto
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then(res => res.json())
                .then(data => {
                    const addressData = data.address;
                    // Buscamos el nombre de la ciudad en distintos campos posibles
                    const foundCity = addressData.city || addressData.town || addressData.village || addressData.county || '';
                    const foundRoad = addressData.road || '';
                    const houseNumber = addressData.house_number || '';
                    
                    // Actualizamos los inputs del formulario automáticamente
                    setCity(foundCity);
                    setAddress(`${foundRoad} ${houseNumber}`.trim() || data.display_name.split(',')[0]);
                })
                .catch(err => console.error("Error en geocodificación:", err));
        },
    });
    // Solo dibuja el marcador si hay una posición seleccionada
    return position ? <Marker position={position} icon={customIcon} /> : null;
}

/**
 * =========================================================================
 * COMPONENTE PRINCIPAL: CREATE EVENT (Formulario de Creación)
 * =========================================================================
 */
function CreateEvent() {
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
  const [mapPosition, setMapPosition] = useState([38.3455, -0.7683]); // Coordenadas por defecto (Alicante)
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [capacity, setCapacity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState(null); // Estado especial para la imagen física

  // Estados de control (UI)
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // -----------------------------------------------------------------------
  // 2. CARGA INICIAL (Fetch de Categorías)
  // -----------------------------------------------------------------------
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error("Error cargando categorías:", err));
  }, []);

  // Función para capturar el archivo de imagen del input type="file"
  const handleImageChange = (e) => setImage(e.target.files[0]);

  // -----------------------------------------------------------------------
  // 3. ENVÍO DEL FORMULARIO (Manejo de FormData)
  // -----------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // Reseteamos errores previos

    // Formateamos las fechas y ubicación para que a Laravel le gusten
    const finalStartAt = (startDate && startTime) ? `${startDate} ${startTime}:00` : '';
    const finalEndAt = (endDate && endTime) ? `${endDate} ${endTime}:00` : null;
    const finalLocation = city && address ? `${city} | ${address}` : (city || address || 'Online');

    const token = localStorage.getItem('auth_token');
    
    // ATENCIÓN: Usamos FormData en lugar de JSON para poder enviar la IMAGEN
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('start_at', finalStartAt);
    if (finalEndAt) formData.append('end_at', finalEndAt);
    formData.append('location', finalLocation);
    formData.append('price', isFree ? 0 : price);
    formData.append('capacity', capacity);
    formData.append('category_id', categoryId);
    
    // Solo añadimos la imagen si el usuario subió una
    if (image) formData.append('image', image);
    
    if (!isFree && externalLink.trim() !== '') {
        formData.append('external_link', externalLink);
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/events', {
            method: 'POST',
            // OJO: No le ponemos 'Content-Type': 'application/json' porque FormData
            // genera su propio Content-Type multipart/form-data automáticamente.
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Accept': 'application/json' 
            },
            body: formData // Enviamos el objeto FormData crudo
        });

        const data = await response.json();
        
        if (response.ok) {
            // Éxito: Mostramos el modal de celebración
            setShowSuccessModal(true);
        } else if (response.status === 422) {
            // Error de validación: Laravel se queja de algún campo
            setErrors(data.errors);
            toast.error('Revisa los campos marcados.');
        } else {
            toast.error(data.message || 'Error al crear evento.');
        }
    } catch (err) {
        toast.error('Error de conexión.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow-lg border-0 rounded-4 bg-body" style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div className="card-header bg-transparent border-bottom p-4 text-center">
            <h2 className="mb-0 fw-bold text-body">✨ Crear Nuevo Evento</h2>
        </div>
        
        <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit}>
                <h5 className="text-primary border-bottom pb-2 mb-4">1. Información Básica</h5>
                <div className="mb-4">
                    <label className="form-label fw-bold">Título del Evento *</label>
                    <input type="text" className={`form-control ${errors.title ? 'is-invalid' : ''}`} value={title} onChange={e => setTitle(e.target.value)} />
                    {errors.title && <div className="invalid-feedback fw-bold">{errors.title[0]}</div>}
                </div>
                
                <div className="mb-4">
                    <label className="form-label fw-bold">Imagen de portada</label>
                    <input type="file" className="form-control" onChange={handleImageChange} accept="image/*" />
                </div>
                
                <div className="mb-4">
                    <label className="form-label fw-bold">Descripción *</label>
                    <textarea className={`form-control ${errors.description ? 'is-invalid' : ''}`} rows="3" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                    {errors.description && <div className="invalid-feedback fw-bold">{errors.description[0]}</div>}
                </div>
                
                <h5 className="text-primary border-bottom pb-2 mb-4 mt-5">2. ¿Cuándo será?</h5>
                <div className="row mb-4">
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold text-success">Inicio *</label>
                        <div className="d-flex gap-2">
                            <input type="date" className={`form-control ${errors.start_at ? 'is-invalid' : ''}`} value={startDate} onChange={e => setStartDate(e.target.value)} />
                            <input type="time" className={`form-control ${errors.start_at ? 'is-invalid' : ''}`} value={startTime} onChange={e => setStartTime(e.target.value)} />
                        </div>
                        {errors.start_at && <small className="text-danger fw-bold">{errors.start_at[0]}</small>}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold text-muted">Fin (Opcional)</label>
                        <div className="d-flex gap-2">
                            <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
                            <input type="time" className="form-control" value={endTime} onChange={e => setEndTime(e.target.value)} />
                        </div>
                    </div>
                </div>

                <h5 className="text-primary border-bottom pb-2 mb-4 mt-4">3. ¿Dónde será?</h5>
                <div className="mb-3 rounded overflow-hidden shadow-sm border">
                    <MapContainer center={mapPosition} zoom={14} style={{ height: '300px', width: '100%', zIndex: 0 }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                        <LocationPicker position={mapPosition} setPosition={setMapPosition} setCity={setCity} setAddress={setAddress} />
                    </MapContainer>
                </div>
                
                <div className="row mx-0 mb-4 p-3 rounded border bg-light shadow-sm">
                    <div className="col-md-4 mb-2"><label className="form-label fw-bold">Ciudad *</label><input type="text" className="form-control" value={city} onChange={e => setCity(e.target.value)} /></div>
                    <div className="col-md-8 mb-2"><label className="form-label fw-bold">Dirección *</label><input type="text" className="form-control" value={address} onChange={e => setAddress(e.target.value)} /></div>
                </div>

                <h5 className="text-primary border-bottom pb-2 mb-4 mt-5">4. Entradas y Aforo</h5>
                <div className="row mb-4">
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Categoría *</label>
                        <select className={`form-select ${errors.category_id ? 'is-invalid' : ''}`} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                            <option value="">-- Selecciona --</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                        {errors.category_id && <div className="invalid-feedback fw-bold">{errors.category_id[0]}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Aforo Máximo *</label>
                        <input type="number" className={`form-control ${errors.capacity ? 'is-invalid' : ''}`} value={capacity} onChange={e => setCapacity(e.target.value)} />
                        {errors.capacity && <div className="invalid-feedback fw-bold">{errors.capacity[0]}</div>}
                    </div>
                </div>

                <div className="p-3 rounded border mb-5 shadow-sm">
                    <div className="form-check form-switch mb-3">
                        <input className="form-check-input fs-5" type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} id="freeSwitch" />
                        <label className="form-check-label fw-bold text-success fs-5 ms-2" htmlFor="freeSwitch">¡Entrada Gratuita!</label>
                    </div>
                    {!isFree && (
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Precio estimado $</label>
                                <input type="number" className="form-control" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
                            </div>
                            <div className="col-md-8">
                                <label className="form-label fw-bold small">Enlace de compra</label>
                                <input type="url" className="form-control" value={externalLink} onChange={e => setExternalLink(e.target.value)} placeholder="https://..." />
                            </div>
                        </div>
                    )}
                </div>

                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold fs-5 shadow rounded-pill" disabled={loading}>
                    {loading ? 'Publicando...' : '🚀 Publicar Evento'}
                </button>
            </form>
        </div>
      </div>

      {/* MODAL DE ÉXITO MODERNO */}
      {showSuccessModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000 }}>
              <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 shadow-lg rounded-4 bg-body p-4 text-center">
                      <div className="modal-header border-0 justify-content-center pt-2 pb-0">
                          <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                              <span className="fs-1">🎉</span>
                          </div>
                      </div>
                      <div className="modal-body">
                          <h3 className="fw-bold text-body mt-3">¡Evento Publicado!</h3>
                          <p className="text-secondary fs-5">Tu evento ha sido creado correctamente y ya es visible para toda la comunidad de CaraLibre.</p>
                      </div>
                      <div className="modal-footer border-0 justify-content-center pb-3">
                          <button 
                            className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm" 
                            onClick={() => navigate('/dashboard')}
                          >
                            Ir a mi Dashboard
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

export default CreateEvent;