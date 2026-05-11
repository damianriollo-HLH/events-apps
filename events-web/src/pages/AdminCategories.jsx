import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * =========================================================================
 * COMPONENTE: ADMIN CATEGORIES (Panel de Control de Categorías)
 * =========================================================================
 * ¿Para qué sirve?: Permite al administrador gestionar las temáticas de los
 * eventos. Es un CRUD completo en una sola vista (Single Page Application real).
 */
function AdminCategories() {
    // -----------------------------------------------------------------------
    // 1. ESTADOS (Gestión de Memoria del Componente)
    // -----------------------------------------------------------------------
    const navigate = useNavigate();
    const token = localStorage.getItem('auth_token');
    
    const [categories, setCategories] = useState([]); // Lista de categorías de la BD
    const [name, setName] = useState('');             // Valor del input del formulario
    const [editId, setEditId] = useState(null);       // ¿Estamos creando (null) o editando (ID)?
    const [errors, setErrors] = useState({});         // Captura errores del Backend (ej: "Nombre muy corto")
    
    // Estados para la Experiencia de Usuario (UX) del Modal de Borrado
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    
    // -----------------------------------------------------------------------
    // 2. SEGURIDAD FRONTEND Y CARGA INICIAL (useEffect)
    // -----------------------------------------------------------------------
    useEffect(() => {
        // Comprobamos si el usuario es admin leyendo el localStorage
        const isAdmin = localStorage.getItem('is_admin') === '1';
        
        if (!isAdmin) {
            // Si intenta entrar un usuario normal forzando la URL, lo echamos
            toast.error("Zona restringida");
            navigate('/');
            return;
        }
        // Si es admin, pedimos las categorías a Laravel
        fetchCategories();
    }, [navigate]);

    // -----------------------------------------------------------------------
    // 3. OBTENER DATOS (Método GET)
    // -----------------------------------------------------------------------
    const fetchCategories = () => {
        fetch('http://127.0.0.1:8000/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data));
    };

    // -----------------------------------------------------------------------
    // 4. CREAR O ACTUALIZAR (Métodos POST / PUT)
    // -----------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); // Limpiamos errores previos

        // Lógica Dinámica: Si hay un 'editId', actualizamos (PUT). Si no, creamos (POST).
        const method = editId ? 'PUT' : 'POST';
        const url = editId 
            ? `http://127.0.0.1:8000/api/admin/categories-admin/${editId}` 
            : 'http://127.0.0.1:8000/api/admin/categories-admin';

        const res = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json', // Importante para recibir errores 422 de Laravel
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ name })
        });

        const data = await res.json();

        if (res.ok) {
            toast.success(editId ? 'Actualizada' : 'Creada');
            setName('');       // Limpiamos el input
            setEditId(null);   // Salimos del "modo edición"
            fetchCategories(); // Recargamos la tabla automáticamente
        } else if (res.status === 422) {
            // Laravel nos avisa que la validación falló (ej: nombre duplicado)
            setErrors(data.errors); 
        } else {
            toast.error("Error inesperado");
        }
    };

    // -----------------------------------------------------------------------
    // 5. GESTIÓN DEL BORRADO CON MODAL (Método DELETE)
    // -----------------------------------------------------------------------
    // Abre la ventana flotante y "recuerda" a quién vamos a borrar
    const openDeleteModal = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    // Comunica la orden final a Laravel
    const confirmDelete = async () => {
        if (!categoryToDelete) return;
        
        const res = await fetch(`http://127.0.0.1:8000/api/admin/categories-admin/${categoryToDelete.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setShowDeleteModal(false); // Escondemos el modal
        setCategoryToDelete(null); // Limpiamos la memoria
        
        if (res.ok) {
            toast.success("Categoría eliminada");
            fetchCategories();
        } else {
            // Error común: Intentar borrar una categoría que ya tiene eventos dentro
            toast.error("No se puede borrar (tiene eventos)");
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="fw-bold mb-4">📂 Gestión de Categorías</h2>
            
            {/* FORMULARIO DE CREACIÓN/EDICIÓN */}
            <form onSubmit={handleSubmit} className="bento-card p-4 mb-4 bg-body shadow-sm rounded-4">
                <div className="mb-3"> 
                    <div className="input-group">
                        <input 
                            type="text" 
                            // Renderizado condicional de clases: Si hay error, se pone rojo (is-invalid)
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`} 
                            placeholder="Nombre de la categoría" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                        />
                        <button className="btn btn-primary" type="submit">
                            {/* Texto dinámico según el modo */}
                            {editId ? 'Actualizar' : '➕ Añadir'}
                        </button>
                        
                        {/* Mensaje de error visual que viene de Laravel */}
                        {errors.name && (
                            <div className="invalid-feedback fw-bold">
                                {errors.name[0]}
                            </div>
                        )}
                    </div>
                </div>
            </form>

            {/* TABLA DE CATEGORÍAS */}
            <div className="bento-card bg-body shadow-sm overflow-hidden rounded-4">
                <table className="table table-hover m-0">
                    <thead className="table-dark">
                        <tr>
                            <th>Nombre</th>
                            <th className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td className="fw-bold">{cat.name}</td>
                                <td className="text-end">
                                    {/* Botón Editar: Carga los datos en el formulario de arriba */}
                                    <button 
                                        className="btn btn-sm btn-outline-secondary me-2" 
                                        onClick={() => { setEditId(cat.id); setName(cat.name); }}
                                    >✏️</button>
                                    
                                    {/* Botón Borrar: Llama al Modal */}
                                    <button 
                                        className="btn btn-sm btn-outline-danger" 
                                        onClick={() => openDeleteModal(cat)}
                                    >🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* =========================================================
                MODAL PERSONALIZADO (Flotante)
            ========================================================= */}
            {showDeleteModal && categoryToDelete && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content text-center p-4 border-0 shadow-lg" style={{ backgroundColor: '#1f2229', color: '#f8fafc', borderRadius: '16px' }}>
                            
                            <div className="d-flex justify-content-end mb-1">
                                <button type="button" className="btn-close btn-close-white" style={{ fontSize: '0.8rem' }} onClick={() => setShowDeleteModal(false)}></button>
                            </div>

                            <h4 className="fw-bold mb-3" style={{ fontSize: '1.25rem' }}>¿Borrar categoría? 🗑️</h4>
                            
                            <p className="mb-4" style={{ color: '#a0aec0', fontSize: '0.95rem' }}>
                                Si confirmas, la categoría <strong>{categoryToDelete.name}</strong> será eliminada del sistema. ¡Esta acción no se puede deshacer!
                            </p>

                            <div className="d-flex justify-content-center gap-3">
                                <button 
                                    className="btn px-4 fw-bold" 
                                    style={{ backgroundColor: '#ffffff', color: '#000000', borderRadius: '50px', fontSize: '0.9rem' }} 
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Volver
                                </button>
                                <button 
                                    className="btn btn-danger px-4 fw-bold" 
                                    style={{ borderRadius: '50px', fontSize: '0.9rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }} 
                                    onClick={confirmDelete}
                                >
                                    Confirmar eliminación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCategories;