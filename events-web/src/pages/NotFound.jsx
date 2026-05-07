import { Link } from 'react-router-dom';

/**
 * @component NotFound
 * @description Página de error 404. 
 * Proporciona una salida elegante al usuario cuando intenta acceder a una ruta inexistente.
 */
function NotFound() {
  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="text-center bento-card p-5 shadow-lg border-0 rounded-4 bg-body">
        <div className="display-1 fw-bold text-primary mb-2">404</div>
        <div className="fs-1 mb-4">🕵️‍♂️</div>
        <h1 className="fw-bold mb-3 text-body">¡Vaya! Te has perdido</h1>
        <p className="text-body-secondary mb-5 fs-5">
          La página que buscas no existe o ha sido movida a otro evento. <br />
          ¡No te preocupes, la fiesta sigue en la página principal!
        </p>
        <Link to="/" className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-sm hover-effect">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

export default NotFound;