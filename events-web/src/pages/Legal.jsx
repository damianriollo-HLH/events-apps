import { useParams, Navigate, Link } from 'react-router-dom';

/**
 * @component Legal
 * @description Vista dinámica para la visualización de documentos legales.
 * Emplea parámetros de ruta (URL params) para determinar qué contenido renderizar,
 * optimizando la reutilización de componentes y cumpliendo con el principio DRY.
 */
function Legal() {
  const { documentType } = useParams();

  /**
   * Diccionario de contenidos legales.
   * En un entorno de producción avanzado, estos datos podrían provenir de una API o un CMS.
   * @type {Object}
   */
  const contentMap = {
    privacidad: {
      title: 'Política de Privacidad',
      body: (
        <>
          <h5>1. Información que recopilamos</h5>
          <p className="text-secondary mb-4">
            Recopilamos información que nos proporcionas directamente al registrarte, como tu nombre y dirección de correo electrónico. También recopilamos datos de uso para mejorar la experiencia en la plataforma.
          </p>
          <h5>2. Uso de la información</h5>
          <p className="text-secondary mb-4">
            Utilizamos tus datos exclusivamente para gestionar tu cuenta, procesar tus inscripciones a eventos y enviarte notificaciones relevantes sobre la plataforma CaraLibre.
          </p>
          <h5>3. Protección de datos</h5>
          <p className="text-secondary">
            Aplicamos medidas de seguridad estándar de la industria para proteger tu información personal contra accesos no autorizados, alteraciones o destrucción.
          </p>
        </>
      )
    },
    cookies: {
      title: 'Política de Cookies',
      body: (
        <>
          <h5>1. ¿Qué son las cookies?</h5>
          <p className="text-secondary mb-4">
            Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo. Sirven para recordar tus preferencias y ofrecerte una experiencia de navegación continua.
          </p>
          <h5>2. Cookies que utilizamos</h5>
          <p className="text-secondary mb-4">
            En CaraLibre utilizamos cookies técnicas (esenciales para el inicio de sesión y la navegación) y cookies analíticas (para entender de forma anónima cómo se utiliza la plataforma).
          </p>
          <h5>3. Gestión de cookies</h5>
          <p className="text-secondary">
            Puedes configurar tu navegador para rechazar todas las cookies o para que te avise cuando se envíe una cookie. Sin embargo, algunas partes de la web pueden no funcionar correctamente sin ellas.
          </p>
        </>
      )
    },
    terminos: {
      title: 'Términos y Condiciones',
      body: (
        <>
          <h5>1. Aceptación de los términos</h5>
          <p className="text-secondary mb-4">
            Al acceder y utilizar CaraLibre, aceptas estar sujeto a estos términos y condiciones de uso. Si no estás de acuerdo con alguna parte, no debes utilizar nuestro servicio.
          </p>
          <h5>2. Creación de eventos</h5>
          <p className="text-secondary mb-4">
            Los organizadores son responsables de la veracidad de la información de los eventos publicados. CaraLibre se reserva el derecho de eliminar eventos que violen la legalidad o resulten ofensivos.
          </p>
          <h5>3. Responsabilidad</h5>
          <p className="text-secondary">
            CaraLibre actúa como intermediario tecnológico. No nos hacemos responsables de cancelaciones, cambios de aforo o incidencias durante el transcurso físico de los eventos publicados por terceros.
          </p>
        </>
      )
    }
  };

  if (!documentType || !contentMap[documentType]) {
    return <Navigate to="/legal/privacidad" replace />;
  }

  const currentContent = contentMap[documentType];

  return (
    <div className="container py-5">
      <div className="row g-4">
        
        <div className="col-lg-3">
          <div className="card shadow-sm border-0 rounded-4 bg-body sticky-top" style={{ top: '20px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4 text-body">Centro Legal</h5>
              <div className="d-flex flex-column gap-2">
                <Link 
                  to="/legal/privacidad" 
                  className={`btn text-start rounded-pill fw-bold ${documentType === 'privacidad' ? 'btn-primary' : 'btn-light text-secondary'}`}
                >
                  Privacidad
                </Link>
                <Link 
                  to="/legal/cookies" 
                  className={`btn text-start rounded-pill fw-bold ${documentType === 'cookies' ? 'btn-primary' : 'btn-light text-secondary'}`}
                >
                  Cookies
                </Link>
                <Link 
                  to="/legal/terminos" 
                  className={`btn text-start rounded-pill fw-bold ${documentType === 'terminos' ? 'btn-primary' : 'btn-light text-secondary'}`}
                >
                  Términos de Uso
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <div className="card shadow-sm border-0 rounded-4 bg-body h-100">
            <div className="card-body p-4 p-md-5">
              <h1 className="fw-bold mb-5 display-6 text-body">{currentContent.title}</h1>
              <div className="legal-content">
                {currentContent.body}
              </div>
              <hr className="my-5 opacity-25" />
              <p className="text-muted small text-center mb-0">
                Última actualización: Mayo de 2026. Para más detalles, visita nuestra sección de contacto.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Legal;