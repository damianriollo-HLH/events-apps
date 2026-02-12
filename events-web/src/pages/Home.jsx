import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // --- CARGA DE DATOS ---
  const fetchEvents = (search = '', categoryId = null) => {
    setLoading(true);
    let url = 'http://127.0.0.1:8000/api/events?';
    if (search) url += `search=${search}&`;
    if (categoryId) url += `category=${categoryId}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
    fetch('http://127.0.0.1:8000/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data));
  }, []);

  // --- HANDLERS ---
  const handleSearch = (e) => {
    e.preventDefault();
    setSelectedCategory(null);
    fetchEvents(searchTerm, null);
  };

  const handleCategoryClick = (id) => {
    if (selectedCategory === id) {
        setSelectedCategory(null);
        fetchEvents(searchTerm, null);
    } else {
        setSelectedCategory(id);
        fetchEvents(searchTerm, id);
    }
  };

  // --- LÓGICA DE VISUALIZACIÓN ---
  // Sepamos el primer evento (Destacado) del resto
  const featuredEvent = events.length > 0 ? events[0] : null;
  const otherEvents = events.length > 0 ? events.slice(1) : [];

  return (
    <div className="container-fluid p-0"> {/* Fluid para que el banner toque los bordes */}
      
      {/* ================================================= */}
      {/* SECTOR 1: HERO SECTION (EVENTO DESTACADO)         */}
      {/* ================================================= */}
      {!loading && featuredEvent && !searchTerm && !selectedCategory && (
        <div 
            className="position-relative text-white mb-5 shadow"
            style={{
                backgroundImage: `url(${featuredEvent.image || 'https://placehold.co/1200x600?text=Evento'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '500px', // Altura del banner
                display: 'flex',
                alignItems: 'flex-end' // Texto abajo
            }}
        >
            {/* Capa oscura para que se lea el texto */}
            <div 
                className="w-100 p-5" 
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}
            >
                <div className="container">
                    <span className="badge bg-warning text-dark mb-2">🔥 Evento Destacado</span>
                    <h1 className="display-3 fw-bold">{featuredEvent.title}</h1>
                    <p className="lead d-none d-md-block" style={{maxWidth: '600px'}}>
                        {featuredEvent.description.substring(0, 150)}...
                    </p>
                    <div className="d-flex gap-3 mt-3">
                        <Link to={`/event/${featuredEvent.id}`} className="btn btn-light btn-lg fw-bold px-4">
                            Ver Detalles
                        </Link>
                        <span className="text-white align-self-center fs-5">
                            📅 {new Date(featuredEvent.start_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* ================================================= */}
      {/* SECTOR 2: BARRA DE CONTROL (BUSCADOR Y FILTROS)   */}
      {/* ================================================= */}
      <div className="container my-5">
        <div className="text-center mb-5">
            {!featuredEvent && <h1 className="fw-bold">Próximos Eventos</h1>}
            <p className="text-muted">Encuentra lo que te apasiona</p>

            {/* Buscador */}
            <form onSubmit={handleSearch} className="d-flex justify-content-center mt-3">
                <div className="input-group shadow-sm" style={{ maxWidth: '600px' }}>
                    <input 
                        type="text" className="form-control border-0" 
                        placeholder="Buscar concierto, taller..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-primary px-4" type="submit">🔍</button>
                </div>
            </form>

            {/* Categorías (Pildoras) */}
            <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
                <button 
                    className={`btn btn-sm rounded-pill px-3 ${selectedCategory === null ? 'btn-dark' : 'btn-outline-secondary'}`}
                    onClick={() => handleCategoryClick(null)}
                >
                    Todas
                </button>
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        className={`btn btn-sm rounded-pill px-3 ${selectedCategory === cat.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => handleCategoryClick(cat.id)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>

        {/* ================================================= */}
        {/* SECTOR 3: LA GALERÍA (EL RESTO DE EVENTOS)        */}
        {/* ================================================= */}
        {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
            <div className="row g-4">
                {/* TRUCO: Si estamos filtrando o buscando, mostramos TODOS los resultados.
                    Si es la vista inicial normal, mostramos 'otherEvents' (porque el 1º ya salió arriba).
                */}
                {(searchTerm || selectedCategory ? events : otherEvents).map(event => (
                    <div key={event.id} className="col-md-4 col-lg-3"> {/* 4 columnas en pantallas grandes */}
                        <div className="card h-100 border-0 shadow-sm hover-effect">
                            <div className="position-relative">
                                <img 
                                    src={event.image || "https://placehold.co/400x300"} 
                                    className="card-img-top rounded-top" 
                                    alt={event.title}
                                    style={{ height: '180px', objectFit: 'cover' }}
                                />
                                <span className="position-absolute top-0 end-0 m-2 badge bg-white text-dark shadow-sm">
                                    ${event.price}
                                </span>
                            </div>
                            
                            <div className="card-body">
                                <small className="text-primary fw-bold text-uppercase" style={{fontSize: '0.75rem'}}>
                                    {event.category?.name || 'Evento'}
                                </small>
                                <h6 className="card-title fw-bold mt-1 mb-2 text-truncate">{event.title}</h6>
                                <p className="text-muted small mb-3">
                                    📅 {new Date(event.start_at).toLocaleDateString()}
                                </p>
                                <Link to={`/event/${event.id}`} className="btn btn-outline-dark btn-sm w-100 rounded-pill">
                                    Ver Ticket
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {events.length === 0 && (
                    <div className="col-12 text-center py-5">
                        <h3>😕 No hay resultados</h3>
                        <p className="text-muted">Intenta cambiar los filtros.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}

export default Home;