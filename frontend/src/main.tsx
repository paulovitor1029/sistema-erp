import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Verificar se as variáveis de ambiente estão sendo carregadas corretamente
console.log('Ambiente:', import.meta.env.MODE);
console.log('API URL:', import.meta.env.VITE_API_URL);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
