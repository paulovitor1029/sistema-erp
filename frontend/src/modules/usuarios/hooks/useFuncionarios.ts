import { useState, useEffect } from 'react';

export interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: string;
  salario: number;
  dataAdmissao: string;
  dataDemissao?: string;
  horarioEntrada: string;
  horarioSaida: string;
  ativo: boolean;
  nivelAcesso: 'admin' | 'gerente' | 'operador';
  foto?: string;
  observacoes?: string;
}

export const useFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFuncionarios = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Inicializa com array vazio em vez de dados mockados
      setFuncionarios([]);
    } catch (err) {
      setError('Erro ao carregar funcionários');
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarFuncionario = async (funcionario: Omit<Funcionario, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const novoFuncionario = {
        ...funcionario,
        id: Math.max(...funcionarios.map(f => f.id), 0) + 1
      };
      
      setFuncionarios([...funcionarios, novoFuncionario]);
      return novoFuncionario;
    } catch (err) {
      setError('Erro ao adicionar funcionário');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarFuncionario = async (id: number, funcionario: Partial<Funcionario>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFuncionarios(funcionarios.map(f => 
        f.id === id ? { ...f, ...funcionario } : f
      ));
      
      return true;
    } catch (err) {
      setError('Erro ao atualizar funcionário');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const excluirFuncionario = async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFuncionarios(funcionarios.filter(f => f.id !== id));
      
      return true;
    } catch (err) {
      setError('Erro ao excluir funcionário');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const alterarStatusFuncionario = async (id: number, ativo: boolean) => {
    return atualizarFuncionario(id, { ativo });
  };

  const getFuncionarioPorId = (id: number) => {
    return funcionarios.find(f => f.id === id) || null;
  };

  const getFuncionariosPorCargo = (cargo: string) => {
    return funcionarios.filter(f => f.cargo === cargo);
  };

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  return {
    funcionarios,
    isLoading,
    error,
    adicionarFuncionario,
    atualizarFuncionario,
    excluirFuncionario,
    alterarStatusFuncionario,
    getFuncionarioPorId,
    getFuncionariosPorCargo,
    recarregarFuncionarios: fetchFuncionarios
  };
};
