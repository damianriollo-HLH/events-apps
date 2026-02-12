import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados para datos
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    price: '',
    category_id: '',
    capacity: ''
  });
  
  // Estados para imagen
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. CARGAR DATOS EXISTENTES
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/events/${id}`)
      .then(res => res.json())
      .then(data => {
        // Rellenamos el formulario con lo que ya existe
        setFormData({
            title: data.title,
            description: data.description,
            date: data.start_at.split('T')[0], // Ajuste formato fecha
            price: data.price,
            category_id: data.category_id,
            capacity: data.capacity
        });
        // Si ya tenía imagen, la mostramos en la preview
        setPreviewUrl(data.image);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("No se pudo cargar el evento");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 2. ENVIAR CAMBIOS (EL TRUCO DEL PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');

    // Usamos FormData
    const data = new FormData();
    // TRUCO DE LARAVEL: Enviamos como POST pero decimos que es PUT
    data.append('_method', 'PUT'); 
    
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('date', formData.date);
    data.append('price', formData.price);
    data.append('category_id', formData.category_id);
    data.append('capacity', formData.capacity);

    if (imageFile) {
        data.append('image', imageFile);
    }

    try {
        // Fíjate: method es POST, pero gracias al _method: PUT de arriba, Laravel lo entiende.
        const response = await fetch(`http://127.0.0.1:8000/api/events/${id}`, {
            method: 'POST', 
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: data
        });

        if (response.ok) {
            alert("Evento actualizado con imagen 📸");
            navigate(`/event/${id}`);
        } else {
            const errData = await response.json();
            setError(errData.message || "Error al actualizar");
        }
    } catch (error) {
        console.error(error);
        setError("Error de conexión");
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow p-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="text-center mb-4">✏️ Editar Evento</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Título</label>
                <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} />
            </div>

            {/* CAMPO DE IMAGEN */}
            <div className="mb-3">
                <label className="form-label">Cambiar Imagen</label>
                <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
                {previewUrl && (
                    <div className="mt-2 text-center">
                        <p className="text-muted small">Imagen actual / Nueva:</p>
                        <img src={previewUrl} alt="Preview" style={{ height: '150px', borderRadius: '8px' }} />
                    </div>
                )}
            </div>

            <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleChange}></textarea>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label>Fecha</label>
                    <input type="date" name="date" className="form-control" value={formData.date} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                    <label>Precio</label>
                    <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} />
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label>Aforo</label>
                    <input type="number" name="capacity" className="form-control" value={formData.capacity} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                    <label>Categoría ID</label>
                    <input type="number" name="category_id" className="form-control" value={formData.category_id} onChange={handleChange} />
                </div>
            </div>

            <button type="submit" className="btn btn-success w-100 mt-3">Guardar Cambios</button>
            <Link to={`/event/${id}`} className="btn btn-link w-100 mt-2">Cancelar</Link>
        </form>
      </div>
    </div>
  );
}

export default EditEvent;