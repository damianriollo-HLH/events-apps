import { useState, useEffect } from 'react';

function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  // NUEVO: Estado para las notificaciones
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Estados para la imagen
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Cargar datos reales del usuario desde la API ---
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    fetch('http://127.0.0.1:8000/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        setName(data.name || '');
        setEmail(data.email || '');
        setPreviewUrl(data.image || null);
        // Si viene un 1 o true, activamos el switch
        setEmailNotifications(data.email_notifications ? true : false);
        setLoading(false);
    })
    .catch(err => {
        console.error("Error:", err);
        setLoading(false);
    });
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
    
    data.append('_method', 'PUT');
    data.append('name', name);
    data.append('email', email);
    
    // Convertimos true/false a 1/0 para la base de datos
    data.append('email_notifications', emailNotifications ? 1 : 0);
    
    if (password) {
        data.append('password', password);
        data.append('password_confirmation', passwordConfirm);
    }
    
    if (imageFile) {
        data.append('image', imageFile);
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/profile', {
            method: 'POST', // Usamos POST con el truco _method: PUT
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: data
        });

        const result = await response.json();

        if (response.ok) {
            setMessage("¡Perfil actualizado! 💾");
            localStorage.setItem('user_name', result.user.name);
            localStorage.setItem('user_image', result.user.image);
            
            // Recarga para actualizar el Navbar
            setTimeout(() => window.location.reload(), 1500);
        } else {
            setError(result.message || "Error al actualizar");
        }
    } catch (err) {
        setError("Error de conexión");
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container mt-5 mb-5">
        <div className="card shadow border-0" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card-header bg-dark text-white p-4 text-center">
                <h2 className="mb-0">👤 Mi Perfil</h2>
            </div>
            
            <div className="card-body p-4 p-md-5">
                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* 1. FOTO DE PERFIL */}
                    <div className="mb-4 text-center">
                        <div className="position-relative d-inline-block">
                            <img 
                                src={previewUrl || `https://ui-avatars.com/api/?name=${name}&background=random&size=120`} 
                                alt="Avatar" 
                                className="rounded-circle shadow-sm border border-3 border-white"
                                style={{ width: '120px', height: '120px', objectFit: 'cover' }} 
                            />
                            <label className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle shadow" style={{width: '35px', height: '35px', padding: '5px'}}>
                                📸
                                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <div className="text-muted small mt-2">Haz clic en la cámara para cambiar tu foto</div>
                    </div>

                    <h5 className="text-primary border-bottom pb-2 mb-3">Datos Personales</h5>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Nombre</label>
                        <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-bold">Email</label>
                        <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    {/* 2. PREFERENCIAS DE NOTIFICACIÓN (NUEVO) */}
                    <h5 className="text-primary border-bottom pb-2 mb-3">Preferencias</h5>
                    <div className="p-3 bg-light rounded border mb-4">
                        <div className="form-check form-switch d-flex align-items-center gap-3">
                            <input 
                                className="form-check-input fs-4 m-0" 
                                type="checkbox" 
                                role="switch" 
                                id="emailSwitch"
                                checked={emailNotifications} 
                                onChange={(e) => setEmailNotifications(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="emailSwitch">
                                <strong className="d-block">Notificaciones por Email</strong>
                                <small className="text-muted">Avisos sobre mis eventos y nuevas entradas compradas.</small>
                            </label>
                        </div>
                    </div>

                    <h5 className="text-primary border-bottom pb-2 mb-3">Seguridad</h5>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Nueva Contraseña (Opcional)</label>
                        <input type="password" className="form-control" placeholder="Déjalo en blanco si no quieres cambiarla" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-bold">Confirmar Contraseña</label>
                        <input type="password" className="form-control" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow">
                        💾 Guardar Cambios
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
}

export default Profile;