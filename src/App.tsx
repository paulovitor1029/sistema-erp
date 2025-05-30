import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './components/LoginPage';
import EstoquePage from './components/EstoquePage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Função para autenticar o usuário (qualquer login é válido)
  const handleAuthentication = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/estoque" /> : 
            <LoginPage onLogin={handleAuthentication} />
          } 
        />
        <Route 
          path="/estoque" 
          element={
            isAuthenticated ? 
            <EstoquePage /> : 
            <Navigate to="/" />
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
