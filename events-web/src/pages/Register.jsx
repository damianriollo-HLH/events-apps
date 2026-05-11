import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * =========================================================================
 * COMPONENTE: REGISTER (Creación de cuenta)
 * =========================================================================
 * ¿Para qué sirve?: Permite a un nuevo usuario registrarse en la plataforma.
 * Envía los datos a Laravel, que los valida, crea el usuario, encripta la 
 * contraseña y devuelve una respuesta de éxito.
 */
function Register() {
  // -----------------------------------------------------------------------
  // 1. ESTADOS DEL FORMULARIO (Componentes Controlados)
  // -----------------------------------------------------------------------
  // Agrupamos todos los campos en un solo objeto para simplificar el código
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '' // Laravel exige este nombre exacto para validar contraseñas
  });
  
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(false); // Feedback visual para evitar doble clic
  const navigate = useNavigate(); 

  // -----------------------------------------------------------------------
  // 2. MANEJADOR DE CAMBIOS (Input Dinámico)
  // -----------------------------------------------------------------------
  const handleChange = (e) => {
    setFormData({
      ...formData, // Spread Operator: Mantiene los datos que ya estaban escritos
      [e.target.name]: e.target.value // Actualiza solo el input que está escribiendo el usuario
    });
  };

  // -----------------------------------------------------------------------
  // 3. ENVÍO DEL FORMULARIO (Petición a la API)
  // -----------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    setLoading(true);

    try {
        const response = await fetch('http://127.0.0.1:8000/api/register', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Sustituimos el alert() por un Toast moderno
            toast.success("¡Cuenta creada con éxito! Ahora inicia sesión.", {
                style: { borderRadius: '10px', background: '#1f2229', color: '#f8fafc' }
            });
            navigate('/login'); 
        } else {
            // Laravel nos enviará sus errores de validación (ej: "El email ya existe")
            setError(data.message || "Error al registrarse. Revisa los datos.");
        }
    } catch (err) {
        console.error(err);
        setError("Error de conexión con el servidor");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', padding: '40px 0' }}>
      {/* TARJETA BENTO */}
      <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5 bg-body w-100" style={{ maxWidth: '500px' }}>
        
        <div className="text-center mb-4">
            <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <span className="fs-1">📝</span>
            </div>
            <h2 className="fw-bold text-body">Crear Cuenta</h2>
            <p className="text-body-secondary">Únete a la comunidad CaraLibre</p>
        </div>

        {/* Mensaje de error de validación */}
        {error && (
            <div className="alert alert-danger rounded-3 fw-bold text-center border-0 shadow-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label fw-bold small text-body-secondary">Nombre completo</label>
                <input 
                    type="text" 
                    name="name" 
                    className="form-control form-control-lg bg-body-tertiary border-secondary-subtle rounded-3" 
                    placeholder="Ej: Juan Pérez"
                    value={formData.name}
                    onChange={handleChange} 
                    required 
                />
            </div>
            
            <div className="mb-3">
                <label className="form-label fw-bold small text-body-secondary">Correo electrónico</label>
                <input 
                    type="email" 
                    name="email" 
                    className="form-control form-control-lg bg-body-tertiary border-secondary-subtle rounded-3" 
                    placeholder="nombre@correo.com"
                    value={formData.email}
                    onChange={handleChange} 
                    autoComplete="username" 
                    required 
                />
            </div>
            
            <div className="mb-3">
                <label className="form-label fw-bold small text-body-secondary">Contraseña</label>
                <input 
                    type="password" 
                    name="password" 
                    className="form-control form-control-lg bg-body-tertiary border-secondary-subtle rounded-3" 
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={handleChange} 
                    autoComplete="new-password" 
                    required 
                />
            </div>
            
            <div className="mb-4">
                <label className="form-label fw-bold small text-body-secondary">Confirmar Contraseña</label>
                <input 
                    type="password" 
                    name="password_confirmation" 
                    className="form-control form-control-lg bg-body-tertiary border-secondary-subtle rounded-3" 
                    placeholder="Repite tu contraseña"
                    value={formData.password_confirmation}
                    onChange={handleChange} 
                    autoComplete="new-password" 
                    required 
                />
            </div>
            
            <button type="submit" className="btn btn-primary w-100 btn-lg rounded-pill fw-bold shadow-sm" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
        </form>
        
        <div className="text-center mt-4 pt-3 border-top border-secondary-subtle">
            <p className="text-body-secondary small m-0">
                ¿Ya tienes cuenta? <Link to="/login" className="fw-bold text-primary text-decoration-none">Inicia sesión aquí</Link>
            </p>
        </div>

      </div>
    </div>
  );
}

export default Register;