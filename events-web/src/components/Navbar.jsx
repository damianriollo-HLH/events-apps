import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
//Aquí traemos el contexto exportado
import { ThemeContext } from '../context/ThemeProvider';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token');
  const userName = localStorage.getItem('user_name');
  const userImage = localStorage.getItem('user_image');
  const isAdmin = localStorage.getItem('is_admin') === '1';

  // Consumimos el contexto. Si ThemeContext no es undefined, esto funcionará perfecto.
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    localStorage.clear();
    localStorage.setItem('caralibre_theme', theme); 
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top" 
         style={{ 
             background: 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)',
             zIndex: 1030 
         }}>
      <div className="container">
        
        <Link 
          to="/"
          className="navbar-brand py-0 m-0 d-flex align-items-center" 
          onClick={() => {
            if (window.location.pathname === '/') window.location.reload();
          }}
          >
          <img 
              src="/img/logo.png" 
              alt="Logo CaraLibre" 
              style={{ 
                  height: '45px', 
                  objectFit: 'contain',
                  transform: 'scale(3.5)', 
                  transformOrigin: 'left center',
                  marginLeft: '0px'
              }} 
          />
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            
            <li className="nav-item">
              <Link 
                  to="/" 
                  className="nav-link text-white fw-semibold"
                  onClick={() => {
                      if (window.location.pathname === '/') window.location.reload();
                  }}
              >Inicio
              </Link>
            </li>

            {/* BOTÓN MODO OSCURO */}
            <li className="nav-item ms-2 me-2">
              <button 
                onClick={toggleTheme} 
                className="btn btn-link text-decoration-none fs-5 d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }}
                title={theme === 'light' ? 'Activar Modo Oscuro' : 'Activar Modo Claro'}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </li>

            {!token ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white fw-semibold" to="/login">Entrar</Link>
                </li>
                <li className="nav-item ms-2">
                  <Link className="btn btn-light text-primary fw-bold rounded-pill px-4" to="/register">Registrarse</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white fw-semibold" to="/dashboard">Mis Eventos</Link>
                </li>
                
                <li className="nav-item dropdown ms-3">
                  <a className="nav-link dropdown-toggle d-flex align-items-center gap-2 text-white" href="#" role="button" data-bs-toggle="dropdown">
                    <img 
                        src={userImage || `https://ui-avatars.com/api/?name=${userName}&background=random`} 
                        alt="Avatar" 
                        className="rounded-circle border border-2 border-white shadow-sm"
                        style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                    />
                    <span className="fw-semibold">{userName}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0" style={{ borderRadius: '15px' }}>
                    <li><Link className="dropdown-item py-2" to="/profile">👤 Mi Perfil</Link></li>
                    {/* FILTRO DE SEGURIDAD VISUAL */}
                    {isAdmin && (
                        <>
                            <li><Link className="dropdown-item py-2 fw-bold text-danger" to="/admin">👑 Panel Admin</Link></li>
                            <li><Link className="dropdown-item py-2" to="/admin/categories">📂 Categorías</Link></li>
                        </>
                    )}
                    <li><Link className="dropdown-item py-2" to="/dashboard">📊 Dashboard</Link></li>
                    <li><Link className="dropdown-item py-2" to="/create-event">✨ Crear Evento</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                        <button className="dropdown-item py-2 text-danger fw-bold" onClick={handleLogout}>
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