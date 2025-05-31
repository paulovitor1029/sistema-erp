import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'gerente' | 'operador';
  nome: string;
}

export interface LoginService {
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

// Serviço de autenticação sem dados mockados
const authService: LoginService = {
  login: async (username: string, password: string) => {
    // Simulando uma chamada de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Qualquer credencial é aceita nesta versão inicial
    // Determina o nível de acesso com base no email para fins de demonstração
    let role: 'admin' | 'gerente' | 'operador' = 'operador';
    
    if (username.includes('admin')) {
      role = 'admin';
    } else if (username.includes('gerente')) {
      role = 'gerente';
    }
    
    return {
      id: '1',
      username,
      role,
      nome: username.split('@')[0] || 'Usuário'
    };
  },
  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Lógica de logout será implementada com backend real
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await authService.login(username, password);
      setUser(user);
      return user;
    } catch (err) {
      setError('Falha na autenticação');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      setError('Erro ao fazer logout');
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
};
