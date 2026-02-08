import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateEvent() {
  const navigate = useNavigate();
  
  // 1. Estados para los datos de texto
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    price: '',
    category_id: '',
    capacity: '' 
  });

  // 2. Estados para la IMAGEN
  const [imageFile, setImageFile] = useState(null); // El archivo en sí
  const [previewUrl, setPreviewUrl] = useState(null); // La URL para mostrarla en pantalla
  
  const [error, setError] = useState(null);

  // Manejar cambios en textos
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Manejar cambio de IMAGEN (¡Nuevo!)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Creamos una URL temporal para ver la foto antes de subirla
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 4. PREPARAR EL PAQUETE (FormData)
    // Ya no usamos JSON, usamos FormData para poder meter archivos
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('date', formData.date); // Asegúrate que el backend espera 'date' o 'start_at'
    data.append('price', formData.price);
    data.append('category_id', formData.category_id);
    data.append('capacity', formData.capacity || 50); // Valor por defecto si está vacío

    // Si hay imagen, la metemos en la caja
    if (imageFile) {
        data.append('image', imageFile);
    }

    const token = localStorage.getItem('auth_token');

    try {
        const response = await fetch('http://127.0.0.1:8000/api/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // ¡OJO! NO ponemos 'Content-Type': 'application/json'
                // El navegador pondrá automáticamente el tipo correcto para archivos
                'Accept': 'application/json'
            },
            body: data // Enviamos la caja 'FormData'
        });

        if (response.ok) {
            alert("¡Evento creado con imagen! 📸");
            navigate('/dashboard'); // Volvemos al panel
        } else {
            const errorData = await response.json();
            setError(errorData.message || "Error al crear evento");
            console.error("Errores de validación:", errorData.errors);
        }
    } catch (err) {
        console.error(err);
        setError("Error de conexión");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="text-center mb-4">✨ Crear Nuevo Evento</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
            {/* Título */}
            <div className="mb-3">
                <label className="form-label">Título del Evento</label>
                <input type="text" name="title" className="form-control" onChange={handleChange} required />
            </div>

            {/* Imagen (¡NUEVO!) */}
            <div className="mb-3">
                <label className="form-label">Imagen del Evento (Opcional)</label>
                <input 
                    type="file" 
                    accept="image/*" 
                    className="form-control" 
                    onChange={handleImageChange} 
                />
                {/* Previsualización */}
                {previewUrl && (
                    <div className="mt-3 text-center">
                        <p className="text-muted small">Vista previa:</p>
                        <img src={previewUrl} alt="Vista previa" style={{ maxHeight: '200px', borderRadius: '8px' }} />
                    </div>
                )}
            </div>

            {/* Descripción */}
            <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea name="description" className="form-control" rows="3" onChange={handleChange} required></textarea>
            </div>

            {/* Fecha y Precio */}
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha</label>
                    <input type="date" name="date" className="form-control" onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Precio ($)</label>
                    <input type="number" name="price" className="form-control" step="0.01" onChange={handleChange} required />
                </div>
            </div>

            {/* Aforo y Categoría */}
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Aforo Máximo</label>
                    <input type="number" name="capacity" className="form-control" placeholder="Ej: 50" onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Categoría ID</label>
                    <input type="number" name="category_id" className="form-control" placeholder="1, 2, 3..." onChange={handleChange} required />
                </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-3">Publicar Evento</button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;