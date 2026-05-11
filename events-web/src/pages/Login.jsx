import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * =========================================================================
 * COMPONENTE: LOGIN (Inicio de Sesión)
 * =========================================================================
 * ¿Para qué sirve?: Autentica al usuario contra la API de Laravel, 
 * recibe el Token Sanctum y guarda los datos de la sesión en el navegador.
 */
function Login() {
  // -----------------------------------------------------------------------
  // 1. ESTADOS DEL FORMULARIO (Componentes Controlados)
  // -----------------------------------------------------------------------
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Feedback visual para el botón

  // -----------------------------------------------------------------------
  // 2. ENVÍO DEL FORMULARIO (Petición de Autenticación)
  // -----------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {

        let finalImageUrl = '';
        
        // Comprobamos que haya imagen y que NO sea la palabra 'null'
        if (data.user.image && data.user.image !== 'null') {
            if (data.user.image.startsWith('http')) {
                // Si por algún casual ya viene con el http (ej: Google Login), la dejamos tal cual
                finalImageUrl = data.user.image;
            } else {
                // Le quitamos la palabra "storage/" si Laravel ya se la ha puesto
                const cleanPath = data.user.image.replace(/^storage\//, '');
                finalImageUrl = `http://127.0.0.1:8000/storage/${cleanPath}`;
            }
        }
        // --- ALMACENAMIENTO DE SESIÓN (LocalStorage) ---
        localStorage.setItem('auth_token', data.access_token); // La "llave maestra"
        localStorage.setItem('user_name', data.user.name);
        localStorage.setItem('user_email', data.user.email);   // Necesario para el Dashboard
        localStorage.setItem('user_image', finalImageUrl); // Guardamos la ruta limpia        localStorage.setItem('user_id', data.user.id);         // Para permisos de borrado
        localStorage.setItem('is_admin', data.user.is_admin ? '1' : '0'); // Rol de usuario

        // Redirigimos a la página principal usando window.location en lugar de useNavigate
        // Esto fuerza una recarga completa de React para que el Navbar lea los nuevos datos al instante.
        window.location.href = '/dashboard';
      } else {
        // Error de credenciales (401 Unauthorized)
        setError(data.message || 'Credenciales incorrectas');
      }

    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      {/* TARJETA BENTO */}
      <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5 bg-body w-100" style={{ maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
            <span className="fs-1">🔐</span>
          </div>
          <h2 className="fw-bold text-body">Iniciar Sesión</h2>
          <p className="text-body-secondary">Bienvenido de nuevo a CaraLibre</p>
        </div>
        
        {/* MENSAJE DE ERROR */}
        {error && (
            <div className="alert alert-danger rounded-3 fw-bold text-center border-0 shadow-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold small text-body-secondary">Email</label>
            <input 
              type="email" 
              className="form-control form-control-lg bg-body-tertiary border-secondary-subtle rounded-3" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold small text-body-secondary">Contraseña</label>
            <input 
              type="password" 
              className="form-control form-control-lg bg-body-tertiary border-secondary-subtle rounded-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 btn-lg rounded-pill fw-bold shadow-sm" disabled={loading}>
            {loading ? 'Iniciando...' : 'Entrar a mi cuenta'}
          </button>
        </form>

        <div className="text-center mt-4">
            <p className="text-body-secondary small m-0">
                ¿No tienes cuenta? <Link to="/register" className="fw-bold text-primary text-decoration-none">Regístrate aquí</Link>
            </p>
        </div>
      </div>
    </div>
  );
}

export default Login;