import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
      <div className="container text-center text-md-start">
        <div className="row text-center text-md-start">
          
          {/* COLUMNA 1: INFO */}
          <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 fw-bold text-warning">CaraLibre</h5>
            <p>
              La mejor plataforma para descubrir, crear y compartir eventos únicos. 
              Únete a nuestra comunidad y vive experiencias inolvidables.
            </p>
          </div>

          {/* COLUMNA 2: ENLACES */}
          <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 fw-bold">Explora</h5>
            <p><Link to="/" className="text-white text-decoration-none">Inicio</Link></p>
            <p><Link to="/about" className="text-white text-decoration-none">Quiénes Somos / Contacto</Link></p>
            <p><Link to="/login" className="text-white text-decoration-none">Ingresar</Link></p>
          </div>

          {/* COLUMNA 3: LEGALES */}
          <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4 fw-bold">Legal</h5>
            <p><Link to="/legal/privacidad" className="text-white text-decoration-none">Política de Privacidad</Link></p>
            <p><Link to="/legal/cookies" className="text-white text-decoration-none">Política de Cookies</Link></p>
            <p><Link to="/legal/terminos" className="text-white text-decoration-none">Términos de Uso</Link></p>
          </div>

          {/* COLUMNA 4: CONTACTO */}
          <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 fw-bold">Contacto</h5>
            <p><i className="fas fa-home mr-3"></i> Aspe, España</p>
            <p><i className="fas fa-envelope mr-3"></i> damianriollo@gmail.com</p>
            <p><i className="fas fa-phone mr-3"></i> +34 698 917 994</p>
          </div>
        </div>

        <hr className="mb-4" />

        <div className="row align-items-center">
          <div className="col-md-7 col-lg-8">
            <p>© {new Date().getFullYear()} <strong>CaraLibre</strong>. Todos los derechos reservados.</p>
          </div>
          <div className="col-md-5 col-lg-4">
            <div className="text-center text-md-right">
              {/* Iconos sociales falsos para decorar */}
              <ul className="list-unstyled list-inline">
                <li className="list-inline-item"><a href="#" className="btn-floating btn-sm text-white" style={{fontSize: '23px'}}>🌐</a></li>
                <li className="list-inline-item"><a href="#" className="btn-floating btn-sm text-white" style={{fontSize: '23px'}}>📸</a></li>
                <li className="list-inline-item"><a href="#" className="btn-floating btn-sm text-white" style={{fontSize: '23px'}}>🐦</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;