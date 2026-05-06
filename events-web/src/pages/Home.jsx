import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * @component UserWidgets
 */
const UserWidgets = ({ myEnrollments, myCreatedEvents }) => (
  <>
    <div className="bento-card p-3 mb-3 bg-body shadow-sm border border-primary border-opacity-25">
        <h6 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">🎟️ Mis Próximos Eventos</h6>
        {myEnrollments.length > 0 ? (
            <div className="d-flex flex-column gap-2 mb-3">
                {myEnrollments.map(ev => (
                    <Link key={ev.id} to={`/event/${ev.id}`} className="d-flex align-items-center gap-2 text-decoration-none text-body bg-body-tertiary rounded-pill p-1 pe-3 shadow-sm border hover-effect">
                        <img src={ev.image || "https://placehold.co/100"} alt="ev" className="rounded-circle bg-secondary-subtle" style={{width: '32px', height: '32px', objectFit: 'cover'}} />
                        <span className="small fw-semibold text-truncate">{ev.title}</span>
                    </Link>
                ))}
            </div>
        ) : (
            <p className="small mb-3 text-muted">No tienes eventos próximos.</p>
        )}
        <Link to="/dashboard" className="btn btn-sm btn-outline-primary w-100 fw-bold rounded-pill">Ver mi Dashboard</Link>
    </div>

    <div className="bento-card p-3 mb-4 bg-body shadow-sm border border-secondary border-opacity-25">
        <h6 className="fw-bold mb-3 text-body-emphasis d-flex align-items-center gap-2">🛠️ Mis Creaciones</h6>
        {myCreatedEvents.length > 0 ? (
            <div className="d-flex flex-column gap-2 mb-3">
                {myCreatedEvents.map(ev => (
                    <Link key={ev.id} to={`/event/${ev.id}`} className="d-flex align-items-center gap-2 text-decoration-none text-body bg-body-tertiary rounded-pill p-1 pe-3 shadow-sm border hover-effect">
                        <img src={ev.image || "https://placehold.co/100"} alt="ev" className="rounded-circle bg-secondary-subtle" style={{width: '32px', height: '32px', objectFit: 'cover'}} />
                        <span className="small fw-semibold text-truncate">{ev.title}</span>
                    </Link>
                ))}
            </div>
        ) : (
            <p className="small mb-3 text-muted">Anímate a organizar algo.</p>
        )}
        <Link to="/create-event" className="btn btn-sm btn-outline-secondary w-100 fw-bold rounded-pill">+ Crear Evento</Link>
    </div>
  </>
);

/**
 * @component SearchFilters
 */
const SearchFilters = ({ filters, categories, handleFilterChange, clearFilters }) => (
  <>
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
            <button key={d} onClick={() => handleFilterChange('date', d)} className={`btn btn-sm text-start ${filters.date === d ? 'btn-primary' : 'btn-outline-secondary border-0'}`}>
              {d === 'any' ? '📅 Todas' : d === 'today' ? '🕒 Hoy' : '🗓️ Esta semana'}
            </button>
          ))}
        </div>
    </div>
    <button onClick={clearFilters} className="btn btn-link text-danger text-decoration-none w-100 small fw-bold mt-2">🗑 Limpiar Filtros</button>
  </>
);

/**
 * @component EventCard
 * @description Diseño final: Las imágenes comparten una altura fija exacta (240px)
 * para garantizar la simetría. El espacio sobrante se asigna al texto (flex-grow-1).
 */
const EventCard = ({ event, size = "small" }) => {
    const isLarge = size === "large";
    
    return (
        <div className={isLarge ? "col-lg-8 col-md-12" : "col-lg-4 col-md-6"}>
            <Link to={`/event/${event.id}`} className="text-decoration-none text-body d-block h-100">
                <div className="bento-card h-100 hover-effect border-0 shadow-sm bg-body d-flex flex-column">
                    
                    {/* SOLUCIÓN: Altura fija e idéntica (240px) para ambas imágenes. 
                        Esto crea la línea de corte perfecta que pides. */}
                    <div className="position-relative overflow-hidden w-100" style={{ height: '240px' }}>
                        <img src={event.image || "https://placehold.co/800x400"} 
                             className="w-100 h-100" 
                             alt={event.title} 
                             style={{ objectFit: 'cover' }} />
                        
                        <div className="position-absolute top-0 end-0 m-3">
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

                    {/* SOLUCIÓN: Agregamos flex-grow-1 a este contenedor.
                        Al empujar hacia abajo, asegura que ambas tarjetas terminen a la misma altura,
                        absorbiendo cualquier diferencia de texto como espacio en blanco inferior. */}
                    <div className="p-3 p-md-4 pb-3 flex-grow-1">
                        <small className="text-primary fw-bold text-uppercase mb-2 d-block" style={{letterSpacing: '1px'}}>
                            {event.category?.name || 'General'}
                        </small>
                        <h4 className={`fw-bold mb-3 ${isLarge ? "display-6" : "fs-5 fs-md-4"}`}>{event.title}</h4>
                        <div className="text-muted small">
                            <div className="mb-1">📅 {new Date(event.start_at).toLocaleDateString()}</div>
                            <div className="text-truncate">📍 {event.location ? event.location.split(' | ')[0] : 'Online'}</div>
                        </div>
                    </div>

                </div>
            </Link>
        </div>
    );
};

/**
 * Componente Home
 */
