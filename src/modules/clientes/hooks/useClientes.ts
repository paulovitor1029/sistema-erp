import { useState, useEffect } from 'react';

export interface Cliente {
  id: number;
  nome: string;
  tipo: 'fisica' | 'juridica';
  cpfCnpj: string;
  email: string;
  telefone: string;
  celular?: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  dataCadastro: string;
  dataUltimaCompra?: string;
  valorTotalCompras: number;
  pontosFidelidade: number;
  observacoes?: string;
  ativo: boolean;
}

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Inicializa com array vazio em vez de dados mockados
      setClientes([]);
    } catch (err) {
      setError('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarCliente = async (cliente: Omit<Cliente, 'id' | 'dataCadastro' | 'valorTotalCompras' | 'pontosFidelidade'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const novoCliente: Cliente = {
        ...cliente,
        id: Math.max(...clientes.map(c => c.id), 0) + 1,
        dataCadastro: new Date().toISOString(),
        valorTotalCompras: 0,
        pontosFidelidade: 0
      };
      
      setClientes([...clientes, novoCliente]);
      return novoCliente;
    } catch (err) {
      setError('Erro ao adicionar cliente');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarCliente = async (id: number, cliente: Partial<Cliente>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setClientes(clientes.map(c => 
        c.id === id ? { ...c, ...cliente } : c
      ));
      
      return true;
    } catch (err) {
      setError('Erro ao atualizar cliente');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const excluirCliente = async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setClientes(clientes.filter(c => c.id !== id));
      
      return true;
    } catch (err) {
      setError('Erro ao excluir cliente');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const alterarStatusCliente = async (id: number, ativo: boolean) => {
    return atualizarCliente(id, { ativo });
  };

  const getClientePorId = (id: number) => {
    return clientes.find(c => c.id === id) || null;
  };

  const getClientePorCpfCnpj = (cpfCnpj: string) => {
    return clientes.find(c => c.cpfCnpj === cpfCnpj) || null;
  };

  const adicionarPontosFidelidade = async (id: number, pontos: number) => {
    const cliente = getClientePorId(id);
    
    if (!cliente) {
      setError('Cliente não encontrado');
      return false;
    }
    
    return atualizarCliente(id, { 
      pontosFidelidade: cliente.pontosFidelidade + pontos 
    });
  };

  const registrarCompra = async (id: number, valorCompra: number) => {
    const cliente = getClientePorId(id);
    
    if (!cliente) {
      setError('Cliente não encontrado');
      return false;
    }
    
    // Calcular pontos de fidelidade (1 ponto a cada R$ 10,00)
    const pontos = Math.floor(valorCompra / 10);
    
    return atualizarCliente(id, {
      valorTotalCompras: cliente.valorTotalCompras + valorCompra,
      pontosFidelidade: cliente.pontosFidelidade + pontos,
      dataUltimaCompra: new Date().toISOString()
    });
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return {
    clientes,
    isLoading,
    error,
    adicionarCliente,
    atualizarCliente,
    excluirCliente,
    alterarStatusCliente,
    getClientePorId,
    getClientePorCpfCnpj,
    adicionarPontosFidelidade,
    registrarCompra,
    recarregarClientes: fetchClientes
  };
};
