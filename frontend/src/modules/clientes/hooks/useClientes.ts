import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/context/AuthContext';

// Tipos para clientes
export interface Cliente {
  id: number;
  nome: string;
  tipo: 'fisica' | 'juridica';
  cpfCnpj: string;
  email?: string;
  telefone?: string;
  celular?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  dataCadastro: string;
  dataUltimaCompra?: string;
  valorTotalCompras: number;
  pontosFidelidade: number;
  observacoes?: string;
  ativo: boolean;
}

// Hook para gerenciar clientes
export const useClientes = () => {
  const { token, user } = useAuth();
  
  // Estados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // API base URL
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  
  // Configuração do axios com token
  const api = axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Carregar clientes
  const carregarClientes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/clientes/${user.empresaId}`);
      // setClientes(response.data);
      
      // Por enquanto, retornar array vazio (sem dados mockados)
      setClientes([]);
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err);
      setError(err.response?.data?.error || 'Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Obter cliente por ID
  const obterCliente = async (id: number) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/clientes/${user.empresaId}/${id}`);
      // return response.data;
      
      // Por enquanto, buscar no estado local
      const cliente = clientes.find(c => c.id === id);
      return cliente || null;
    } catch (err: any) {
      console.error('Erro ao obter cliente:', err);
      setError(err.response?.data?.error || 'Erro ao obter cliente');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Adicionar cliente
  const adicionarCliente = async (cliente: Omit<Cliente, 'id' | 'dataCadastro' | 'valorTotalCompras' | 'pontosFidelidade'>) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/clientes/${user.empresaId}`, cliente);
      // const novoCliente = response.data;
      // setClientes(prev => [...prev, novoCliente]);
      // return novoCliente;
      
      // Por enquanto, simular resposta
      const novoCliente: Cliente = {
        ...cliente,
        id: Math.floor(Math.random() * 1000),
        dataCadastro: new Date().toISOString(),
        valorTotalCompras: 0,
        pontosFidelidade: 0
      };
      
      setClientes(prev => [...prev, novoCliente]);
      return novoCliente;
    } catch (err: any) {
      console.error('Erro ao adicionar cliente:', err);
      setError(err.response?.data?.error || 'Erro ao adicionar cliente');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Atualizar cliente
  const atualizarCliente = async (id: number, cliente: Partial<Cliente>) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.put(`/clientes/${user.empresaId}/${id}`, cliente);
      
      // Atualizar estado local
      setClientes(prev => 
        prev.map(c => c.id === id ? { ...c, ...cliente } : c)
      );
      
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar cliente:', err);
      setError(err.response?.data?.error || 'Erro ao atualizar cliente');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Alterar status do cliente (ativar/desativar)
  const alterarStatusCliente = async (id: number, ativo: boolean) => {
    return atualizarCliente(id, { ativo });
  };
  
  // Excluir cliente
  const excluirCliente = async (id: number) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.delete(`/clientes/${user.empresaId}/${id}`);
      
      // Atualizar estado local
      setClientes(prev => prev.filter(c => c.id !== id));
      
      return true;
    } catch (err: any) {
      console.error('Erro ao excluir cliente:', err);
      setError(err.response?.data?.error || 'Erro ao excluir cliente');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Recarregar clientes
  const recarregarClientes = () => {
    carregarClientes();
  };
  
  // Carregar dados iniciais quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      carregarClientes();
    }
  }, [user]);
  
  return {
    clientes,
    isLoading,
    error,
    carregarClientes,
    obterCliente,
    adicionarCliente,
    atualizarCliente,
    alterarStatusCliente,
    excluirCliente,
    recarregarClientes
  };
};
