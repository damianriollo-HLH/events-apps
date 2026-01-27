import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        price: '',
        category_id: ''
    });

    const token = localStorage.getItem('auth_token');

    // 1. Cargar los datos actuales del evento
    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/events/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("No se pudo cargar el evento");
                return res.json();
            })
            .then(data => {
                // Formateamos la fecha para que encaje en el input type="date"
                // data.start_at viene como "2023-10-10 00:00:00", cortamos para quedarnos con "2023-10-10"
                const dateFormatted = data.start_at ? data.start_at.split('T')[0].split(' ')[0] : '';
                
                setFormData({
                    title: data.title,
                    description: data.description,
                    date: dateFormatted, 
                    price: data.price,
                    category_id: data.category_id
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                alert("Error al cargar datos");
                navigate('/');
            });
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 2. Enviar los cambios (PUT)
const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("1. Botón pulsado. Enviando datos...", formData); // Para depurar

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/events/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json', // <--- IMPORTANTE: Pide JSON siempre
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            console.log("2. Respuesta recibida:", response.status);

            const data = await response.json(); // Intentamos leer la respuesta

            if (response.ok) {
                alert("✅ Evento actualizado correctamente");
                navigate(`/event/${id}`);
            } else {
                // Si falla, mostramos el mensaje del servidor o el genérico
                console.error("Error backend:", data);
                alert("❌ Error: " + (data.message || "Algo salió mal"));
            }

        } catch (error) {
            console.error("Error de red o JS:", error);
            alert("❌ Error grave: Mira la consola (F12) para más detalles.");
        }
    };

    if (loading) return <div className="p-4">Cargando datos...</div>;

    return (
        <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ddd' }}>
            <h2>Editar Evento</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Título:</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '8px' }}
                        required 
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Descripción:</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Fecha:</label>
                    <input 
                        type="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Precio:</label>
                    <input 
                        type="number" 
                        name="price" 
                        value={formData.price} 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>

                {/* Nota: Asumimos que la categoría se mantiene o se selecciona por ID. 
                    Para simplificar, dejaremos un input numérico o fijo por ahora. 
                    Lo ideal sería un <select> cargando categorías, pero vamos paso a paso. */}
                <div style={{ marginBottom: '10px' }}>
                    <label>ID Categoría:</label>
                    <input 
                        type="number" 
                        name="category_id" 
                        value={formData.category_id} 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none' }}
                >
                    Guardar Cambios
                </button>
            </form>
        </div>
    );
}

export default EditEvent;