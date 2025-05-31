import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: number;
  nome: string;
  email: string;
  nivelAcesso: 'admin' | 'gerente' | 'operador';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (minLevel: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Chave para armazenar o usuário no localStorage
const USER_STORAGE_KEY = 'erp_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    // Simulação de autenticação - em produção, isso seria uma chamada de API
    try {
      // Simulando um atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Qualquer credencial é aceita nesta versão inicial
      if (email && senha) {
        // Determinar o nível de acesso com base no email para fins de demonstração
        let nivelAcesso: 'admin' | 'gerente' | 'operador' = 'operador';
        
        if (email.includes('admin')) {
          nivelAcesso = 'admin';
        } else if (email.includes('gerente')) {
          nivelAcesso = 'gerente';
        }
        
        const newUser = {
          id: 1,
          nome: email.split('@')[0],
          email,
          nivelAcesso
        };
        
        // Salvar no estado
        setUser(newUser);
        setIsAuthenticated(true);
        
        // Persistir no localStorage
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const logout = () => {
    // Limpar estado
    setUser(null);
    setIsAuthenticated(false);
    
    // Remover do localStorage
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  // Verifica se o usuário tem permissão baseado no nível mínimo requerido
  const hasPermission = (minLevel: string): boolean => {
    if (!user) return false;
    
    const levels = {
      'admin': 3,
      'gerente': 2,
      'operador': 1
    };
    
    const userLevel = levels[user.nivelAcesso] || 0;
    const requiredLevel = levels[minLevel as keyof typeof levels] || 0;
    
    return userLevel >= requiredLevel;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
