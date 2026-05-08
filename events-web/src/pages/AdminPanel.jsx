import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import toast from 'react-hot-toast';


function AdminPanel() {
    const [showModal, setShowModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('auth_token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        fetch('http://127.0.0.1:8000/api/admin/events', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (res.status === 403) throw new Error("Acceso denegado. No eres administrador.");
            return res.json();
        })
        .then(data => {
            setEvents(data);
            setLoading(false);
        })
        .catch(err => {
            setError(err.message);
            setLoading(false);
        });
    }, [token, navigate]);

    const toggleFeature = async (eventId) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/events/${eventId}/feature`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                // Actualizamos la tabla visualmente
                setEvents(events.map(ev => ev.id === eventId ? { ...ev, is_featured: data.is_featured } : ev));
            } else {
                alert("Error al actualizar el evento");
            }
        } catch (error) {
            alert("Error de conexión");
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-danger"></div></div>;

    if (error) return (
        <div className="container mt-5 text-center">
            <div className="alert alert-danger d-inline-block p-4 shadow-sm">
                <h3>🛑 {error}</h3>
                <Link to="/" className="btn btn-outline-dark mt-3">Volver al inicio</Link>
            </div>
        </div>
    );

    // DELETE Evento
    const deleteEvent = async (id) => {
        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setEvents(events.filter(ev => ev.id !== id)); // Sincronización [cite: 17]
                toast.success("Evento eliminado con éxito"); // Tu toast actual
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">👑 Panel de Administración</h2>
                <span className="badge bg-dark fs-6">{events.length} Eventos Totales</span>
            </div>

            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Evento</th>
                                <th>Organizador</th>
                                <th>Fecha</th>
                                <th className="text-center">Destacado (Banner)</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => (
                                <tr key={event.id} className={event.is_featured ? "table-warning" : ""}>
                                    <td className="text-muted fw-bold">#{event.id}</td>
                                    <td>
                                        <strong>{event.title}</strong>
                                        <br/>
                                        <small className="text-muted">📍 {event.location?.split(' | ')[0] || 'Online'}</small>
                                    </td>
                                    <td>{event.user?.name || 'Desconocido'}</td>
                                    <td>{new Date(event.start_at).toLocaleDateString()}</td>
                                    <td className="text-center">
                                        <button 
                                            onClick={() => toggleFeature(event.id)} 
                                            className={`btn btn-sm ${event.is_featured ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`}
                                            style={{ width: '120px' }}
                                        >
                                            {event.is_featured ? '⭐ Destacado' : 'Hacer Destacado'}
                                        </button>
                                    </td>
                                    <td>
                                        <Link to={`/event/${event.id}`} className="btn btn-sm btn-outline-primary" target="_blank">
                                            Ver 👀
                                        </Link>
                                        {/*botón de eliminar */}
                                        <button 
                                            onClick={() => { setEventToDelete(event); setShowModal(true); }} 
                                            className="btn btn-sm btn-outline-danger shadow-sm rounded-pill px-3"
                                        >
                                            🗑️ Borrar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* MODAL DE CONFIRMACIÓN MODERNO */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable mt-5 animate__animated animate__fadeInDown">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                            <div className="modal-header border-0 pt-4 px-4">
                                <h5 className="modal-title fw-bold fs-3">⚠️ Confirmar Eliminación</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body px-4 pb-4">
                                <p className="fs-5 text-secondary">
                                    Estás a punto de eliminar el evento: <br />
                                    <strong className="text-dark">"{eventToDelete?.title}"</strong>
                                </p>
                                <p className="mb-0 text-danger fw-bold">Esta acción no se puede deshacer.</p>
                            </div>
                            <div className="modal-footer border-0 p-4 gap-3">
                                <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button className="btn btn-danger rounded-pill px-5 fw-bold shadow" onClick={() => {
                                    deleteEvent(eventToDelete.id);
                                    setShowModal(false);
                                }}>
                                    🗑️ Eliminar permanentemente
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;