function Home() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: '', city: '', category: '', date: 'any', sort: 'newest'
  });

  const [myEnrollments, setMyEnrollments] = useState([]);
  const [myCreatedEvents, setMyCreatedEvents] = useState([]);
  const token = localStorage.getItem('auth_token');

  const promoBanners = [
    { id: 1, img: "/img/bannerCL.png", alt: "Bienvenido a CaraLibre" },
    { id: 2, img: "/img/bannerTW.png", alt: "Nueva temporada Teatro Wagner" }
  ];

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));

    if (token) {
        const headers = { 'Authorization': `Bearer ${token}` };
        Promise.all([
            fetch('http://127.0.0.1:8000/api/my-enrollments', { headers }).then(res => res.ok ? res.json() : []),
            fetch('http://127.0.0.1:8000/api/my-events', { headers }).then(res => res.ok ? res.json() : [])
        ])
        .then(([enrollments, created]) => {
            setMyEnrollments(enrollments.slice(0, 3));
            setMyCreatedEvents(created.slice(0, 3));
        })
        .catch(err => console.error("Error cargando widgets de usuario:", err));
    }
  }, [token]);

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

  const selectedCategoryObj = filters.category 
      ? categories.find(c => c.id.toString() === filters.category) 
      : null;

  const isFiltering = filters.search || filters.city || filters.category || filters.date !== 'any';

  return (
    <div className="pb-5">
      {/* 1. HERO BANNER */}
      {!isFiltering && currentPage === 1 && (
        <div className="container mt-2 mb-4">
            <div id="promoCarousel" className="carousel slide bento-card shadow-lg border-0 overflow-hidden" data-bs-ride="carousel">
                <div className="carousel-inner">
                    {promoBanners.map((promo, idx) => (
                        <div key={promo.id} className={`carousel-item ${idx === 0 ? 'active' : ''}`}>
                            <img src={promo.img} className="d-block w-100" style={{ height: '350px', objectFit: 'cover' }} alt={promo.alt} />
                        </div>
                    ))}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#promoCarousel" data-bs-slide="prev"><span className="carousel-control-prev-icon"></span></button>
                <button className="carousel-control-next" type="button" data-bs-target="#promoCarousel" data-bs-slide="next"><span className="carousel-control-next-icon"></span></button>
            </div>
        </div>
      )}

      {/* 2. BOTÓN DE BÚSQUEDA MÓVIL */}
      <div className="container d-lg-none mb-4">
        <button className="btn btn-primary w-100 fw-bold rounded-pill shadow-sm py-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasMobileMenu">
            🔍 Buscar
        </button>
      </div>

      <div className="container">
        <div className="row g-4">
            {/* 3. SIDEBAR IZQUIERDO */}
            <div className="col-lg-3 d-none d-lg-block">
                <div className="sticky-top" style={{top: '20px'}}>
                    {token && <UserWidgets myEnrollments={myEnrollments} myCreatedEvents={myCreatedEvents} />}
                    <div className="bento-card p-4 bg-body-tertiary shadow-sm">
                        <SearchFilters filters={filters} categories={categories} handleFilterChange={handleFilterChange} clearFilters={clearFilters} />
                    </div>
                </div>
            </div>

            {/* 4. GRID DE EVENTOS */}
            <div className="col-lg-9">
                {isFiltering && (
                    <div className="bento-card mb-4 text-white p-4 p-md-5 position-relative overflow-hidden shadow-sm" style={{ background: selectedCategoryObj ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' : 'linear-gradient(135deg, #434343 0%, #000000 100%)', borderRadius: '16px', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div className="position-absolute top-0 end-0 opacity-25" style={{ fontSize: '8rem', transform: 'translate(10%, -20%)', userSelect: 'none'}}>
                            {selectedCategoryObj ? '🎭' : '🔍'}
                        </div>
                        <div className="position-relative z-1">
                            <h2 className="fw-bold mb-2 display-6 text-white">{selectedCategoryObj ? selectedCategoryObj.name : 'Resultados de Búsqueda'}</h2>
                            <p className="fs-5 mb-0 text-white-75" style={{ maxWidth: '80%' }}>
                                {selectedCategoryObj?.description || 'Mostrando los eventos que coinciden con tus criterios.'}
                            </p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : events.length === 0 ? (
                    <div className="bento-card p-5 text-center bg-body-tertiary">
                        <h4 className="text-muted">No encontramos eventos</h4>
                        <button onClick={clearFilters} className="btn btn-primary mt-3 rounded-pill">Ver todos los eventos</button>
                    </div>
                ) : (
                    <div className="row g-3 g-md-4">
                        {events.map((event) => <EventCard key={event.id} event={event} size={event.is_featured && !isFiltering && currentPage === 1 ? "large" : "small"} />)}
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

      {/* 5. OFFCANVAS (MENÚ MÓVIL) */}
      <div className="offcanvas offcanvas-start rounded-end-4" tabIndex="-1" id="offcanvasMobileMenu" aria-labelledby="offcanvasMobileMenuLabel">
        <div className="offcanvas-header border-bottom bg-body-tertiary">
          <h5 className="offcanvas-title fw-bold" id="offcanvasMobileMenuLabel">🔍 Buscar Eventos</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <div className="bento-card p-4 bg-body-tertiary shadow-sm">
            <SearchFilters filters={filters} categories={categories} handleFilterChange={handleFilterChange} clearFilters={clearFilters} />
          </div>
          <button className="btn btn-primary w-100 rounded-pill mt-4 py-2 shadow-sm" data-bs-dismiss="offcanvas">Aplicar Filtros</button>
        </div>
      </div>
    </div>
  );
}

export default Home;