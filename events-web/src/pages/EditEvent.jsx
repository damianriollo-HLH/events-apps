import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- ESTADOS DEL FORMULARIO ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState(''); 
  const [endTime, setEndTime] = useState(''); 

  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('');
  
  const [capacity, setCapacity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null); // Para mostrar la foto actual

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true); // Para esperar a que carguen los datos
  const [error, setError] = useState(null);

  const token = localStorage.getItem('auth_token');

  // --- 1. CARGAR DATOS DEL EVENTO Y CATEGORÍAS ---
  useEffect(() => {
    // A. Cargar Categorías
    fetch('http://127.0.0.1:8000/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error(err));

    // B. Cargar datos del Evento para rellenar el formulario
    fetch(`http://127.0.0.1:8000/api/events/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
          setTitle(data.title);
          setDescription(data.description);
          setCapacity(data.capacity);
          setCategoryId(data.category_id);
          setCurrentImage(data.image);

          // Rellenar Precio
          if (parseFloat(data.price) === 0) {
              setIsFree(true);
              setPrice('');
          } else {
              setIsFree(false);
              setPrice(data.price);
          }

          // Rellenar Fechas (Separando YYYY-MM-DD de HH:MM)
          if (data.start_at) {
              setStartDate(data.start_at.substring(0, 10));
              setStartTime(data.start_at.substring(11, 16));
          }
          if (data.end_at) {
              setEndDate(data.end_at.substring(0, 10));
              setEndTime(data.end_at.substring(11, 16));
          }

          // Rellenar Ubicación (Separando "Ciudad | Dirección")
          if (data.location && data.location !== 'Online') {
              const parts = data.location.split(' | ');
              setCity(parts[0] || '');
              setAddress(parts[1] || '');
          }

          setLoadingData(false);
      })
      .catch(err => {
          console.error(err);
          setError("Error cargando el evento.");
          setLoadingData(false);
      });
  }, [id, token]);


  const handleImageChange = (e) => setImage(e.target.files[0]);

  // --- 2. ENVIAR FORMULARIO (GUARDAR CAMBIOS) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Unimos Fechas y Horas
    const finalStartAt = `${startDate} ${startTime}:00`;
    let finalEndAt = null;
    if (endDate && endTime) finalEndAt = `${endDate} ${endTime}:00`;

    // Unimos Ubicación
    const finalLocation = city && address ? `${city} | ${address}` : (city || address || 'Online');

    const formData = new FormData();
    // TRUCO LARAVEL: Para enviar archivos al editar, usamos POST y le decimos que es PUT
    formData.append('_method', 'PUT'); 
    
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
        const response = await fetch(`http://127.0.0.1:8000/api/events/${id}`, {
            method: 'POST', // Usamos POST por el truco del archivo
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert('¡Evento actualizado con éxito! ✏️');
            navigate(`/event/${id}`); // Volvemos a ver el evento
        } else {
            setError(data.message || 'Error al actualizar el evento.');
            setLoading(false);
        }
    } catch (err) {
        setError('Error de conexión.');
        setLoading(false);
    }
  };

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
                
                <div className="mb-4 bg-light p-3 rounded">
                    <label className="form-label fw-bold">Cambiar Imagen de portada</label>
                    {currentImage && (
                        <div className="mb-2">
                            <img src={currentImage} alt="Actual" style={{ height: '80px', borderRadius: '5px', objectFit: 'cover' }} />
                            <small className="text-muted ms-2">Imagen actual</small>
                        </div>
                    )}
                    <input type="file" className="form-control" onChange={handleImageChange} accept="image/*" />
                    <small className="text-muted">Déjalo en blanco si no quieres cambiar la foto actual.</small>
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

                {/* 3. DÓNDE (UBICACIÓN ESTRUCTURADA) */}
                <h5 className="text-primary border-bottom pb-2 mb-4 mt-4">3. ¿Dónde será?</h5>
                <div className="row mb-4 bg-light p-3 rounded border">
                    <div className="col-md-4 mb-3 mb-md-0">
                        <label className="form-label fw-bold">Ciudad *</label>
                        <input type="text" className="form-control" placeholder="Ej: Madrid" value={city} onChange={e => setCity(e.target.value)} required />
                    </div>
                    <div className="col-md-8">
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
                    {loading ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}

export default EditEvent;