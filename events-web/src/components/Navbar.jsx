import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
// Aquí traemos el contexto exportado para el Modo Claro/Oscuro
import { ThemeContext } from '../context/ThemeProvider';

/**
 * =========================================================================
 * COMPONENTE: NAVBAR (Barra de Navegación Principal)
 * =========================================================================
 * ¿Para qué sirve?: Es el menú superior persistente. Controla la navegación,
 * el cambio de tema visual y muestra opciones dinámicas dependiendo de si 
 * el usuario ha iniciado sesión o no.
 */
function Navbar() {
  const navigate = useNavigate();
  
  // -----------------------------------------------------------------------
  // 1. ESTADO DE AUTENTICACIÓN (Lectura sincrónica)
  // -----------------------------------------------------------------------
  // Leemos del localStorage para saber quién está navegando.
  // En React, esto nos permite hacer "Renderizado Condicional" (mostrar
  // unos botones u otros según el estado).
  const token = localStorage.getItem('auth_token');
  const userName = localStorage.getItem('user_name');
  const rawImage = localStorage.getItem('user_image');  const userImage = (rawImage && rawImage !== 'null' && rawImage !== 'undefined' && rawImage !== '') ? rawImage : null;
  const isAdmin = localStorage.getItem('is_admin') === '1';

  // -----------------------------------------------------------------------
  // 2. CONTEXT API (Modo Oscuro/Claro)
  // -----------------------------------------------------------------------
  // Consumimos el contexto global. ThemeContext nos da el estado actual ('light'/'dark')
  // y la función para cambiarlo sin tener que pasar "props" por todos los componentes.
  const { theme, toggleTheme } = useContext(ThemeContext);

  // -----------------------------------------------------------------------
  // 3. CERRAR SESIÓN
  // -----------------------------------------------------------------------
  const handleLogout = () => {
    // Vaciamos la sesión de seguridad
    localStorage.clear();
    // TRUCO: Volvemos a guardar el tema para que al salir no se resetee el color de la web
    localStorage.setItem('caralibre_theme', theme); 
    // Redirigimos al Login usando el hook de React Router
    navigate('/login');
  };

  return (
    /* ESTILO BENTO:
      Envolvemos el navbar en un div con padding (pt-3 px-3 o px-md-5) para separarlo
      de los bordes absolutos de la pantalla. El sticky-top lo ponemos aquí.
    */
    <div className="sticky-top pt-3" style={{ zIndex: 1030 }}>
      <div className="container">
      <nav 
        className="navbar navbar-expand-lg navbar-dark shadow-lg rounded-4 py-3 px-4" 
        style={{ background: 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)', 
          backdropFilter: 'blur(10px)'}}
      >
        <div className="container-fluid">
          
          {/* LOGO (Funciona como botón de Inicio) */}
          <Link 
            to="/"
            className="navbar-brand py-0 m-0 d-flex align-items-center" 
            onClick={() => {
              // Si ya estamos en inicio y hacen clic, recargamos para refrescar eventos
              if (window.location.pathname === '/') window.location.reload();
            }}
          >
            <img 
              src="/img/logo.png" 
              alt="Logo CaraLibre" 
              style={{ 
                height: '100px', 
                objectFit: 'contain'
              }} 
            />
          </Link>

          {/* BOTÓN HAMBURGUESA (Para móviles) */}
          <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* CONTENIDO DEL NAVBAR (Colapsable en móviles) */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center gap-3">
              
              {/* BOTÓN MODO OSCURO / CLARO */}
              <li className="nav-item">
                <button 
                  onClick={toggleTheme} 
                  className="btn btn-link text-decoration-none fs-5 d-flex align-items-center justify-content-center"
                  style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }}
                  title={theme === 'light' ? 'Activar Modo Oscuro' : 'Activar Modo Claro'}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </li>

              {/* RENDERIZADO CONDICIONAL: ¿Está logueado? */}
              {!token ? (
                /* MOSTRAR ESTO SI NO HAY SESIÓN INICIADA */
                <>
                  <li className="nav-item">
                    <Link className="nav-link text-white fw-semibold" to="/login">Entrar</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="btn btn-light text-primary fw-bold rounded-pill px-4 shadow-sm" to="/register">Registrarse</Link>
                  </li>
                </>
              ) : (
                /* MOSTRAR ESTO SI EL USUARIO ESTÁ LOGUEADO */
                <>
                  <li className="nav-item">
                    <Link className="nav-link text-white fw-semibold" to="/dashboard">Mis Eventos</Link>
                  </li>
                  
                  {/* MENÚ DESPLEGABLE DEL USUARIO */}
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle d-flex align-items-center gap-2 text-white" href="#" role="button" data-bs-toggle="dropdown">
                      <img 
                        src={userImage || `https://ui-avatars.com/api/?name=${userName}&background=random`} 
                        alt="Avatar" 
                        className="rounded-circle border border-2 border-white shadow-sm"
                        style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                      />
                      <span className="fw-semibold">{userName}</span>
                    </a>
                    
                    {/* Estilo Bento también en el menú desplegable */}
                    <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-2" style={{ borderRadius: '15px' }}>
                      <li><Link className="dropdown-item py-2 rounded-3" to="/profile">👤 Mi Perfil</Link></li>
                      
                      {/* RENDERIZADO CONDICIONAL DE ADMINISTRADOR */}
                      {isAdmin && (
                        <>
                          <li><Link className="dropdown-item py-2 fw-bold text-danger rounded-3" to="/admin">👑 Panel Admin</Link></li>
                          <li><Link className="dropdown-item py-2 rounded-3" to="/admin/categories">📂 Categorías</Link></li>
                        </>
                      )}
                      
                      <li><Link className="dropdown-item py-2 rounded-3" to="/dashboard">📊 Dashboard</Link></li>
                      <li><Link className="dropdown-item py-2 rounded-3" to="/create-event">✨ Crear Evento</Link></li>
                      <li><hr className="dropdown-divider my-2" /></li>
                      <li>
                        <button className="dropdown-item py-2 text-danger fw-bold rounded-3" onClick={handleLogout}>
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
      </div>
    </div>
  );
}

export default Navbar;