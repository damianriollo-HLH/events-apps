import { useState, useEffect } from 'react';

/**
 * =========================================================================
 * COMPONENTE: PROFILE (Perfil de Usuario)
 * =========================================================================
 * ¿Para qué sirve?: Permite al usuario logueado actualizar sus datos
 * personales, cambiar su contraseña, subir una foto de avatar y gestionar
 * sus preferencias de notificación por email.
 */
function Profile() {
  // -----------------------------------------------------------------------
  // 1. ESTADOS DEL FORMULARIO
  // -----------------------------------------------------------------------
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  // Preferencias de usuario
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Gestión de la imagen de perfil
  const [imageFile, setImageFile] = useState(null); // El archivo físico a subir
  const [previewUrl, setPreviewUrl] = useState(null); // La URL para previsualizar la foto

  // Estados de control de la Interfaz (UI)
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------------------------
  // 2. CARGA INICIAL DE DATOS (Mount)
  // -----------------------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    // Pedimos a Laravel los datos frescos del usuario autenticado
    fetch('http://127.0.0.1:8000/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        setName(data.name || '');
        setEmail(data.email || '');
        
        // Reconstruimos la URL de la imagen si el usuario ya tenía una guardada
        if (data.image) {
            const cleanPath = data.image.replace(/^storage\//, '');
            setPreviewUrl(data.image.startsWith('http') ? data.image : `http://127.0.0.1:8000/storage/${cleanPath}`);
        }
        
        // Convertimos el 1/0 de MySQL a un true/false para el switch de React
        setEmailNotifications(data.email_notifications ? true : false);
        setLoading(false);
    })
    .catch(err => {
        console.error("Error:", err);
        setLoading(false);
    });
  }, []);

  /**
   * Genera una previsualización temporal en el navegador cuando el usuario
   * selecciona una foto nueva, antes incluso de enviarla al servidor.
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Crea una URL local efímera para poder dibujar la imagen en el <img>
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // -----------------------------------------------------------------------
  // 3. ACTUALIZACIÓN DEL PERFIL (Manejo de FormData)
  // -----------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const token = localStorage.getItem('auth_token');
    
    // Usamos FormData porque vamos a enviar un archivo binario (la foto)
    const data = new FormData();
    
    // Truco maestro para Laravel: Enviamos por POST pero le decimos que actúe como PUT
    data.append('_method', 'PUT');
    data.append('name', name);
    data.append('email', email);
    
    // Convertimos el booleano de React a un entero (1 o 0) que MySQL pueda entender
    data.append('email_notifications', emailNotifications ? 1 : 0);
    
    // Solo enviamos las contraseñas si el usuario ha escrito algo en ellas
    if (password) {
        data.append('password', password);
        data.append('password_confirmation', passwordConfirm);
    }
    
    // Solo adjuntamos el archivo físico si el usuario seleccionó uno nuevo
    if (imageFile) {
        data.append('image', imageFile);
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/profile', {
            method: 'POST', // POST físico, PUT simulado
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json' // Ojo: NO ponemos Content-Type con FormData
            },
            body: data
        });

        const result = await response.json();

        if (response.ok) {
            setMessage("¡Perfil actualizado! 💾");
            
            // Sincronizamos la memoria local con los nuevos datos devueltos por el servidor
            localStorage.setItem('user_name', result.user.name);
            
            // Lógica de URL absoluta para que la imagen no se rompa al navegar
            if (result.user.image) {
                 const cleanPath = result.user.image.replace(/^storage\//, '');
                 const finalImageUrl = result.user.image.startsWith('http') 
                     ? result.user.image 
                     : `http://127.0.0.1:8000/storage/${cleanPath}`;
                 localStorage.setItem('user_image', finalImageUrl);
            }

            // Recargamos la página para forzar al Navbar a repintar el nuevo nombre/foto
            setTimeout(() => window.location.reload(), 1000);
        } else {
            setError(result.message || "Error al actualizar");
        }
    } catch (err) {
        setError("Error de conexión");
    }
  };

  // Pantalla de carga
  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container mt-5 mb-5" style={{ minHeight: '70vh' }}>
        {/* DISEÑO BENTO: Tarjeta centralizada y redondeada */}
        <div className="card shadow border-0 bg-body rounded-4 overflow-hidden" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card-header bg-transparent border-bottom border-secondary-subtle p-4 text-center">
                <h2 className="mb-0 fw-bold text-body">👤 Mi Perfil</h2>
            </div>
            
            <div className="card-body p-4 p-md-5">
                {/* Alertas de Feedback */}
                {message && <div className="alert alert-success border-0 shadow-sm rounded-3 fw-bold">{message}</div>}
                {error && <div className="alert alert-danger border-0 shadow-sm rounded-3 fw-bold">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* ----------------------------------------------------
                        ZONA DE FOTO DE PERFIL 
                        Diseño con etiqueta sobrepuesta para subir la foto
                    ------------------------------------------------------*/}
                    <div className="mb-4 text-center">
                        <div className="position-relative d-inline-block">
                            <img 
                                src={previewUrl || `https://ui-avatars.com/api/?name=${name}&background=random&size=120`} 
                                alt="Avatar" 
                                className="rounded-circle shadow-sm border border-3 border-body"
                                style={{ width: '120px', height: '120px', objectFit: 'cover' }} 
                            />
                            <label className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle shadow d-flex align-items-center justify-content-center" style={{width: '35px', height: '35px', cursor: 'pointer', right: '-5px'}}>
                                📸
                                {/* Input oculto: Al hacer clic en el emoji, se abre el explorador de archivos */}
                                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <div className="text-muted small mt-2">Haz clic en la cámara para cambiar tu foto</div>
                    </div>

                    <h5 className="text-primary border-bottom border-secondary-subtle pb-2 mb-3 mt-5">Datos Personales</h5>
                    <div className="mb-3">
                        <label className="form-label fw-bold text-body-secondary small">Nombre</label>
                        <input type="text" className="form-control rounded-3" value={name} onChange={e => setName(e.target.value)} required />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-bold text-body-secondary small">Email</label>
                        <input type="email" className="form-control rounded-3" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required />
                    </div>

                    {/* ----------------------------------------------------
                        ZONA DE PREFERENCIAS (Interruptor)
                    ------------------------------------------------------*/}
                    <h5 className="text-primary border-bottom border-secondary-subtle pb-2 mb-3 mt-5">Preferencias</h5>

                    <div className="p-3 bg-body-tertiary rounded-4 border border-secondary-subtle shadow-sm mb-4">
                        <div className="form-check form-switch d-flex align-items-center gap-3">
                            <input 
                                className="form-check-input fs-4 m-0 border-secondary" 
                                type="checkbox" 
                                role="switch" 
                                id="emailSwitch"
                                checked={emailNotifications} 
                                // Componente Controlado: Actualiza el estado booleano
                                onChange={(e) => setEmailNotifications(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="emailSwitch">
                                <strong className="d-block text-body">Notificaciones por Email</strong>
                                <small className="text-body-secondary">Avisos sobre mis eventos y nuevas entradas compradas.</small>
                            </label>
                        </div>
                    </div>

                    {/* ----------------------------------------------------
                        ZONA DE SEGURIDAD (Cambio de contraseña)
                    ------------------------------------------------------*/}
                    <h5 className="text-primary border-bottom border-secondary-subtle pb-2 mb-3 mt-5">Seguridad</h5>
                    <div className="mb-3">
                        <label className="form-label fw-bold text-body-secondary small">Nueva Contraseña (Opcional)</label>
                        <input type="password" className="form-control rounded-3" placeholder="Déjalo en blanco si no quieres cambiarla" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-bold text-body-secondary small">Confirmar Contraseña</label>
                        <input type="password" className="form-control rounded-3" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} autoComplete="new-password" />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-3 mt-3 fw-bold rounded-pill shadow">
                        💾 Guardar Cambios
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
}

export default Profile;