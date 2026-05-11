import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * =========================================================================
 * COMPONENTE: ADMIN PANEL (Panel de Control de Eventos)
 * =========================================================================
 * ¿Para qué sirve?: Es la vista donde el administrador puede ver todos los 
 * eventos de la plataforma, destacarlos (para que salgan en el banner principal)
 * o eliminarlos si incumplen las normas.
 */
function AdminPanel() {
    // -----------------------------------------------------------------------
    // 1. ESTADOS (Memoria del Componente)
    // -----------------------------------------------------------------------
    // Estados para el Modal de confirmación de borrado
    const [showModal, setShowModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    
    // Estados para los datos y la UI (Interfaz de Usuario)
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true); // Controla el "spinner" de carga
    const [error, setError] = useState(null);     // Guarda mensajes de error
    
    const navigate = useNavigate();
    const token = localStorage.getItem('auth_token');

    // -----------------------------------------------------------------------
    // 2. EFECTO DE CARGA (Montaje del componente)
    // -----------------------------------------------------------------------
    useEffect(() => {
        // Barrera de seguridad 1: ¿Hay token?
        if (!token) {
            navigate('/login');
            return;
        }

        // Petición al Backend para traer TODOS los eventos (ruta protegida por admin)
        fetch('http://127.0.0.1:8000/api/admin/events', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            // Barrera de seguridad 2: ¿El token es de un Admin? (Controlamos el Error 403)
            if (res.status === 403) throw new Error("Acceso denegado. No eres administrador.");
            return res.json();
        })
        .then(data => {
            setEvents(data);   // Guardamos los eventos en memoria
            setLoading(false); // Apagamos el spinner
        })
        .catch(err => {
            setError(err.message); // Si falla, mostramos el mensaje de error visualmente
            setLoading(false);
        });
    }, [token, navigate]);

    // -----------------------------------------------------------------------
    // 3. FUNCIÓN: HACER DESTACADO (Método PUT)
    // -----------------------------------------------------------------------
    const toggleFeature = async (eventId) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/events/${eventId}/feature`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                
                // ACTUALIZACIÓN DE ESTADO INMUTABLE (Súper importante en React)
                // Recorremos los eventos. Si el ID coincide, le actualizamos la propiedad 'is_featured'.
                // Si no coincide, lo dejamos igual. Esto repinta la tabla sin tener que pedir los datos a Laravel de nuevo.
                setEvents(events.map(ev => ev.id === eventId ? { ...ev, is_featured: data.is_featured } : ev));
            } else {
                alert("Error al actualizar el evento");
            }
        } catch (error) {
            alert("Error de conexión");
        }
    };

    // -----------------------------------------------------------------------
    // RENDERIZADO CONDICIONAL DE CARGA Y ERROR
    // -----------------------------------------------------------------------
    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-danger"></div></div>;

    if (error) return (
        <div className="container mt-5 text-center">
            <div className="alert alert-danger d-inline-block p-4 shadow-sm rounded-4">
                <h3>🛑 {error}</h3>
                <Link to="/" className="btn btn-outline-dark mt-3 rounded-pill">Volver al inicio</Link>
            </div>
        </div>
    );

    // -----------------------------------------------------------------------
    // 4. FUNCIÓN: BORRAR EVENTO (Método DELETE)
    // -----------------------------------------------------------------------
    const deleteEvent = async (id) => {
        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // SINCRONIZACIÓN DE UI: Filtramos el array para quitar el evento borrado.
                // React detecta el cambio y lo desaparece de la pantalla mágicamente.
                setEvents(events.filter(ev => ev.id !== id)); 
                toast.success("Evento eliminado con éxito"); 
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    return (
        <div className="container mt-5 mb-5">
            {/* CABECERA */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">👑 Panel de Administración</h2>
                <span className="badge bg-dark fs-6 rounded-pill px-3 py-2">{events.length} Eventos Totales</span>
            </div>

            {/* TABLA DE EVENTOS (Estilo Bento) */}
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th className="ps-4">ID</th>
                                <th>Evento</th>
                                <th>Organizador</th>
                                <th>Fecha</th>
                                <th className="text-center">Destacado (Banner)</th>
                                <th className="pe-4 text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => (
                                // Resaltamos la fila si el evento está destacado
                                <tr key={event.id} className={event.is_featured ? "table-warning" : ""}>
                                    <td className="text-muted fw-bold ps-4">#{event.id}</td>
                                    <td>
                                        <strong>{event.title}</strong>
                                        <br/>
                                        {/* Optional Chaining (?.) para evitar errores si location es nulo */}
                                        <small className="text-muted">📍 {event.location?.split(' | ')[0] || 'Online'}</small>
                                    </td>
                                    <td>{event.user?.name || 'Desconocido'}</td>
                                    <td>{new Date(event.start_at).toLocaleDateString()}</td>
                                    <td className="text-center">
                                        <button 
                                            onClick={() => toggleFeature(event.id)} 
                                            className={`btn btn-sm rounded-pill shadow-sm ${event.is_featured ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`}
                                            style={{ width: '130px' }}
                                        >
                                            {event.is_featured ? '⭐ Destacado' : 'Hacer Destacado'}
                                        </button>
                                    </td>
                                    <td className="pe-4 text-end">
                                        <Link to={`/event/${event.id}`} className="btn btn-sm btn-outline-primary rounded-pill me-2 shadow-sm" target="_blank">
                                            Ver 👀
                                        </Link>
                                        <button 
                                            // Abre el modal y guarda en memoria el evento seleccionado
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

            {/* =========================================================
                MODAL DE CONFIRMACIÓN (Diseño Flotante y Moderno)
            ========================================================= */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered animate__animated animate__fadeInDown">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                            <div className="modal-header border-0 pt-4 px-4">
                                <h5 className="modal-title fw-bold fs-4">⚠️ Confirmar Eliminación</h5>
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
                                <button className="btn btn-danger rounded-pill px-4 fw-bold shadow" onClick={() => {
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