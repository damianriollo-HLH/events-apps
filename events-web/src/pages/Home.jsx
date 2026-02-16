import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS DE FILTROS ---
  const [filters, setFilters] = useState({
    search: '',
    category: null,
    date: 'any',      // any, today, tomorrow, week
    sort: 'newest'    // newest, price_asc, price_desc
  });

  // Función maestra de carga
  const fetchEvents = () => {
    setLoading(true);
    
    // Convertimos el objeto filters en parámetros de URL
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.date !== 'any') params.append('date', filters.date);
    params.append('sort', filters.sort);

    fetch(`http://127.0.0.1:8000/api/events?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  };

  // Cargar categorías al inicio
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data));
  }, []);

  // Recargar eventos cada vez que cambie un filtro
  useEffect(() => {
    fetchEvents();
  }, [filters]); // <--- El truco: Si 'filters' cambia, se ejecuta esto.

  // Helper para actualizar filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Separar destacado (solo si no estamos filtrando mucho)
  const showFeatured = !filters.search && !filters.category && filters.date === 'any';
  const featuredEvent = (showFeatured && events.length > 0) ? events[0] : null;
  const displayEvents = featuredEvent ? events.slice(1) : events;

  return (
    <div className="container-fluid p-0">
      
      {/* 1. HERO SECTION (Igual que antes) */}
      {featuredEvent && (
        <div 
            className="position-relative text-white mb-5 shadow"
            style={{
                backgroundImage: `url(${featuredEvent.image || 'https://placehold.co/1200x600'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '400px',
                display: 'flex',
                alignItems: 'flex-end'
            }}
        >
            <div className="w-100 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                <div className="container">
                    <span className="badge bg-warning text-dark mb-2">🔥 Destacado</span>
                    <h1 className="fw-bold">{featuredEvent.title}</h1>
                    <Link to={`/event/${featuredEvent.id}`} className="btn btn-light mt-2">Ver Evento</Link>
                </div>
            </div>
        </div>
      )}

      <div className="container my-5">
        <div className="row">
            
            {/* ========================================= */}
            {/* 2. SIDEBAR (MENÚ LATERAL DE FILTROS)      */}
            {/* ========================================= */}
            <div className="col-md-3 mb-4">
                <div className="card border-0 shadow-sm p-3 sticky-top" style={{top: '20px', zIndex: 1}}>
                    <h5 className="fw-bold mb-3">🔍 Filtrar Eventos</h5>
                    
                    {/* A. BUSCADOR TEXTO */}
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted">PALABRA CLAVE</label>
                        <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            placeholder="Concierto, Madrid..." 
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* B. FECHA */}
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted">FECHA</label>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="date" 
                                checked={filters.date === 'any'} onChange={() => handleFilterChange('date', 'any')} />
                            <label className="form-check-label">Cualquier fecha</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="date" 
                                checked={filters.date === 'today'} onChange={() => handleFilterChange('date', 'today')} />
                            <label className="form-check-label">Hoy</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="date" 
                                checked={filters.date === 'tomorrow'} onChange={() => handleFilterChange('date', 'tomorrow')} />
                            <label className="form-check-label">Mañana</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="date" 
                                checked={filters.date === 'week'} onChange={() => handleFilterChange('date', 'week')} />
                            <label className="form-check-label">Esta semana</label>
                        </div>
                    </div>

                    {/* C. CATEGORÍAS */}
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted">CATEGORÍA</label>
                        <select 
                            className="form-select form-select-sm" 
                            value={filters.category || ''}
                            onChange={(e) => handleFilterChange('category', e.target.value || null)}
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* D. ORDENAR POR */}
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">ORDENAR POR</label>
                        <select 
                            className="form-select form-select-sm" 
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                        >
                            <option value="newest">Más recientes</option>
                            <option value="oldest">Más antiguos</option>
                            <option value="price_asc">Precio: Bajo a Alto</option>
                            <option value="price_desc">Precio: Alto a Bajo</option>
                        </select>
                    </div>

                    {/* E. LIMPIAR */}
                    <button 
                        className="btn btn-outline-danger btn-sm w-100 mt-2"
                        onClick={() => setFilters({search: '', category: null, date: 'any', sort: 'newest'})}
                    >
                        🗑 Limpiar Filtros
                    </button>
                </div>
            </div>

            {/* ========================================= */}
            {/* 3. GALERÍA DE RESULTADOS (DERECHA)        */}
            {/* ========================================= */}
            <div className="col-md-9">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold">Resultados ({displayEvents.length})</h4>
                </div>

                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : (
                    <div className="row g-3">
                        {displayEvents.length > 0 ? (
                            displayEvents.map(event => (
                                <div key={event.id} className="col-md-4 col-lg-4">
                                    <div className="card h-100 border-0 shadow-sm hover-effect">
                                        <div className="position-relative">
                                            <img 
                                                src={event.image || "https://placehold.co/400x300"} 
                                                className="card-img-top" 
                                                alt={event.title}
                                                style={{ height: '160px', objectFit: 'cover' }}
                                            />
                                            <span className="position-absolute top-0 end-0 m-2 badge bg-white text-dark shadow-sm">
                                                ${event.price}
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            <small className="text-info fw-bold">{event.category?.name}</small>
                                            <h6 className="fw-bold mt-1 text-truncate">{event.title}</h6>
                                            <p className="text-muted small mb-0">
                                                📅 {new Date(event.start_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-muted small">
                                                📍 {event.location || 'Online'}
                                            </p>
                                            <Link to={`/event/${event.id}`} className="btn btn-outline-primary btn-sm w-100 mt-2 rounded-pill">
                                                Ver Detalles
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5 bg-light rounded">
                                <h3>🧐 No encontramos nada</h3>
                                <p>Intenta cambiar los filtros del menú lateral.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}

export default Home;