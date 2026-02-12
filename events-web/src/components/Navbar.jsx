import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token');
  const userName = localStorage.getItem('user_name');
  // Recuperamos la imagen si existe (si no, null)
  const userImage = localStorage.getItem('user_image');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    // Usamos un estilo en línea para el degradado o una clase CSS
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" 
         style={{ background: 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)' }}>
      <div className="container">
        {/* LOGO */}
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <span style={{ fontSize: '1.5rem' }}>🎟️</span> 
          <span>CaraLibre</span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            
            <li className="nav-item">
              <Link className="nav-link text-white" to="/">Inicio</Link>
            </li>

            {!token ? (
              // SI NO ESTÁS LOGUEADO
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/login">Entrar</Link>
                </li>
                <li className="nav-item ms-2">
                  <Link className="btn btn-light text-primary fw-bold" to="/register">Registrarse</Link>
                </li>
              </>
            ) : (
              // SI ESTÁS LOGUEADO
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/dashboard">Mis Eventos</Link>
                </li>
                
                {/* MENÚ DE USUARIO CON FOTO */}
                <li className="nav-item dropdown ms-3">
                  <a className="nav-link dropdown-toggle d-flex align-items-center gap-2 text-white" href="#" role="button" data-bs-toggle="dropdown">
                    <img 
                        src={userImage || `https://ui-avatars.com/api/?name=${userName}&background=random`} 
                        alt="Avatar" 
                        className="rounded-circle border border-2 border-white"
                        style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                    />
                    <span>{userName}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                    <li><Link className="dropdown-item" to="/profile">👤 Mi Perfil</Link></li>
                    <li><Link className="dropdown-item" to="/dashboard">📊 Dashboard</Link></li>
                    <li><Link className="dropdown-item" to="/create-event">✨ Crear Evento</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                            🚪 Cerrar Sesión
                        </button>
                    </li>
                  </ul>
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