import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function AdminCategories() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [editId, setEditId] = useState(null);
    const token = localStorage.getItem('auth_token');
    const [errors, setErrors] = useState({}); // Guardará los errores de Laravel
    
    // Seguridad: No puede ver páginas de admin si no es admin
    useEffect(() => {
    const isAdmin = localStorage.getItem('is_admin') === '1';
    if (!isAdmin) {
        toast.error("Zona restringida");
        navigate('/'); // Lo mandamos a la home
        return;
    }
    fetchCategories();
    }, [navigate]);

    const fetchCategories = () => {
        fetch('http://127.0.0.1:8000/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); // Limpiamos errores previos

        const method = editId ? 'PUT' : 'POST';
        const url = editId 
            ? `http://127.0.0.1:8000/api/admin/categories-admin/${editId}` 
            : 'http://127.0.0.1:8000/api/admin/categories-admin';

        const res = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json', // para recibir JSON de Laravel
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ name })
        });

        const data = await res.json();

        if (res.ok) {
            toast.success(editId ? 'Actualizada' : 'Creada');
            setName('');
            setEditId(null);
            fetchCategories();
        } else if (res.status === 422) {
        // CAPTURAMOS LOS ERRORES DE LARAVEL 
        setErrors(data.errors); 
        } else {
            toast.error("Error inesperado");
        }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm("¿Borrar categoría?")) return;
        const res = await fetch(`http://127.0.0.1:8000/api/admin/categories-admin/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) fetchCategories();
        else toast.error("No se puede borrar (tiene eventos)");
    };

    return (
        <div className="container mt-5">
            <h2 className="fw-bold mb-4">📂 Gestión de Categorías</h2>
            
            {/* Formulario de creación/edición */}
            <form onSubmit={handleSubmit} className="bento-card p-4 mb-4 bg-body shadow-sm">
                <div className="mb-3"> 
                    <div className="input-group">
                        <input 
                            type="text" 
                            /* Añadimos dinámicamente la clase is-invalid si hay error en 'name' */
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`} 
                            placeholder="Nombre de la categoría" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            /* Quitamos 'required' para dejar que Laravel gestione el error 
                            y así probar que nuestra validación visual funciona */
                        />
                        <button className="btn btn-primary" type="submit">
                            {editId ? 'Actualizar' : '➕ Añadir'}
                        </button>

                        {/*En un input-group, el feedback de error debe ir 
                        dentro del div para que Bootstrap lo posicione correctamente.
                        */}
                        {errors.name && (
                            <div className="invalid-feedback fw-bold">
                                {errors.name[0]}
                            </div>
                        )}
                    </div>
                </div>
            </form>

            {/* Tabla de resultados */}
            <div className="bento-card bg-body shadow-sm overflow-hidden">
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
                                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => { setEditId(cat.id); setName(cat.name); }}>✏️</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCategory(cat.id)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminCategories;