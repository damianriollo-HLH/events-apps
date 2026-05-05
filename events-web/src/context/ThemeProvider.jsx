import { createContext, useState, useEffect } from 'react';

// =========================================================
// 1. EXPORTAMOS EL CONTEXTO (El "canal de radio")
// =========================================================
export const ThemeContext = createContext();

// =========================================================
// 2. EXPORTAMOS EL PROVEEDOR (El componente que envuelve la app)
// =========================================================
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('caralibre_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('caralibre_theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};