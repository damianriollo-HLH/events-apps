import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * @component AboutContact
 * @description Vista informativa sobre la plataforma y formulario de contacto.
 * Implementa gestión de estados para el formulario y feedback visual mediante toasts.
 */
function AboutContact() {
  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });

  const [enviando, setEnviando] = useState(false);

  /**
   * Actualiza el estado local cuando el usuario escribe en los inputs.
   */
  const manejarCambio = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Simula el envío del formulario al backend.
   * Aplica validaciones básicas y feedback asíncrono.
   */
  const enviarFormulario = async (e) => {
    e.preventDefault();
    setEnviando(true);

    // Simulamos una demora de red (Petición Fetch ficticia)
    setTimeout(() => {
      toast.success('¡Mensaje enviado con éxito! Te responderemos pronto.');
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
      setEnviando(false);
    }, 1500);
  };

  return (
    <div className="container py-5">
      <div className="row g-4">
        
        {/* --- SECCIÓN: QUIÉNES SOMOS (ESTILO BENTO) --- */}
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

        {/* --- SECCIÓN: CONTACTO (FORMULARIO INTERACTIVO) --- */}
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
                                value={formData.nombre}
                                onChange={manejarCambio}
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