import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  // Estados para guardar lo que escribe el usuario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  
  const [error, setError] = useState(null); // Para mostrar errores si fallan
  const navigate = useNavigate(); // Para redirigir al login al terminar

  // Función que se ejecuta cada vez que escribes en un input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Función al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpiamos errores previos

    try {
        // Petición al Backend de Laravel
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
            alert("¡Cuenta creada con éxito! Ahora inicia sesión.");
            navigate('/login'); // Redirigimos al Login
        } else {
            // Si hay error, mostramos el mensaje que manda Laravel
            setError(data.message || "Error al registrarse. Revisa los datos.");
        }
    } catch (err) {
        console.error(err);
        setError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
            <div className="card shadow border-0">
                <div className="card-body p-4">
                    <h2 className="card-title text-center mb-4">📝 Crear Cuenta</h2>
                    
                    {/* Mensaje de error si existe */}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Nombre completo</label>
                            <input 
                                type="text" name="name" className="form-control" 
                                placeholder="Ej: Juan Pérez"
                                onChange={handleChange} required 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Correo electrónico</label>
                            <input 
                                type="email" name="email" className="form-control" 
                                placeholder="nombre@correo.com"
                                onChange={handleChange} required 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Contraseña</label>
                            <input 
                                type="password" name="password" className="form-control" 
                                onChange={handleChange} required 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Confirmar Contraseña</label>
                            <input 
                                type="password" name="password_confirmation" className="form-control" 
                                onChange={handleChange} required 
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 btn-lg">
                            Registrarse
                        </button>
                    </form>
                    
                    <hr />
                    <p className="text-center mt-3">
                        ¿Ya tienes cuenta? <Link to="/login" className="fw-bold">Inicia sesión aquí</Link>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Register;