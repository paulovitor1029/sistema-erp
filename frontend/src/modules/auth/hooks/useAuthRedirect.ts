import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Hook personalizado para gerenciar autenticação e redirecionamento
export const useAuthRedirect = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Se o usuário estiver autenticado e estiver na página de login, redireciona para a página inicial
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/', { replace: true });
    }
    
    // Se o usuário não estiver autenticado e não estiver na página de login, redireciona para o login
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return { isAuthenticated };
};
