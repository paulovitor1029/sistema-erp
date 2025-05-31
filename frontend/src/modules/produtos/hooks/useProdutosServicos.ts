import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/context/AuthContext';

// Tipos para produtos e serviços
export interface Produto {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  categoria: string;
  precoCusto: number;
  precoVenda: number;
  estoqueMinimo: number;
  estoqueAtual: number;
  unidadeMedida: string;
  ativo: boolean;
  imagem?: string;
  produtoFinal: boolean; // Para indústria
}

export interface Servico {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  categoria: string;
  precoBase: number;
  precoPorHora: boolean;
  tempoEstimado?: number; // Em minutos
  ativo: boolean;
}

export interface ComponenteProduto {
  id: number;
  produtoFinalId: number;
  insumoId: number;
  quantidade: number;
  insumo?: Produto;
}

// Hook para gerenciar produtos e serviços
export const useProdutosServicos = () => {
  const { token, user } = useAuth();
  
  // Estados
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [componentes, setComponentes] = useState<ComponenteProduto[]>([]);
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
  
  // Carregar produtos
  const carregarProdutos = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/produtos/${user.empresaId}`);
      // setProdutos(response.data);
      
      // Por enquanto, retornar array vazio (sem dados mockados)
      setProdutos([]);
    } catch (err: any) {
      console.error('Erro ao carregar produtos:', err);
      setError(err.response?.data?.error || 'Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar serviços
  const carregarServicos = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/servicos/${user.empresaId}`);
      // setServicos(response.data);
      
      // Por enquanto, retornar array vazio (sem dados mockados)
      setServicos([]);
    } catch (err: any) {
      console.error('Erro ao carregar serviços:', err);
      setError(err.response?.data?.error || 'Erro ao carregar serviços');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar componentes de produtos (BOM)
  const carregarComponentes = async (produtoId: number) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/produtos/${produtoId}/componentes`);
      // setComponentes(response.data);
      
      // Por enquanto, retornar array vazio (sem dados mockados)
      setComponentes([]);
    } catch (err: any) {
      console.error('Erro ao carregar componentes:', err);
      setError(err.response?.data?.error || 'Erro ao carregar componentes');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Adicionar produto
  const adicionarProduto = async (produto: Omit<Produto, 'id'>) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/produtos/${user.empresaId}`, produto);
      // const novoProduto = response.data;
      // setProdutos(prev => [...prev, novoProduto]);
      // return novoProduto;
      
      // Por enquanto, simular resposta
      const novoProduto = {
        ...produto,
        id: Math.floor(Math.random() * 1000)
      };
      
      setProdutos(prev => [...prev, novoProduto]);
      return novoProduto;
    } catch (err: any) {
      console.error('Erro ao adicionar produto:', err);
      setError(err.response?.data?.error || 'Erro ao adicionar produto');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Adicionar serviço
  const adicionarServico = async (servico: Omit<Servico, 'id'>) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/servicos/${user.empresaId}`, servico);
      // const novoServico = response.data;
      // setServicos(prev => [...prev, novoServico]);
      // return novoServico;
      
      // Por enquanto, simular resposta
      const novoServico = {
        ...servico,
        id: Math.floor(Math.random() * 1000)
      };
      
      setServicos(prev => [...prev, novoServico]);
      return novoServico;
    } catch (err: any) {
      console.error('Erro ao adicionar serviço:', err);
      setError(err.response?.data?.error || 'Erro ao adicionar serviço');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Atualizar produto
  const atualizarProduto = async (id: number, produto: Partial<Produto>) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.put(`/produtos/${user.empresaId}/${id}`, produto);
      
      // Atualizar estado local
      setProdutos(prev => 
        prev.map(p => p.id === id ? { ...p, ...produto } : p)
      );
      
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar produto:', err);
      setError(err.response?.data?.error || 'Erro ao atualizar produto');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Atualizar serviço
  const atualizarServico = async (id: number, servico: Partial<Servico>) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.put(`/servicos/${user.empresaId}/${id}`, servico);
      
      // Atualizar estado local
      setServicos(prev => 
        prev.map(s => s.id === id ? { ...s, ...servico } : s)
      );
      
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar serviço:', err);
      setError(err.response?.data?.error || 'Erro ao atualizar serviço');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Excluir produto
  const excluirProduto = async (id: number) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.delete(`/produtos/${user.empresaId}/${id}`);
      
      // Atualizar estado local
      setProdutos(prev => prev.filter(p => p.id !== id));
      
      return true;
    } catch (err: any) {
      console.error('Erro ao excluir produto:', err);
      setError(err.response?.data?.error || 'Erro ao excluir produto');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Excluir serviço
  const excluirServico = async (id: number) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.delete(`/servicos/${user.empresaId}/${id}`);
      
      // Atualizar estado local
      setServicos(prev => prev.filter(s => s.id !== id));
      
      return true;
    } catch (err: any) {
      console.error('Erro ao excluir serviço:', err);
      setError(err.response?.data?.error || 'Erro ao excluir serviço');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Adicionar componente a um produto (BOM)
  const adicionarComponente = async (produtoId: number, insumoId: number, quantidade: number) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/produtos/${produtoId}/componentes`, {
      //   insumoId,
      //   quantidade
      // });
      // const novoComponente = response.data;
      // setComponentes(prev => [...prev, novoComponente]);
      // return novoComponente;
      
      // Por enquanto, simular resposta
      const novoComponente = {
        id: Math.floor(Math.random() * 1000),
        produtoFinalId: produtoId,
        insumoId,
        quantidade
      };
      
      setComponentes(prev => [...prev, novoComponente]);
      return novoComponente;
    } catch (err: any) {
      console.error('Erro ao adicionar componente:', err);
      setError(err.response?.data?.error || 'Erro ao adicionar componente');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remover componente de um produto (BOM)
  const removerComponente = async (componenteId: number) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.delete(`/componentes/${componenteId}`);
      
      // Atualizar estado local
      setComponentes(prev => prev.filter(c => c.id !== componenteId));
      
      return true;
    } catch (err: any) {
      console.error('Erro ao remover componente:', err);
      setError(err.response?.data?.error || 'Erro ao remover componente');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar dados iniciais quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      carregarProdutos();
      carregarServicos();
    }
  }, [user]);
  
  return {
    produtos,
    servicos,
    componentes,
    isLoading,
    error,
    carregarProdutos,
    carregarServicos,
    carregarComponentes,
    adicionarProduto,
    adicionarServico,
    atualizarProduto,
    atualizarServico,
    excluirProduto,
    excluirServico,
    adicionarComponente,
    removerComponente
  };
};
