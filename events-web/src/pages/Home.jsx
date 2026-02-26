import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE PAGINACIÓN (¡NUEVO!) ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- ESTADOS DE FILTROS ---
  const [filters, setFilters] = useState({
    search: '', city: '', category: '', date: 'any', sort: 'newest'
  });

  const promoBanners = [
      { id: 1, img: "https://placehold.co/1200x350/1e3c72/ffffff?text=Descubre+los+mejores+eventos", title: "¡Bienvenido a CaraLibre!", subtitle: "Tu nueva plataforma de entretenimiento." },
      { id: 2, img: "https://placehold.co/1200x350/ff4b2b/ffffff?text=Espacio+Patrocinado", title: "Anuncia tu marca aquí", subtitle: "Llega a miles de usuarios diarios." }
  ];

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  // Cargar eventos cuando cambian los filtros O la página actual
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [filters, currentPage]);

  const fetchEvents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.city) params.append('city', filters.city);
    if (filters.category) params.append('category', filters.category);
    if (filters.date !== 'any') params.append('date', filters.date);
    params.append('sort', filters.sort);
    
    // Añadimos la página actual a la petición
    params.append('page', currentPage);

    fetch(`http://127.0.0.1:8000/api/events?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        // Laravel paginate mete los eventos dentro de la propiedad 'data'
        setEvents(data.data);
        setCurrentPage(data.current_page);
        setTotalPages(data.last_page);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Si el usuario filtra algo, le devolvemos a la página 1
  };

  const clearFilters = () => {
    setFilters({ search: '', city: '', category: '', date: 'any', sort: 'newest' });
    setCurrentPage(1);
  };

  const isFiltering = filters.search || filters.city || filters.category || filters.date !== 'any';
  
  // Separar destacados solo si estamos en la página 1
  const featuredEvents = currentPage === 1 ? events.filter(e => e.is_featured) : [];
  const regularEvents = currentPage === 1 ? events.filter(e => !e.is_featured) : events;

  const EventCard = ({ event }) => (
    <div className="col-md-6 col-lg-4" key={event.id}>
        <div className="card h-100 shadow-sm border-0 hover-effect">
            <div className="position-relative">
                <img src={event.image || "https://placehold.co/400x300"} className="card-img-top" alt={event.title} style={{height: '200px', objectFit: 'cover'}} />
                <span className="position-absolute top-0 end-0 bg-white text-dark fw-bold px-2 py-1 m-2 rounded shadow-sm">
                    {parseFloat(event.price) === 0 ? 'GRATIS' : `$${event.price}`}
                </span>
                {event.is_featured && (
                    <span className="position-absolute top-0 start-0 bg-warning text-dark fw-bold px-2 py-1 m-2 rounded shadow-sm" style={{fontSize: '0.8rem'}}>
                        ⭐ Destacado
                    </span>
                )}
            </div>
            <div className="card-body d-flex flex-column">
                <small className="text-info fw-bold mb-1">{event.category?.name || 'General'}</small>
                <h5 className="card-title fw-bold text-truncate" title={event.title}>{event.title}</h5>
                <div className="text-muted small mb-3">
                    <div>📅 {new Date(event.start_at).toLocaleDateString()}</div>
                    <div className="text-truncate">📍 {event.location ? event.location.split(' | ')[0] : 'Online'}</div>
                </div>
                <Link to={`/event/${event.id}`} className="btn btn-outline-primary w-100 mt-auto fw-bold rounded-pill">Ver Detalles</Link>
            </div>
        </div>
    </div>
  );

  return (
    <div>
      {/* BANNER PROMOCIONAL (Solo en la página 1 y si no hay filtros) */}
      {!isFiltering && currentPage === 1 && (
        <div className="container mt-4 mb-4">
            <div id="promoCarousel" className="carousel slide shadow-sm rounded overflow-hidden" data-bs-ride="carousel">
                <div className="carousel-inner">
                    {promoBanners.map((promo, idx) => (
                        <div key={promo.id} className={`carousel-item ${idx === 0 ? 'active' : ''}`}>
                            <img src={promo.img} className="d-block w-100" style={{ height: '300px', objectFit: 'cover' }} alt="Promo" />
                            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded px-4 py-2 mb-4">
                                <h2 className="fw-bold text-white">{promo.title}</h2>
                                <p className="text-light fs-5 m-0">{promo.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#promoCarousel" data-bs-slide="prev"><span className="carousel-control-prev-icon"></span></button>
                <button className="carousel-control-next" type="button" data-bs-target="#promoCarousel" data-bs-slide="next"><span className="carousel-control-next-icon"></span></button>
            </div>
        </div>
      )}

      <div className="container mt-4 mb-5">
        <div className="row">
            {/* SIDEBAR DE FILTROS */}
            <div className="col-md-3 mb-4">
                <div className="card shadow-sm border-0 sticky-top" style={{top: '20px'}}>
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-4">🔍 Buscar Eventos</h5>
                        
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted">PALABRA CLAVE</label>
                            <input type="text" className="form-control form-control-sm" placeholder="Ej: Concierto..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
                        </div>
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted">📍 CIUDAD</label>
                            <input type="text" className="form-control form-control-sm" placeholder="Ej: Madrid..." value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} />
                        </div>
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted">FECHA</label>
                            <div className="form-check"><input className="form-check-input" type="radio" checked={filters.date === 'any'} onChange={() => handleFilterChange('date', 'any')} /><label className="form-check-label">Cualquier fecha</label></div>
                            <div className="form-check"><input className="form-check-input" type="radio" checked={filters.date === 'today'} onChange={() => handleFilterChange('date', 'today')} /><label className="form-check-label">Hoy</label></div>
                            <div className="form-check"><input className="form-check-input" type="radio" checked={filters.date === 'week'} onChange={() => handleFilterChange('date', 'week')} /><label className="form-check-label">Esta semana</label></div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted">CATEGORÍA</label>
                            <select className="form-select form-select-sm" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                                <option value="">Todas las categorías</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted">ORDENAR POR</label>
                            <select className="form-select form-select-sm" value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}>
                                <option value="newest">Más recientes</option>
                                <option value="oldest">Más antiguos</option>
                                <option value="price_asc">Precio: Menor a Mayor</option>
                            </select>
                        </div>
                        <button onClick={clearFilters} className="btn btn-outline-danger btn-sm w-100 fw-bold">🗑 Limpiar Filtros</button>
                    </div>
                </div>
            </div>

            {/* RESULTADOS */}
            <div className="col-md-9">
                {loading ? (
                    <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>
                ) : events.length === 0 ? (
                    <div className="alert alert-light text-center p-5 shadow-sm">
                        <h4>No se encontraron eventos</h4>
                        <button onClick={clearFilters} className="btn btn-primary mt-3">Limpiar búsqueda</button>
                    </div>
                ) : isFiltering ? (
                    <>
                        <h3 className="fw-bold mb-4 text-primary border-bottom pb-2">🔍 Resultados de Búsqueda</h3>
                        <div className="row g-4">{events.map(event => <EventCard key={event.id} event={event} />)}</div>
                    </>
                ) : (
                    <>
                        {featuredEvents.length > 0 && (
                            <div className="mb-5">
                                <h3 className="fw-bold mb-3 border-bottom pb-2">⭐ Eventos Destacados</h3>
                                <div className="row g-4">{featuredEvents.map(event => <EventCard key={event.id} event={event} />)}</div>
                            </div>
                        )}
                        <div>
                            <h3 className="fw-bold mb-3 border-bottom pb-2">🎟️ Próximos Eventos</h3>
                            <div className="row g-4">{regularEvents.map(event => <EventCard key={event.id} event={event} />)}</div>
                        </div>
                    </>
                )}

                {/* ========================================= */}
                {/* CONTROLES DE PAGINACIÓN (NUEVO)           */}
                {/* ========================================= */}
                {totalPages > 1 && (
                    <nav aria-label="Navegación de páginas" className="mt-5 pt-4 border-top">
                        <ul className="pagination justify-content-center pagination-lg">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => { setCurrentPage(currentPage - 1); window.scrollTo(0,0); }}>
                                    &laquo; Anterior
                                </button>
                            </li>
                            <li className="page-item disabled">
                                <span className="page-link bg-light text-dark fw-bold px-4">
                                    Página {currentPage} de {totalPages}
                                </span>
                            </li>
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => { setCurrentPage(currentPage + 1); window.scrollTo(0,0); }}>
                                    Siguiente &raquo;
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}

export default Home;