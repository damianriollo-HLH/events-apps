import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  
  //Usamos 'auth_token' que es como lo guarda Login
  const token = localStorage.getItem('auth_token'); 
  
  //Usamos 'user_name' que es como lo guarda Login
  const userName = localStorage.getItem('user_name') || 'Usuario';

  const handleLogout = () => {
    // Al salir, borramos los nombres correctos
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
    
    // Redirigimos y recargamos
    window.location.href = '/login';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        {/* LOGO / NOMBRE DEL PROYECTO */}
        <Link className="navbar-brand fw-bold" to="/">
           📅 EventosApp
        </Link>

        {/* Botón hamburguesa para móviles */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* ENLACES DEL MENÚ */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            
            <li className="nav-item">
              <Link className="nav-link" to="/">Inicio</Link>
            </li>

            {/* SI HAY TOKEN (Usuario Logueado) */}
            {token ? (
              <>
                <li className="nav-item">
                  <span className="nav-link text-warning">Hola, {userName}</span>
                </li>
                
                {/* NUEVO BOTÓN DASHBOARD */}
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Mi Dashboard
                  </Link>
                </li>

                <li className="nav-item mx-2">
                  <Link className="btn btn-primary btn-sm" to="/create-event">
                    + Crear Evento
                  </Link>
                </li>
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
              /* SI NO HAY TOKEN (Invitado) */
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