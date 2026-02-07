import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function MyEvents() {
  // --- 1. ESTADOS (Memoria del componente) ---
  const [events, setEvents] = useState([]); // Aquí guardaremos la lista de eventos
  const [loading, setLoading] = useState(true); // Para mostrar "Cargando..." al principio
  
  // Recuperamos el token y el hook de navegación
  const token = localStorage.getItem('auth_token');
  const navigate = useNavigate();

  // --- 2. EFECTO DE CARGA (Se ejecuta al entrar a la página) ---
  useEffect(() => {
    // PROTECCIÓN: Si no hay token, lo echamos al login
    if (!token) {
        navigate('/login');
        return;
    }

    // PETICIÓN A LA API: Pedimos "mis eventos" al backend
    fetch('http://127.0.0.1:8000/api/my-events', {
        headers: {
            // Es vital enviar el Token para que Laravel sepa quiénes somos
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json()) // Convertimos la respuesta a JSON legible
    .then(data => {
        setEvents(data);   // Guardamos los datos en el estado
        setLoading(false); // Quitamos el cartel de "Cargando"
    })
    .catch(err => {
        console.error("Error cargando mis eventos:", err);
        setLoading(false);
    });
  }, [token, navigate]); // Dependencias: si cambia el token, se vuelve a ejecutar

  // --- 3. RENDERIZADO (Lo que ve el usuario) ---

  // Si está cargando, mostramos un aviso sencillo
  if (loading) return <div className="text-center mt-5">Cargando tus entradas...</div>;

  return (
    <div className="container my-5">
      <h2 className="mb-4">🎟 Mis Entradas</h2>
      
      {/* CONDICIONAL: ¿La lista está vacía? */}
      {events.length === 0 ? (
        // Caso A: No tiene entradas
        <div className="alert alert-info">
            Aún no tienes entradas. <Link to="/">¡Explora eventos aquí!</Link>
        </div>
      ) : (
        // Caso B: Sí tiene entradas -> Las dibujamos
        <div className="row">
            {/* Usamos .map para recorrer el array y crear una tarjeta por evento */}
            {events.map(event => (
                <div key={event.id} className="col-md-4 mb-4">
                    <div className="card h-100 shadow-sm border-primary">
                        <div className="card-body">
                            <h5 className="card-title">{event.title}</h5>
                            <p className="card-text text-muted">
                                📅 {new Date(event.start_at).toLocaleDateString()}
                            </p>
                            
                            {/* Etiqueta visual */}
                            <span className="badge bg-success mb-3">Inscrito ✅</span>
                            
                            <br/>
                            
                            {/* Botón para ir al detalle (y cancelar si quiere) */}
                            <Link to={`/event/${event.id}`} className="btn btn-outline-primary btn-sm mt-2">
                                Ver Detalles / Cancelar
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default MyEvents;