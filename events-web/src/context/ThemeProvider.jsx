import { createContext, useState, useEffect } from 'react';

/**
 * =========================================================================
 * 1. CREACIÓN DEL CONTEXTO (El "canal de radio")
 * =========================================================================
 * Creamos y exportamos el contexto. Cualquier componente de la aplicación
 * (Navbar, Footer, EventCard...) podrá "sintonizar" este canal usando 
 * el hook useContext() para saber si la web está en modo claro u oscuro.
 */
export const ThemeContext = createContext();

/**
 * =========================================================================
 * 2. EL PROVEEDOR (La "antena" que transmite los datos)
 * =========================================================================
 * Este componente envolverá a toda nuestra aplicación (normalmente en App.jsx).
 * 'children' representa a todas las páginas y componentes que vivirán dentro.
 */
export const ThemeProvider = ({ children }) => {
  
  // -----------------------------------------------------------------------
  // A. ESTADO INICIAL (Lazy Initialization)
  // -----------------------------------------------------------------------
  // Usamos una función anónima () => {} dentro del useState. 
  // Esto hace que React solo lea el localStorage la primera vez que carga 
  // la página (montaje), mejorando el rendimiento.
  const [theme, setTheme] = useState(() => {
    // Si el usuario ya eligió un tema antes, lo recuperamos. Si no, por defecto 'light'.
    return localStorage.getItem('caralibre_theme') || 'light';
  });

  // -----------------------------------------------------------------------
  // B. EFECTO SECUNDARIO (Sincronización DOM y LocalStorage)
  // -----------------------------------------------------------------------
  // El useEffect "vigila" la variable 'theme'. Cada vez que cambia (de light a dark),
  // se ejecuta este bloque de código.
  useEffect(() => {
    // 1. Guardamos la nueva preferencia para que no se pierda al recargar la página.
    localStorage.setItem('caralibre_theme', theme);
    
    // 2. Magia de Bootstrap 5: Le inyectamos el atributo 'data-bs-theme' a 
    // la etiqueta principal <html>. Esto activa automáticamente los colores oscuros de Bootstrap.
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]); // Array de dependencias: Solo se ejecuta si 'theme' cambia.

  // -----------------------------------------------------------------------
  // C. FUNCIÓN CONTROLADORA
  // -----------------------------------------------------------------------
  // Alterna entre los dos modos. Usamos 'prevTheme' (estado previo) 
  // que es la forma más segura en React de actualizar un estado basándonos en el anterior.
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    /* Proveemos el valor actual del tema y la función para cambiarlo
       a todos los componentes hijos (children) de la aplicación. */
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};