import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para lo que escribimos en el buscador
  const [searchTerm, setSearchTerm] = useState('');

  // Función para cargar eventos (acepta un término de búsqueda opcional)
  const fetchEvents = (search = '') => {
    setLoading(true);
    // Si hay búsqueda, añadimos ?search=texto al final de la URL
    const url = search 
        ? `http://127.0.0.1:8000/api/events?search=${search}` 
        : 'http://127.0.0.1:8000/api/events';

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  // Cargar eventos al iniciar la página (sin filtros)
  useEffect(() => {
    fetchEvents();
  }, []);

  // Manejar el envío del formulario de búsqueda
  const handleSearch = (e) => {
    e.preventDefault(); // Que no recargue la página
    fetchEvents(searchTerm);
  };

  return (
    <div className="container my-5">
      
      {/* --- SECCIÓN DE BIENVENIDA Y BUSCADOR --- */}
      <div className="text-center mb-5">
        <h1 className="fw-bold display-4">🎉 Próximos Eventos</h1>
        <p className="lead text-muted">Descubre, participa y disfruta.</p>
        
        {/* BARRA DE BÚSQUEDA */}
        <form onSubmit={handleSearch} className="d-flex justify-content-center mt-4">
            <div className="input-group" style={{ maxWidth: '500px' }}>
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="¿Qué buscas? (ej: Concierto, Yoga...)" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-primary" type="submit">
                    🔍 Buscar
                </button>
            </div>
        </form>
        {/* Botón para limpiar si hay búsqueda */}
        {searchTerm && (
            <button 
                className="btn btn-link btn-sm mt-2" 
                onClick={() => { setSearchTerm(''); fetchEvents(''); }}
            >
                Limpiar filtros
            </button>
        )}
      </div>

      {/* --- LISTA DE EVENTOS --- */}
      {loading ? (
        <div className="text-center"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="row">
            {events.length > 0 ? (
                events.map(event => (
                    <div key={event.id} className="col-md-4 mb-4">
                    <div className="card h-100 shadow-sm hover-effect">
                        {/* IMAGEN: Si tiene imagen real la usa, si no, usa el placeholder */}
                        <img 
                            src={event.image || "https://placehold.co/800x400?text=Evento"} 
                            className="card-img-top" 
                            alt={event.title} 
                            style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <div className="card-body d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <span className="badge bg-info text-dark">{event.category ? event.category.name : 'General'}</span>
                                <span className="badge bg-success">${event.price}</span>
                            </div>
                            <h5 className="card-title fw-bold">{event.title}</h5>
                            <p className="card-text text-muted small">
                                📅 {new Date(event.start_at).toLocaleDateString()}
                            </p>
                            <p className="card-text flex-grow-1">
                                {event.description.substring(0, 100)}...
                            </p>
                            <Link to={`/event/${event.id}`} className="btn btn-outline-primary mt-auto w-100">
                                Ver Detalles
                            </Link>
                        </div>
                    </div>
                    </div>
                ))
            ) : (
                <div className="col-12 text-center py-5">
                    <h3>😕 No encontramos eventos con "{searchTerm}"</h3>
                    <p>Intenta con otra palabra.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
}

export default Home;