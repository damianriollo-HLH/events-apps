import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  // 1. Variables para guardar lo que escribe el usuario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  // Hook para redirigir
  const navigate = useNavigate();

  // 2. Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que se recargue la página
    setError(null);

    try {
      // Petición al Backend
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // ¡ÉXITO!
        console.log("Login correcto:", data);
        
        // --- GUARDAMOS LOS DATOS EN EL NAVEGADOR ---
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user_name', data.user.name);
        
        // Guardamos el ID para saber quiénes somos al borrar comentarios
        localStorage.setItem('user_id', data.user.id); 

        // Redirigimos a la página principal y recargamos para actualizar el menú
        window.location.href = '/';
      } else {
        // ERROR (Contraseña mal, etc.)
        setError(data.message || 'Error al iniciar sesión');
      }

    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 className="text-center mb-4">🔐 Iniciar Sesión</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input 
            type="email" 
            className="form-control" // estilo bootstrap 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Contraseña:</label>
          <input 
            type="password" 
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button type="submit" className="btn btn-success w-100" style={{ padding: '10px' }}>
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;