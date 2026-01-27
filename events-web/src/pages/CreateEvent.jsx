import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateEvent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    price: '',
    category_id: 1 // Por defecto categoría 1
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');

    const response = await fetch('http://127.0.0.1:8000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // <--- ¡LA LLAVE MAESTRA!
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      alert('Evento creado correctamente!');
      navigate('/'); // Volver al inicio
    } else {
      alert('Error al crear evento');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ddd' }}>
      <h1>➕ Crear Nuevo Evento</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Título:</label>
          <input 
            type="text" 
            required 
            style={{ width: '100%', padding: '8px' }}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Categoría (ID):</label>
          <input 
            type="number" 
            min="1" max="5" 
            defaultValue="1"
            style={{ width: '100%', padding: '8px' }}
            onChange={e => setFormData({...formData, category_id: e.target.value})}
          />
          <small style={{color: 'gray'}}>Pon un número del 1 al 5</small>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Fecha:</label>
          <input 
            type="datetime-local" 
            required 
            style={{ width: '100%', padding: '8px' }}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Precio:</label>
          <input 
            type="number" 
            required 
            style={{ width: '100%', padding: '8px' }}
            onChange={e => setFormData({...formData, price: e.target.value})}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Descripción:</label>
          <textarea 
            required 
            style={{ width: '100%', height: '100px', padding: '8px' }}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <button type="submit" style={{ background: 'blue', color: 'white', padding: '10px 20px', border: 'none' }}>
          Publicar Evento
        </button>
      </form>
    </div>
  );
}

export default CreateEvent;