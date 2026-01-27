import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  // 1. Variables para guardar lo que escribe el usuario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  // Hook para redirigir al usuario cuando haga login
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
          'Content-Type': 'application/json', // Importante: Decimos que enviamos JSON
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // ¡ÉXITO!
        console.log("Login correcto:", data);
        
        // Guardamos el TOKEN en la memoria del navegador (localStorage)
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user_name', data.user.name);

        // Redirigimos a la página principal
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
      <h2>🔐 Iniciar Sesión</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input 
            type="email" 
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', background: 'green', color: 'white', border: 'none', cursor: 'pointer' }}>
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;