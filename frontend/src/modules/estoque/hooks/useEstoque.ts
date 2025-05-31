import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/context/AuthContext';
import { Produto } from '../../produtos/hooks/useProdutosServicos';

// Tipos para movimentações de estoque
export interface MovimentacaoEstoque {
  id: number;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'perda' | 'devolucao' | 'producao';
  quantidade: number;
  data: string;
  observacao?: string;
  produtoId: number;
  produto?: Produto;
  usuarioId: number;
}

// Hook para gerenciar estoque
export const useEstoque = () => {
  const { token, user } = useAuth();
  
  // Estados
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
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
  
  // Carregar movimentações de estoque
  const carregarMovimentacoes = async (filtros?: {
    produtoId?: number;
    tipo?: string;
    dataInicio?: string;
    dataFim?: string;
  }) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/estoque/${user.empresaId}/movimentacoes`, {
      //   params: filtros
      // });
      // setMovimentacoes(response.data);
      
      // Por enquanto, retornar array vazio (sem dados mockados)
      setMovimentacoes([]);
    } catch (err: any) {
      console.error('Erro ao carregar movimentações:', err);
      setError(err.response?.data?.error || 'Erro ao carregar movimentações');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Registrar entrada de estoque
  const registrarEntrada = async (
    produtoId: number,
    quantidade: number,
    observacao?: string
  ) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/estoque/${user.empresaId}/entrada`, {
      //   produtoId,
      //   quantidade,
      //   observacao
      // });
      // const novaMovimentacao = response.data;
      // setMovimentacoes(prev => [...prev, novaMovimentacao]);
      // return novaMovimentacao;
      
      // Por enquanto, simular resposta
      const novaMovimentacao: MovimentacaoEstoque = {
        id: Math.floor(Math.random() * 1000),
        tipo: 'entrada',
        quantidade,
        data: new Date().toISOString(),
        observacao,
        produtoId,
        usuarioId: user.id
      };
      
      setMovimentacoes(prev => [...prev, novaMovimentacao]);
      return novaMovimentacao;
    } catch (err: any) {
      console.error('Erro ao registrar entrada:', err);
      setError(err.response?.data?.error || 'Erro ao registrar entrada');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Registrar saída de estoque
  const registrarSaida = async (
    produtoId: number,
    quantidade: number,
    observacao?: string
  ) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/estoque/${user.empresaId}/saida`, {
      //   produtoId,
      //   quantidade,
      //   observacao
      // });
      // const novaMovimentacao = response.data;
      // setMovimentacoes(prev => [...prev, novaMovimentacao]);
      // return novaMovimentacao;
      
      // Por enquanto, simular resposta
      const novaMovimentacao: MovimentacaoEstoque = {
        id: Math.floor(Math.random() * 1000),
        tipo: 'saida',
        quantidade,
        data: new Date().toISOString(),
        observacao,
        produtoId,
        usuarioId: user.id
      };
      
      setMovimentacoes(prev => [...prev, novaMovimentacao]);
      return novaMovimentacao;
    } catch (err: any) {
      console.error('Erro ao registrar saída:', err);
      setError(err.response?.data?.error || 'Erro ao registrar saída');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Registrar ajuste de estoque
  const registrarAjuste = async (
    produtoId: number,
    quantidade: number,
    observacao?: string
  ) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/estoque/${user.empresaId}/ajuste`, {
      //   produtoId,
      //   quantidade,
      //   observacao
      // });
      // const novaMovimentacao = response.data;
      // setMovimentacoes(prev => [...prev, novaMovimentacao]);
      // return novaMovimentacao;
      
      // Por enquanto, simular resposta
      const novaMovimentacao: MovimentacaoEstoque = {
        id: Math.floor(Math.random() * 1000),
        tipo: 'ajuste',
        quantidade,
        data: new Date().toISOString(),
        observacao,
        produtoId,
        usuarioId: user.id
      };
      
      setMovimentacoes(prev => [...prev, novaMovimentacao]);
      return novaMovimentacao;
    } catch (err: any) {
      console.error('Erro ao registrar ajuste:', err);
      setError(err.response?.data?.error || 'Erro ao registrar ajuste');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Registrar perda de estoque
  const registrarPerda = async (
    produtoId: number,
    quantidade: number,
    observacao?: string
  ) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/estoque/${user.empresaId}/perda`, {
      //   produtoId,
      //   quantidade,
      //   observacao
      // });
      // const novaMovimentacao = response.data;
      // setMovimentacoes(prev => [...prev, novaMovimentacao]);
      // return novaMovimentacao;
      
      // Por enquanto, simular resposta
      const novaMovimentacao: MovimentacaoEstoque = {
        id: Math.floor(Math.random() * 1000),
        tipo: 'perda',
        quantidade,
        data: new Date().toISOString(),
        observacao,
        produtoId,
        usuarioId: user.id
      };
      
      setMovimentacoes(prev => [...prev, novaMovimentacao]);
      return novaMovimentacao;
    } catch (err: any) {
      console.error('Erro ao registrar perda:', err);
      setError(err.response?.data?.error || 'Erro ao registrar perda');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Registrar produção (para indústria)
  const registrarProducao = async (
    produtoId: number,
    quantidade: number,
    observacao?: string
  ) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/estoque/${user.empresaId}/producao`, {
      //   produtoId,
      //   quantidade,
      //   observacao
      // });
      // const novaMovimentacao = response.data;
      // setMovimentacoes(prev => [...prev, novaMovimentacao]);
      // return novaMovimentacao;
      
      // Por enquanto, simular resposta
      const novaMovimentacao: MovimentacaoEstoque = {
        id: Math.floor(Math.random() * 1000),
        tipo: 'producao',
        quantidade,
        data: new Date().toISOString(),
        observacao,
        produtoId,
        usuarioId: user.id
      };
      
      setMovimentacoes(prev => [...prev, novaMovimentacao]);
      return novaMovimentacao;
    } catch (err: any) {
      console.error('Erro ao registrar produção:', err);
      setError(err.response?.data?.error || 'Erro ao registrar produção');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Obter saldo atual de um produto
  const obterSaldoAtual = async (produtoId: number) => {
    if (!user) return 0;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/estoque/${user.empresaId}/saldo/${produtoId}`);
      // return response.data.saldo;
      
      // Por enquanto, calcular com base nas movimentações locais
      const movimentacoesProduto = movimentacoes.filter(m => m.produtoId === produtoId);
      
      let saldo = 0;
      
      movimentacoesProduto.forEach(m => {
        if (m.tipo === 'entrada' || m.tipo === 'devolucao' || m.tipo === 'producao') {
          saldo += m.quantidade;
        } else if (m.tipo === 'saida' || m.tipo === 'perda') {
          saldo -= m.quantidade;
        } else if (m.tipo === 'ajuste') {
          saldo = m.quantidade; // Ajuste define o valor absoluto
        }
      });
      
      return saldo;
    } catch (err: any) {
      console.error('Erro ao obter saldo:', err);
      setError(err.response?.data?.error || 'Erro ao obter saldo');
      return 0;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Obter produtos com estoque baixo
  const obterProdutosEstoqueBaixo = async () => {
    if (!user) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/estoque/${user.empresaId}/baixo`);
      // return response.data;
      
      // Por enquanto, retornar array vazio (sem dados mockados)
      return [];
    } catch (err: any) {
      console.error('Erro ao obter produtos com estoque baixo:', err);
      setError(err.response?.data?.error || 'Erro ao obter produtos com estoque baixo');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar dados iniciais quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      carregarMovimentacoes();
    }
  }, [user]);
  
  return {
    movimentacoes,
    isLoading,
    error,
    carregarMovimentacoes,
    registrarEntrada,
    registrarSaida,
    registrarAjuste,
    registrarPerda,
    registrarProducao,
    obterSaldoAtual,
    obterProdutosEstoqueBaixo
  };
};
