import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast'; // Librería para alertas visuales bonitas

/**
 * =========================================================================
 * COMPONENTE: ABOUT / CONTACT (Quiénes Somos y Contacto)
 * =========================================================================
 * ¿Para qué sirve?: Es una vista mixta. Mitad informativa (sobre la app) 
 * y mitad interactiva (formulario de contacto). 
 * Demuestra el uso de "Componentes Controlados" en React y simulación de red.
 */
function AboutContact() {
  // -----------------------------------------------------------------------
  // 1. ESTADOS DEL FORMULARIO (Componentes Controlados)
  // -----------------------------------------------------------------------
  // Agrupamos todos los campos en un solo objeto para no tener 4 useStates separados.
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });

  // Estado para la Experiencia de Usuario (UX): Evita doble clic al enviar
  const [enviando, setEnviando] = useState(false);

  /**
   * -----------------------------------------------------------------------
   * 2. MANEJADOR DE CAMBIOS (Input Handler)
   * -----------------------------------------------------------------------
   * Esta función es mágica. Sirve para TODOS los inputs a la vez.
   */
  const manejarCambio = (e) => {
    setFormData({
      ...formData, // Spread Operator: Copia todo lo que ya estaba escrito
      // Computa dinámicamente el nombre del input y actualiza su valor
      [e.target.name]: e.target.value 
    });
  };

  /**
   * -----------------------------------------------------------------------
   * 3. MANEJADOR DE ENVÍO (Submit Handler)
   * -----------------------------------------------------------------------
   */
  const enviarFormulario = async (e) => {
    e.preventDefault(); // Evita que la página se recargue (comportamiento de SPA)
    setEnviando(true);  // Desactiva el botón

    // Simulamos una petición de red al Backend (Ficticia) para mejorar la UX.
    // En un proyecto real, aquí iría un axios.post() hacia Laravel.
    setTimeout(() => {
      // Feedback visual
      toast.success('¡Mensaje enviado con éxito! Te responderemos pronto.');
      // Reseteamos el formulario vaciando el estado
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
      // Volvemos a activar el botón
      setEnviando(false);
    }, 1500); // Tarda 1.5 segundos en ejecutarse
  };

  return (
    <div className="container py-5">
      <div className="row g-4">
        
        {/* --- SECCIÓN 1: QUIÉNES SOMOS (ESTILO BENTO) --- */}
        <div className="col-lg-6">
            <div className="bento-card p-4 p-md-5 h-100 bg-body border-0 shadow-sm rounded-4 position-relative overflow-hidden">
                {/* Decoración visual de fondo */}
                <div className="position-absolute top-0 end-0 opacity-10" style={{ fontSize: '10rem', transform: 'translate(20%, -20%)' }}>👋</div>
                
                <h2 className="fw-bold mb-4 display-5">Sobre <span className="text-primary">CaraLibre</span></h2>
                <p className="fs-5 text-secondary mb-4">
                    Nacimos con una misión clara: conectar a las personas a través de experiencias reales. En un mundo cada vez más digital, creemos que los eventos presenciales son el corazón de la comunidad.
                </p>
                
                <div className="row g-3">
                    <div className="col-6">
                        <div className="p-3 border border-primary border-opacity-10 rounded-4 bg-primary bg-opacity-10">
                            <h4 className="fw-bold text-primary m-0">+500</h4>
                            <small className="text-body-secondary fw-bold">Eventos creados</small>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="p-3 border border-success border-opacity-10 rounded-4 bg-success bg-opacity-10">
                            <h4 className="fw-bold text-success m-0">100%</h4>
                            <small className="text-body-secondary fw-bold">Gratuito para usuarios</small>
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <h5 className="fw-bold mb-3">Nuestros Valores</h5>
                    <ul className="list-unstyled d-flex flex-column gap-2 text-secondary">
                        <li>✅ <strong>Transparencia:</strong> Sin costes ocultos ni comisiones.</li>
                        <li>🚀 <strong>Innovación:</strong> Herramientas modernas para organizadores.</li>
                        <li>❤️ <strong>Comunidad:</strong> El usuario siempre es el protagonista.</li>
                    </ul>
                </div>
            </div>
        </div>

        {/* --- SECCIÓN 2: CONTACTO (FORMULARIO CONTROLADO) --- */}
        <div className="col-lg-6">
            <div className="bento-card p-4 p-md-5 h-100 bg-body border-0 shadow-sm rounded-4">
                <h2 className="fw-bold mb-2">Contáctanos</h2>
                <p className="text-secondary mb-4">¿Tienes alguna duda o sugerencia? Escríbenos directamente.</p>

                <form onSubmit={enviarFormulario}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">Nombre</label>
                            <input 
                                type="text" 
                                name="nombre"
                                className="form-control rounded-3" 
                                value={formData.nombre}     // React controla lo que se ve
                                onChange={manejarCambio}    // React controla lo que se escribe
                                required 
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">Email</label>
                            <input 
                                type="email" 
                                name="email"
                                className="form-control rounded-3" 
                                value={formData.email}
                                onChange={manejarCambio}
                                required 
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label small fw-bold">Asunto</label>
                            <input 
                                type="text" 
                                name="asunto"
                                className="form-control rounded-3" 
                                value={formData.asunto}
                                onChange={manejarCambio}
                                required 
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label small fw-bold">Mensaje</label>
                            <textarea 
                                name="mensaje"
                                className="form-control rounded-3" 
                                rows="4" 
                                value={formData.mensaje}
                                onChange={manejarCambio}
                                required
                                style={{ resize: 'none' }}
                            ></textarea>
                        </div>
                        <div className="col-12 mt-4">
                            {/* BOTÓN REACTIVO: Cambia su estado según 'enviando' */}
                            <button 
                                type="submit" 
                                className="btn btn-primary w-100 py-3 fw-bold rounded-pill shadow-sm"
                                disabled={enviando}
                            >
                                {enviando ? 'Enviando mensaje...' : '🚀 Enviar Mensaje'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
}

export default AboutContact;