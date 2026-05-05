import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente Home: Vista principal de CaraLibre.
 * Implementa un diseño Bento Grid para destacar eventos especiales.
 */
function Home() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- ESTADOS DE FILTROS ---
  const [filters, setFilters] = useState({
    search: '', city: '', category: '', date: 'any', sort: 'newest'
  });

  const promoBanners = [
    { id: 1, img: "/img/bannerCL.png", alt: "Bienvenido a CaraLibre" },
    { id: 2, img: "/img/bannerTW.png", alt: "Nueva temporada Teatro Wagner" }
  ];

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error categorías:", err));
  }, []);

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
    params.append('page', currentPage);

    fetch(`http://127.0.0.1:8000/api/events?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setEvents(data.data);
        setCurrentPage(data.current_page);
        setTotalPages(data.last_page);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); 
  };

  const clearFilters = () => {
    setFilters({ search: '', city: '', category: '', date: 'any', sort: 'newest' });
    setCurrentPage(1);
  };

  const isFiltering = filters.search || filters.city || filters.category || filters.date !== 'any';
  
  // Separación de lógica para el Bento Grid
  const featuredEvents = events.filter(e => e.is_featured);
  const regularEvents = events.filter(e => !e.is_featured);

  /**
   * Sub-componente Tarjeta de Evento (Estilo Bento)
   */
  const EventCard = ({ event, size = "small" }) => (
    <div className={size === "large" ? "col-lg-8 col-md-12" : "col-lg-4 col-md-6"}>
        <div className="bento-card h-100 hover-effect border-0 shadow-sm bg-body">
            <div className="position-relative overflow-hidden" style={{ height: size === "large" ? '300px' : '200px' }}>
                <img 
                  src={event.image || "https://placehold.co/800x400"} 
                  className="w-100 h-100" 
                  alt={event.title} 
                  style={{ objectFit: 'cover' }} 
                />
                <div className="position-absolute top-0 end-0 m-3 d-flex flex-column gap-2">
                    <span className="badge bg-white text-dark shadow-sm px-3 py-2 rounded-pill fw-bold">
                        {parseFloat(event.price) === 0 ? 'GRATIS' : `$${event.price}`}
                    </span>
                </div>
                {event.is_featured && (
                    <span className="position-absolute top-0 start-0 bg-warning text-dark fw-bold px-3 py-2 m-3 rounded-pill shadow-sm" style={{fontSize: '0.8rem'}}>
                        ⭐ Destacado
                    </span>
                )}
            </div>
            <div className="p-4 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <small className="text-primary fw-bold text-uppercase" style={{letterSpacing: '1px'}}>
                    {event.category?.name || 'General'}
                  </small>
                </div>
                <h4 className={`fw-bold mb-3 ${size === "large" ? "display-6" : ""}`}>{event.title}</h4>
                <div className="text-muted small mb-4">
                    <div className="mb-1">📅 {new Date(event.start_at).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div className="text-truncate">📍 {event.location ? event.location.split(' | ')[0] : 'Online'}</div>
                </div>
                <Link to={`/event/${event.id}`} className="btn btn-primary w-100 mt-auto rounded-pill py-2">Ver Detalles</Link>
            </div>
        </div>
    </div>
  );

  return (
    <div className="pb-5">
      {/* 1. HERO BANNER (Carousel) */}
      {!isFiltering && currentPage === 1 && (
        <div className="container mt-2 mb-5">
            <div id="promoCarousel" className="carousel slide bento-card shadow-lg border-0 overflow-hidden" data-bs-ride="carousel">
                <div className="carousel-inner">
                    {promoBanners.map((promo, idx) => (
                        <div key={promo.id} className={`carousel-item ${idx === 0 ? 'active' : ''}`}>
                            <img 
                            src={promo.img} 
                            className="d-block w-100" 
                            style={{ height: '350px', objectFit: 'cover' }} alt={promo.alt} />
                        </div>
                    ))}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#promoCarousel" data-bs-slide="prev"><span className="carousel-control-prev-icon"></span></button>
                <button className="carousel-control-next" type="button" data-bs-target="#promoCarousel" data-bs-slide="next"><span className="carousel-control-next-icon"></span></button>
            </div>
        </div>
      )}

      <div className="container">
        <div className="row g-4">
            {/* 2. SIDEBAR DE FILTROS (Bento Estilo) */}
            <div className="col-lg-3">
                <div className="bento-card p-4 sticky-top bg-body-tertiary" style={{top: '20px'}}>
                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                        <span>🔍</span> Filtros
                    </h5>
                    
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted text-uppercase">Búsqueda</label>
                        <input type="text" className="form-control rounded-3 border-light-subtle" placeholder="¿Qué buscas?" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
                    </div>
                    
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted text-uppercase">Ciudad</label>
                        <input type="text" className="form-control rounded-3 border-light-subtle" placeholder="Ej: Aspe" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} />
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted text-uppercase">Categoría</label>
                        <select className="form-select rounded-3 border-light-subtle" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                            <option value="">Todas</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted text-uppercase">Fecha</label>
                        <div className="d-flex flex-column gap-2">
                          {['any', 'today', 'week'].map(d => (
                            <button 
                              key={d}
                              onClick={() => handleFilterChange('date', d)}
                              className={`btn btn-sm text-start ${filters.date === d ? 'btn-primary' : 'btn-outline-secondary border-0'}`}
                            >
                              {d === 'any' ? '📅 Todas' : d === 'today' ? '🕒 Hoy' : '🗓️ Esta semana'}
                            </button>
                          ))}
                        </div>
                    </div>

                    <button onClick={clearFilters} className="btn btn-link text-danger text-decoration-none w-100 small fw-bold mt-2">🗑 Limpiar Filtros</button>
                </div>
            </div>

            {/* 3. GRID DE EVENTOS */}
            <div className="col-lg-9">
                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : events.length === 0 ? (
                    <div className="bento-card p-5 text-center bg-body-tertiary">
                        <h4 className="text-muted">No encontramos eventos</h4>
                        <button onClick={clearFilters} className="btn btn-primary mt-3 rounded-pill">Ver todos los eventos</button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {/* Renderizamos destacados como 'large' y el resto 'small' */}
                        {events.map((event, index) => (
                          <EventCard 
                            key={event.id} 
                            event={event} 
                            size={event.is_featured ? "large" : "small"} 
                          />
                        ))}
                    </div>
                )}

                {/* PAGINACIÓN */}
                {totalPages > 1 && (
                    <nav className="mt-5">
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link rounded-start-pill px-4" onClick={() => { setCurrentPage(currentPage - 1); window.scrollTo(0,0); }}>Anterior</button>
                            </li>
                            <li className="page-item disabled">
                                <span className="page-link bg-light text-dark fw-bold px-4">Página {currentPage} de {totalPages}</span>
                            </li>
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link rounded-end-pill px-4" onClick={() => { setCurrentPage(currentPage + 1); window.scrollTo(0,0); }}>Siguiente</button>
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