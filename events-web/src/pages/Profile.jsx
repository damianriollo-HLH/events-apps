import { useState, useEffect } from 'react';

function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  // Estados para la imagen
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // Para ver la foto actual o la nueva

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Cargar datos actuales (Simulado desde localStorage para el nombre, idealmente sería un fetch)
  useEffect(() => {
    const savedName = localStorage.getItem('user_name');
    if (savedName) setName(savedName);
    // Aquí podrías hacer un fetch al backend para traer la imagen actual si quisieras
    // Por ahora, empezamos sin previsualizar la vieja hasta que la cambien.
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const token = localStorage.getItem('auth_token');
    const data = new FormData();
    
    // Truco para enviar archivos en PUT
    data.append('_method', 'PUT');
    data.append('name', name);
    data.append('email', email);
    
    if (password) {
        data.append('password', password);
        data.append('password_confirmation', passwordConfirm);
    }
    
    if (imageFile) {
        data.append('image', imageFile);
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/profile', {
            method: 'POST', // Usamos POST con _method: PUT
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: data
        });

        const result = await response.json();

        if (response.ok) {
            setMessage("¡Perfil actualizado! 📸");
            localStorage.setItem('user_name', result.user.name);
            // Guardamos la foto en el navegador por si la queremos usar en el Navbar
            localStorage.setItem('user_image', result.user.image);
            
            setTimeout(() => window.location.reload(), 1500);
        } else {
            setError(result.message || "Error al actualizar");
        }
    } catch (err) {
        console.error(err);
        setError("Error de conexión");
    }
  };

  return (
    <div className="container mt-5">
        <div className="card shadow p-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2 className="text-center mb-4">👤 Editar Perfil</h2>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* FOTO DE PERFIL */}
                <div className="mb-4 text-center">
                    <div style={{ width: '100px', height: '100px', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0', border: '2px solid #ddd' }}>
                        {previewUrl ? (
                            <img src={previewUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ lineHeight: '100px', fontSize: '40px' }}>👤</span>
                        )}
                    </div>
                    <label className="btn btn-sm btn-outline-primary mt-2">
                        Cambiar Foto
                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </label>
                </div>

                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Confirma tu email..." />
                </div>

                <hr />
                <div className="mb-3">
                    <label className="form-label">Nueva Contraseña (Opcional)</label>
                    <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Confirmar Contraseña</label>
                    <input type="password" className="form-control" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-primary w-100">Guardar Cambios</button>
            </form>
        </div>
    </div>
  );
}

export default Profile;