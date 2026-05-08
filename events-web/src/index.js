// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';

// =========================================================
// SOLUCIÓN AL DISEÑO ROTO:
// 1. IMPORTAMOS BOOTSTRAP (Debe ir ANTES de tus propios estilos)
// =========================================================
import 'bootstrap/dist/css/bootstrap.min.css';
// (Opcional) Si en algún momento necesitas los JS de Bootstrap (para modales o dropdowns complejos)
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 

// 2. IMPORTAMOS TUS ESTILOS PERSONALIZADOS (App.css)
import './styles/main.scss'; 

// 3. IMPORTAMOS EL ENRUTADOR Y COMPONENTES
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 4. IMPORTAMOS NUESTRO CONTEXTO DE TEMA
import { ThemeProvider } from './context/ThemeProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();