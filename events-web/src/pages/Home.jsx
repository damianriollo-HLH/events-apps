import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container my-5">
      <h1 className="text-center mb-5 fw-bold text-primary">🎉 Próximos Eventos</h1>
      
      {/* Sistema de Rejilla (Grid) */}
      <div className="row">
        {events.map(event => (
          <div key={event.id} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm border-0">
              
              {/* Imagen (Placeholder si no hay imagen real) */}
              <img 
                src={event.image || "https://placehold.co/600x400?text=Evento"} 
                className="card-img-top" 
                alt={event.title} 
                style={{ height: '200px', objectFit: 'cover' }}
              />

              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                   <h5 className="card-title fw-bold">{event.title}</h5>
                   <span className="badge bg-success fs-6">${event.price}</span>
                </div>
                
                <h6 className="card-subtitle mb-2 text-muted">
                  📅 {new Date(event.start_at).toLocaleDateString()}
                </h6>
                
                <p className="card-text text-secondary flex-grow-1">
                  {event.description.substring(0, 80)}...
                </p>
                
                <Link to={`/event/${event.id}`} className="btn btn-outline-primary w-100 mt-3">
                  Ver Detalles
                </Link>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="col-12 text-center">
            <p className="alert alert-info">No hay eventos publicados aún.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;