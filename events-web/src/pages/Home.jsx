import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * @component UserWidgets
 * @description Panel lateral de acceso rápido para usuarios autenticados.
 * Aplica el principio de "Divulgación Progresiva" mostrando solo un resumen (top 3)
 * de los próximos eventos y los favoritos, redirigiendo al Dashboard para la gestión completa.
 * * @param {Object} props
 * @param {Array} props.myEnrollments - Lista de próximos eventos a los que asiste el usuario.
 * @param {Array} props.favorites - Lista de eventos marcados como favoritos por el usuario.
 */
const UserWidgets = ({ myEnrollments, favorites }) => (
  <>
    {/* WIDGET 1: PRÓXIMOS EVENTOS */}
    <div className="bento-card p-3 mb-3 bg-body shadow-sm border border-primary border-opacity-25 rounded-4">
        <h6 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">🎟️ Mis Próximos Eventos</h6>
        {myEnrollments.length > 0 ? (
            <div className="d-flex flex-column gap-2 mb-3">
                {myEnrollments.map(ev => (
                    <Link key={ev.id} to={`/event/${ev.id}`} className="d-flex align-items-center gap-2 text-decoration-none text-body bg-body-tertiary rounded-pill p-1 pe-3 shadow-sm border border-secondary-subtle hover-effect">
                        <img src={ev.image || "https://placehold.co/100"} alt="ev" className="rounded-circle bg-secondary-subtle object-fit-cover" style={{width: '32px', height: '32px'}} />
                        <span className="small fw-semibold text-truncate">{ev.title}</span>
                    </Link>
                ))}
            </div>
        ) : (
            <p className="small mb-3 text-muted text-center">No tienes eventos próximos.</p>
        )}
        <Link to="/dashboard" className="btn btn-sm btn-outline-primary w-100 fw-bold rounded-pill">Ver mi Dashboard</Link>
    </div>

    {/* WIDGET 2: MIS FAVORITOS (NUEVO) */}
    <div className="bento-card p-3 mb-4 bg-body shadow-sm border border-danger border-opacity-25 rounded-4">
        <h6 className="fw-bold mb-3 text-danger d-flex align-items-center gap-2">❤️ Mis Favoritos</h6>
        {favorites.length === 0 ? (
            <div className="text-center text-body-secondary py-2">
                <small>Aún no tienes favoritos.</small>
            </div>
        ) : (
            <div className="d-flex flex-column gap-2 mb-3">
                {favorites.slice(0, 3).map(event => (
                    <Link key={event.id} to={`/event/${event.id}`} className="text-decoration-none">
                        <div className="d-flex align-items-center gap-2 p-1 pe-3 border border-secondary-subtle rounded-pill hover-effect bg-body-tertiary shadow-sm">
                            <img 
                                src={event.image || "https://placehold.co/50x50"} 
                                className="rounded-circle object-fit-cover shadow-sm" 
                                style={{width: '32px', height: '32px'}} 
                                alt="fav" 
                            />
                            <div className="text-truncate">
                                <h6 className="fw-bold mb-0 text-body text-truncate" style={{fontSize: '0.80rem'}}>
                                    {event.title}
                                </h6>
                                <small className="text-body-secondary" style={{fontSize: '0.7rem'}}>
                                    {new Date(event.start_at).toLocaleDateString()}
                                </small>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
        {favorites.length > 0 && (
            <Link to="/dashboard" className="btn btn-outline-danger btn-sm w-100 rounded-pill fw-bold">
                Ver todos en Dashboard
            </Link>
        )}
    </div>
  </>
);

/**
 * @component SearchFilters
 * @description Panel de filtros de búsqueda que actualiza el estado de forma bidireccional.
 */
const SearchFilters = ({ filters, categories, handleFilterChange, clearFilters }) => (
  <>
    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2"><span>🔍</span> Filtros</h5>
    <div className="mb-4">
        <label className="form-label small fw-bold text-muted text-uppercase">Búsqueda</label>
        <input type="text" className="form-control rounded-3 border-light-subtle shadow-sm" placeholder="¿Qué buscas?" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
    </div>
    <div className="mb-4">
        <label className="form-label small fw-bold text-muted text-uppercase">Ciudad</label>
        <input type="text" className="form-control rounded-3 border-light-subtle shadow-sm" placeholder="Ej: Madrid" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} />
    </div>
    <div className="mb-4">
        <label className="form-label small fw-bold text-muted text-uppercase">Categoría</label>
        <select className="form-select rounded-3 border-light-subtle shadow-sm" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
            <option value="">Todas</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
    </div>
    <div className="mb-4">
        <label className="form-label small fw-bold text-muted text-uppercase">Fecha</label>
        <div className="d-flex flex-column gap-2">
          {['any', 'today', 'week'].map(d => (
            <button key={d} onClick={() => handleFilterChange('date', d)} className={`btn btn-sm text-start shadow-sm ${filters.date === d ? 'btn-primary' : 'btn-outline-secondary border-0 bg-white'}`}>
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
 * @description Tarjeta de presentación de evento. Utiliza Flexbox (`flex-grow-1`) 
 * para garantizar que todas las tarjetas de una misma fila mantengan la misma altura visual.
 */
const EventCard = ({ event, size = "small" }) => {
    const isLarge = size === "large";
    
    return (
        <div className={isLarge ? "col-lg-8 col-md-12" : "col-lg-4 col-md-6"}>
            <Link to={`/event/${event.id}`} className="text-decoration-none text-body d-block h-100">
                <div className="bento-card h-100 hover-effect border-secondary border-opacity-10 shadow-sm bg-body d-flex flex-column rounded-4 overflow-hidden">
                    
                    {/* Contenedor de Imagen con altura fija para mantener simetría */}
                    <div className="position-relative overflow-hidden w-100" style={{ height: '240px' }}>
                        <img src={event.image || "https://placehold.co/800x400"} 
                             className="w-100 h-100" 
                             alt={event.title} 
                             style={{ objectFit: 'cover' }} />
                        
                        <div className="position-absolute top-0 end-0 m-3">
                            <span className="badge bg-white text-dark shadow px-3 py-2 rounded-pill fw-bold fs-6">
                                {parseFloat(event.price) === 0 ? 'GRATIS' : `$${event.price}`}
                            </span>
                        </div>
                        {event.is_featured && (
                            <span className="position-absolute top-0 start-0 bg-warning text-dark fw-bold px-3 py-2 m-3 rounded-pill shadow-sm" style={{fontSize: '0.8rem'}}>
                                ⭐ Destacado
                            </span>
                        )}
                    </div>

                    {/* Contenedor de Texto con flex-grow-1 para absorber diferencias de altura */}
                    <div className="p-3 p-md-4 pb-4 flex-grow-1 d-flex flex-column">
                        <small className="text-primary fw-bold text-uppercase mb-2 d-block" style={{letterSpacing: '1px'}}>
                            {event.category?.name || 'General'}
                        </small>
                        <h4 className={`fw-bold mb-3 text-body ${isLarge ? "display-6" : "fs-5"}`}>{event.title}</h4>
                        
                        <div className="text-body-secondary small mt-auto">
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
 * @component Home
 * @description Vista principal de la aplicación. Orquesta la búsqueda, paginación 
 * y renderizado de la lista de eventos, así como la carga de datos del usuario si está autenticado.
 */
function Home() {
  // --- ESTADOS GLOBALES ---
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS DE PAGINACIÓN Y FILTROS ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '', city: '', category: '', date: 'any', sort: 'newest'
  });

  // --- ESTADOS DE USUARIO (Panel Lateral) ---
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [favorites, setFavorites] = useState([]); // Estado para gestionar los favoritos
  
  const token = localStorage.getItem('auth_token');

  // Banners promocionales estáticos
  const promoBanners = [
    { id: 1, img: "/img/bannerCL.png", alt: "Bienvenido a CaraLibre" },
    { id: 2, img: "/img/bannerTW.png", alt: "Nueva temporada Teatro Wagner" }
  ];

  //Scroll to Top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Se ejecuta una sola vez al montar el componente

  /**
   * Efecto Inicial: Carga las categorías públicas y, si el usuario está logueado,
   * realiza llamadas concurrentes (Promise.all) para alimentar el menú lateral.
   */
  useEffect(() => {
    // 1. Carga de Categorías (Público)
    fetch('http://127.0.0.1:8000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error cargando categorías:", err));

    // 2. Carga de Datos Privados (Solo si hay token)
    if (token) {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Ejecutamos ambas consultas en paralelo para mejorar el rendimiento
        Promise.all([
            fetch('http://127.0.0.1:8000/api/my-enrollments', { headers }).then(res => res.ok ? res.json() : []),
            fetch('http://127.0.0.1:8000/api/my-favorites', { headers }).then(res => res.ok ? res.json() : [])
        ])
        .then(([enrollments, favs]) => {
            const now = new Date();

            // LÓGICA DE NEGOCIO (Frontend)
            // 1. Filtramos para quitar los eventos que ya pasaron
            // 2. Ordenamos cronológicamente (el más próximo primero)
            const upcomingEvents = enrollments
                .filter(ev => new Date(ev.start_at) >= now)
                .sort((a, b) => new Date(a.start_at) - new Date(b.start_at));

            // Solo guardamos los 3 primeros eventos inminentes
            setMyEnrollments(upcomingEvents.slice(0, 3));
            setFavorites(favs); 
        })
        .catch(err => console.error("Error cargando widgets de usuario:", err));
    }
  }, [token]);

  /**
   * Efecto de Búsqueda: Se dispara cada vez que cambia un filtro o la página actual.
   */
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [filters, currentPage]);

  /**
   * Construye la URL con los parámetros de búsqueda y realiza la petición a Laravel.
   */
  const fetchEvents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    
    // Solo añadimos los parámetros si tienen valor para mantener la URL limpia
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
      .catch(err => {
          console.error("Error cargando eventos", err);
          setLoading(false);
      });
  };

  /**
   * Actualiza el estado de los filtros y reinicia la paginación a 1.
   */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); 
  };

  /**
   * Restablece todos los filtros a sus valores por defecto.
   */
  const clearFilters = () => {
    setFilters({ search: '', city: '', category: '', date: 'any', sort: 'newest' });
    setCurrentPage(1);
  };

  // Variables calculadas para renderizado condicional de la cabecera
  const selectedCategoryObj = filters.category ? categories.find(c => c.id.toString() === filters.category) : null;
  const isFiltering = filters.search || filters.city || filters.category || filters.date !== 'any';

  return (
    <div className="pb-5">
      {/* 1. HERO BANNER (Solo visible en la página 1 y sin filtros activos) */}
      {!isFiltering && currentPage === 1 && (
        <div className="container mt-2 mb-4">
            <div id="promoCarousel" className="carousel slide bento-card shadow-lg border-0 overflow-hidden rounded-4" data-bs-ride="carousel">
                <div className="carousel-inner">
                    {promoBanners.map((promo, idx) => (
                        <div key={promo.id} className={`carousel-item ${idx === 0 ? 'active' : ''}`}>
                            <img src={promo.img} className="d-block w-100" style={{ height: '350px', objectFit: 'cover' }} alt={promo.alt} />
                        </div>
                    ))}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#promoCarousel" data-bs-slide="prev"><span className="carousel-control-prev-icon shadow-sm"></span></button>
                <button className="carousel-control-next" type="button" data-bs-target="#promoCarousel" data-bs-slide="next"><span className="carousel-control-next-icon shadow-sm"></span></button>
            </div>
        </div>
      )}

      {/* 2. BOTÓN DE BÚSQUEDA MÓVIL (Offcanvas Trigger) */}
      <div className="container d-lg-none mb-4">
        <button className="btn btn-primary w-100 fw-bold rounded-pill shadow-sm py-3" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasMobileMenu">
            🔍 Filtros de Búsqueda
        </button>
      </div>

      <div className="container">
        <div className="row g-4">
            
            {/* 3. SIDEBAR IZQUIERDO (Oculto en móvil) */}
            <div className="col-lg-3 d-none d-lg-block">
                <div className="sticky-top" style={{top: '20px'}}>
                    {/* Renderizamos los widgets pasándole correctamente las PROPS */}
                    {token && <UserWidgets myEnrollments={myEnrollments} favorites={favorites} />}
                    
                    <div className="bento-card p-4 bg-body border border-secondary-subtle shadow-sm rounded-4">
                        <SearchFilters filters={filters} categories={categories} handleFilterChange={handleFilterChange} clearFilters={clearFilters} />
                    </div>
                </div>
            </div>

            {/* 4. GRID DE EVENTOS (Contenido Principal) */}
            <div className="col-lg-9">
                
                {/* Cabecera dinámica si el usuario está buscando algo */}
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

                {/* Renderizado de estado de carga, vacío o lista de tarjetas */}
                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : events.length === 0 ? (
                    <div className="bento-card p-5 text-center bg-body border border-secondary-subtle rounded-4 shadow-sm">
                        <h4 className="text-body-secondary">No encontramos eventos</h4>
                        <button onClick={clearFilters} className="btn btn-primary mt-3 rounded-pill fw-bold">Ver todos los eventos</button>
                    </div>
                ) : (
                    <div className="row g-3 g-md-4">
                        {events.map((event) => (
                            <EventCard 
                                key={event.id} 
                                event={event} 
                                size={event.is_featured && !isFiltering && currentPage === 1 ? "large" : "small"} 
                            />
                        ))}
                    </div>
                )}

                {/* 5. PAGINACIÓN INFERIOR */}
                {totalPages > 1 && (
                    <nav className="mt-5 mb-4">
                        <ul className="pagination justify-content-center shadow-sm rounded-pill">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link rounded-start-pill px-4 fw-bold text-body" onClick={() => { setCurrentPage(currentPage - 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}>Anterior</button>
                            </li>
                            <li className="page-item disabled">
                                <span className="page-link bg-body-tertiary text-body fw-bold px-4 border-start-0 border-end-0">Página {currentPage} de {totalPages}</span>
                            </li>
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link rounded-end-pill px-4 fw-bold text-body" onClick={() => { setCurrentPage(currentPage + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}>Siguiente</button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
        </div>
      </div>

      {/* 6. OFFCANVAS (MENÚ DE FILTROS EN VERSIÓN MÓVIL) */}
      <div className="offcanvas offcanvas-start rounded-end-4" tabIndex="-1" id="offcanvasMobileMenu" aria-labelledby="offcanvasMobileMenuLabel">
        <div className="offcanvas-header border-bottom border-secondary-subtle bg-body">
          <h5 className="offcanvas-title fw-bold text-body" id="offcanvasMobileMenuLabel">🔍 Buscar Eventos</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body bg-body-tertiary">
          <div className="bento-card p-4 bg-body shadow-sm rounded-4 border border-secondary-subtle">
            <SearchFilters filters={filters} categories={categories} handleFilterChange={handleFilterChange} clearFilters={clearFilters} />
          </div>
          <button className="btn btn-primary w-100 rounded-pill mt-4 py-3 shadow-sm fw-bold" data-bs-dismiss="offcanvas">Aplicar Filtros</button>
        </div>
      </div>
    </div>
  );
}

export default Home;