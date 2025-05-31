import { useState, useEffect } from 'react';

export interface Usuario {
  id: number;
  nome: string;
  username: string;
  email: string;
  cargo: string;
  nivel: 'admin' | 'gerente' | 'operador';
  ativo: boolean;
  dataCadastro: string;
  ultimoAcesso?: string;
}

// Mock do serviço de usuários - será substituído por implementação real
const mockUsuarios: Usuario[] = [
  {
    id: 1,
    nome: 'Administrador',
    username: 'admin',
    email: 'admin@sistema.com',
    cargo: 'Administrador de Sistema',
    nivel: 'admin',
    ativo: true,
    dataCadastro: '2025-01-01T00:00:00'
  },
  {
    id: 2,
    nome: 'Gerente Comercial',
    username: 'gerente',
    email: 'gerente@sistema.com',
    cargo: 'Gerente Comercial',
    nivel: 'gerente',
    ativo: true,
    dataCadastro: '2025-01-02T00:00:00'
  },
  {
    id: 3,
    nome: 'Operador de Caixa',
    username: 'caixa',
    email: 'caixa@sistema.com',
    cargo: 'Operador de Caixa',
    nivel: 'operador',
    ativo: true,
    dataCadastro: '2025-01-03T00:00:00'
  }
];

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsuarios(mockUsuarios);
    } catch (err) {
      setError('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarUsuario = async (usuario: Omit<Usuario, 'id' | 'dataCadastro' | 'ultimoAcesso'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const novoUsuario = {
        ...usuario,
        id: Math.max(...usuarios.map(u => u.id), 0) + 1,
        dataCadastro: new Date().toISOString()
      };
      
      setUsuarios([...usuarios, novoUsuario as Usuario]);
      return novoUsuario;
    } catch (err) {
      setError('Erro ao adicionar usuário');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarUsuario = async (id: number, usuario: Partial<Usuario>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsuarios(usuarios.map(u => 
        u.id === id ? { ...u, ...usuario } : u
      ));
      
      return true;
    } catch (err) {
      setError('Erro ao atualizar usuário');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const alterarStatusUsuario = async (id: number, ativo: boolean) => {
    return atualizarUsuario(id, { ativo });
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return {
    usuarios,
    isLoading,
    error,
    adicionarUsuario,
    atualizarUsuario,
    alterarStatusUsuario,
    recarregarUsuarios: fetchUsuarios
  };
};
