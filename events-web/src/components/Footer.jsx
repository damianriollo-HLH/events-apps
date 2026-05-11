import { Link } from 'react-router-dom';

/**
 * =========================================================================
 * COMPONENTE: FOOTER (Pie de Página Estilo Bento)
 * =========================================================================
 * ¿Para qué sirve?: Muestra información legal, enlaces de navegación secundarios
 * y contacto. Diseñado como una "tarjeta flotante" para mantener coherencia 
 * visual con el Navbar.
 */
function Footer() {
  return (
    /* 1. ENVOLTURA EXTERIOR: 
      - mt-auto: Empuja el footer hacia abajo del todo si la página tiene poco contenido.
      - pb-4: Le da un margen inferior para que no toque el borde del navegador y flote.
    */
    <div className="mt-auto pb-4">
      
      {/* 2. CONTENEDOR ALINEADOR: Hace que la "caja" mida lo mismo que tu Navbar y el contenido principal */}
      <div className="container">
        
        {/* 3. LA CAJA BENTO: Fondo oscuro, bordes muy redondeados (rounded-4), sombra y padding interior (px-4) */}
        <footer className="bg-dark text-white pt-5 pb-4 px-4 rounded-4 shadow-lg">
          
          {/* container-fluid aquí dentro para que el contenido use todo el espacio de la caja Bento */}
          <div className="container-fluid text-center text-md-start">
            <div className="row text-center text-md-start">
              
              {/* COLUMNA 1: INFO DE LA MARCA */}
              <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                <h5 className="text-uppercase mb-4 fw-bold text-warning">CaraLibre</h5>
                <p>
                  La mejor plataforma para descubrir, crear y compartir eventos únicos. 
                  Únete a nuestra comunidad y vive experiencias inolvidables.
                </p>
              </div>

              {/* COLUMNA 2: ENLACES RÁPIDOS */}
              <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                <h5 className="text-uppercase mb-4 fw-bold">Explora</h5>
                <p><Link to="/about" className="text-white text-decoration-none">Quiénes Somos / Contacto</Link></p>
                <p><Link to="/login" className="text-white text-decoration-none">Ingresar</Link></p>
              </div>

              {/* COLUMNA 3: LEGALES */}
              <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3">
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

            {/* LÍNEA DIVISORIA */}
            <hr className="mb-4 border-secondary" />

            {/* ZONA INFERIOR: COPYRIGHT Y REDES SOCIALES */}
            <div className="row align-items-center">
              <div className="col-md-7 col-lg-8">
                {/* Generamos el año de forma dinámica con JS para que nunca quede desactualizado */}
                <p className="mb-0">© {new Date().getFullYear()} <strong>CaraLibre</strong>. Todos los derechos reservados.</p>
              </div>
              <div className="col-md-5 col-lg-4">
                <div className="text-center text-md-end mt-3 mt-md-0">
                  {/* Iconos sociales falsos para decorar */}
                  <ul className="list-unstyled list-inline mb-0">
                    <li className="list-inline-item"><a href="#" className="btn-floating btn-sm text-white text-decoration-none" style={{fontSize: '23px'}}>🌐</a></li>
                    <li className="list-inline-item"><a href="#" className="btn-floating btn-sm text-white text-decoration-none" style={{fontSize: '23px'}}>📸</a></li>
                    <li className="list-inline-item"><a href="#" className="btn-floating btn-sm text-white text-decoration-none" style={{fontSize: '23px'}}>🐦</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Footer;