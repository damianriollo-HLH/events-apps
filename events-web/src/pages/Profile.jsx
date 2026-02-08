import { useState, useEffect } from 'react';

function Profile() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  
  // Cargamos los datos actuales del usuario al entrar
  useEffect(() => {
    // Recuperamos nombre del localStorage (o podríamos pedirlo a la API)
    // Para hacerlo simple, usaremos lo que guardamos en Login, 
    // pero lo ideal sería hacer un fetch('/api/user')
    const savedName = localStorage.getItem('user_name');
    // Como el email no lo guardamos en localStorage, lo dejamos en blanco o 
    // idealmente haríamos una petición GET /api/user.
    // Para esta versión rápida, solo pre-llenamos el nombre.
    setFormData(prev => ({ ...prev, name: savedName || '' }));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const token = localStorage.getItem('auth_token');

    try {
        const response = await fetch('http://127.0.0.1:8000/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            setMessage("¡Datos actualizados con éxito!");
            // Actualizamos el nombre en el navegador para que el menú de arriba cambie
            localStorage.setItem('user_name', data.user.name);
            // Limpiamos los campos de contraseña
            setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
            
            // Truco: Recargamos la página después de 1 segundo para ver el nombre nuevo arriba
            setTimeout(() => window.location.reload(), 1500);
        } else {
            setError(data.message || "Error al actualizar");
        }
    } catch (err) {
        console.error(err);
        setError("Error de conexión");
    }
  };

  return (
    <div className="container mt-5">
        <div className="card shadow p-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2 className="text-center mb-4">👤 Mi Perfil</h2>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input 
                        type="text" name="name" className="form-control" 
                        value={formData.name} onChange={handleChange} required 
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input 
                        type="email" name="email" className="form-control" 
                        placeholder="nuevo@email.com"
                        value={formData.email} onChange={handleChange} required 
                    />
                    <small className="text-muted">Confirma tu email actual o pon uno nuevo.</small>
                </div>

                <hr className="my-4"/>
                <h5 className="text-muted mb-3">Cambiar Contraseña (Opcional)</h5>

                <div className="mb-3">
                    <label className="form-label">Nueva Contraseña</label>
                    <input 
                        type="password" name="password" className="form-control" 
                        value={formData.password} onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Confirmar Nueva Contraseña</label>
                    <input 
                        type="password" name="password_confirmation" className="form-control" 
                        value={formData.password_confirmation} onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100">Guardar Cambios</button>
            </form>
        </div>
    </div>
  );
}

export default Profile;