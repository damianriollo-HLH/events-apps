import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    if (!token) return;

    // Hacemos dos peticiones en paralelo
    Promise.all([
      fetch('http://127.0.0.1:8000/api/my-enrollments', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('http://127.0.0.1:8000/api/my-events', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ])
    .then(([res1, res2]) => Promise.all([res1.json(), res2.json()]))
    .then(([enrollmentsData, eventsData]) => {
      setEnrolledEvents(enrollmentsData);
      setMyEvents(eventsData);
      setLoading(false);
    })
    .catch(err => console.error("Error cargando dashboard:", err));
  }, [token]);

  if (!token) return <div className="container mt-5">Debes iniciar sesión.</div>;
  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container my-5">
      <h1 className="mb-4">👋 Mi Panel de Control</h1>

      <div className="row">
        {/* COLUMNA 1: EVENTOS A LOS QUE VOY (Inscripciones) */}
        <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">🎟 Mis Inscripciones</h5>
                </div>
                <div className="list-group list-group-flush">
                    {enrolledEvents.length > 0 ? (
                        enrolledEvents.map(enrollment => (
                            <Link 
                                key={enrollment.id} 
                                to={`/event/${enrollment.event.id}`} 
                                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <div className="fw-bold">{enrollment.event.title}</div>
                                    <small className="text-muted">
                                        📅 {new Date(enrollment.event.start_at).toLocaleDateString()}
                                    </small>
                                </div>
                                <span className="badge bg-success rounded-pill">Apuntado</span>
                            </Link>
                        ))
                    ) : (
                        <div className="p-4 text-center text-muted">
                            No te has apuntado a ningún evento aún.
                            <br />
                            <Link to="/" className="btn btn-outline-primary btn-sm mt-2">Explorar eventos</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* COLUMNA 2: EVENTOS QUE YO ORGANIZO (Creados) */}
        <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0">✍️ Mis Eventos Organizados</h5>
                </div>
                <div className="list-group list-group-flush">
                    {myEvents.length > 0 ? (
                        myEvents.map(event => (
                            <div key={event.id} className="list-group-item list-group-item-action">
                                <div className="d-flex w-100 justify-content-between">
                                    <h6 className="mb-1 fw-bold">{event.title}</h6>
                                    <small>{new Date(event.start_at).toLocaleDateString()}</small>
                                </div>
                                <p className="mb-1 small text-muted">{event.location_name || 'Online'}</p>
                                <div className="mt-2">
                                    <Link to={`/event/${event.id}`} className="btn btn-sm btn-outline-info me-2">Ver</Link>
                                    <Link to={`/event/edit/${event.id}`} className="btn btn-sm btn-outline-secondary">Editar</Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-muted">
                            No has creado ningún evento.
                            <br />
                            <Link to="/create-event" className="btn btn-outline-dark btn-sm mt-2">Crear mi primer evento</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;