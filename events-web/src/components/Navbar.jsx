import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  
  // 1. RECUPERAR DATOS DE SESIÓN
  // Buscamos si existe el token guardado en el navegador (si existe, es que estamos logueados)
  const token = localStorage.getItem('auth_token'); 
  
  // Recuperamos el nombre para saludar. Si no hay, ponemos "Usuario" por defecto.
  const userName = localStorage.getItem('user_name') || 'Usuario';

  // 2. FUNCIÓN PARA CERRAR SESIÓN
  const handleLogout = () => {
    // Borramos las "llaves" del navegador
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
    
    // Redirigimos al Login y forzamos recarga para limpiar estados
    window.location.href = '/login';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        
        {/* --- LOGO Y TÍTULO --- */}
        <Link className="navbar-brand fw-bold" to="/">
            📅 EventosApp
        </Link>

        {/* --- BOTÓN HAMBURGUESA (Móvil) --- */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* --- ENLACES DEL MENÚ --- */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            
            {/* Enlace visible para todos */}
            <li className="nav-item">
              <Link className="nav-link" to="/">Inicio</Link>
            </li>

            {/* --- BLOQUE CONDICIONAL: ¿ESTÁ LOGUEADO? --- */}
            {token ? (
              /* SI HAY TOKEN (Usuario Conectado) mostramos esto: */
              <>
                <li className="nav-item">
                  <span className="nav-link text-warning">Hola, {userName}</span>
                </li>
                
                {/* Enlace al Dashboard General */}
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Mi Dashboard
                  </Link>
                </li>

                {/* Botón Crear Evento */}
                <li className="nav-item mx-2">
                  <Link className="btn btn-primary btn-sm" to="/create-event">
                    + Crear Evento
                  </Link>
                </li>

                {/* Botón Salir */}
                <li className="nav-item">
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-outline-danger btn-sm"
                  >
                    Salir
                  </button>
                </li>
              </>
            ) : (
              /* SI NO HAY TOKEN (Invitado) mostramos esto otro: */
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-light btn-sm ms-2" to="/register">
                    Registro
                  </Link>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;