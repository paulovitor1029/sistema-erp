import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/context/AuthContext';
import { Produto } from '../../produtos/hooks/useProdutosServicos';
import { Servico } from '../../produtos/hooks/useProdutosServicos';
import { Cliente } from '../../clientes/hooks/useClientes';

// Tipos para vendas
export interface ItemVenda {
  id: number;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  total: number;
  produtoId?: number;
  produto?: Produto;
  servicoId?: number;
  servico?: Servico;
  promocaoId?: number;
}

export interface Venda {
  id: number;
  data: string;
  subtotal: number;
  desconto: number;
  total: number;
  formaPagamento: string;
  status: 'aberta' | 'finalizada' | 'cancelada';
  observacao?: string;
  clienteId?: number;
  cliente?: Cliente;
  itens: ItemVenda[];
}

// Hook para gerenciar PDV
export const usePDV = () => {
  const { token, user } = useAuth();
  
  // Estados
  const [vendaAtual, setVendaAtual] = useState<Venda | null>(null);
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
  
  // Iniciar nova venda
  const iniciarVenda = async (usuarioId: number) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/pdv/${user.empresaId}/iniciar`, {
      //   usuarioId
      // });
      // const novaVenda = response.data;
      // setVendaAtual(novaVenda);
      // return novaVenda;
      
      // Por enquanto, simular resposta
      const novaVenda: Venda = {
        id: Math.floor(Math.random() * 1000),
        data: new Date().toISOString(),
        subtotal: 0,
        desconto: 0,
        total: 0,
        formaPagamento: '',
        status: 'aberta',
        itens: []
      };
      
      setVendaAtual(novaVenda);
      return novaVenda;
    } catch (err: any) {
      console.error('Erro ao iniciar venda:', err);
      setError(err.response?.data?.error || 'Erro ao iniciar venda');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Adicionar item à venda
  const adicionarItem = async (
    produtoOuServicoId: number,
    quantidade: number,
    precoUnitario: number,
    desconto: number = 0,
    promocaoId?: number,
    isServico: boolean = false
  ) => {
    if (!vendaAtual || !user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/pdv/${user.empresaId}/venda/${vendaAtual.id}/item`, {
      //   produtoId: isServico ? undefined : produtoOuServicoId,
      //   servicoId: isServico ? produtoOuServicoId : undefined,
      //   quantidade,
      //   precoUnitario,
      //   desconto,
      //   promocaoId
      // });
      // const novoItem = response.data;
      // const vendaAtualizada = response.data.venda;
      // setVendaAtual(vendaAtualizada);
      // return true;
      
      // Por enquanto, simular resposta
      const novoItem: ItemVenda = {
        id: Math.floor(Math.random() * 1000),
        quantidade,
        precoUnitario,
        desconto,
        total: (precoUnitario * quantidade) - desconto,
        produtoId: isServico ? undefined : produtoOuServicoId,
        servicoId: isServico ? produtoOuServicoId : undefined,
        promocaoId
      };
      
      const itensAtualizados = [...vendaAtual.itens, novoItem];
      const subtotal = itensAtualizados.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);
      const descontoTotal = itensAtualizados.reduce((sum, item) => sum + item.desconto, 0) + vendaAtual.desconto;
      const total = subtotal - descontoTotal;
      
      const vendaAtualizada: Venda = {
        ...vendaAtual,
        itens: itensAtualizados,
        subtotal,
        total
      };
      
      setVendaAtual(vendaAtualizada);
      return true;
    } catch (err: any) {
      console.error('Erro ao adicionar item:', err);
      setError(err.response?.data?.error || 'Erro ao adicionar item');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remover item da venda
  const removerItem = async (itemId: number) => {
    if (!vendaAtual || !user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.delete(`/pdv/${user.empresaId}/venda/${vendaAtual.id}/item/${itemId}`);
      // const response = await api.get(`/pdv/${user.empresaId}/venda/${vendaAtual.id}`);
      // setVendaAtual(response.data);
      // return true;
      
      // Por enquanto, simular resposta
      const itensAtualizados = vendaAtual.itens.filter(item => item.id !== itemId);
      const subtotal = itensAtualizados.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);
      const descontoTotal = itensAtualizados.reduce((sum, item) => sum + item.desconto, 0) + vendaAtual.desconto;
      const total = subtotal - descontoTotal;
      
      const vendaAtualizada: Venda = {
        ...vendaAtual,
        itens: itensAtualizados,
        subtotal,
        total
      };
      
      setVendaAtual(vendaAtualizada);
      return true;
    } catch (err: any) {
      console.error('Erro ao remover item:', err);
      setError(err.response?.data?.error || 'Erro ao remover item');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Atualizar quantidade de um item
  const atualizarQuantidadeItem = async (itemId: number, quantidade: number) => {
    if (!vendaAtual || !user || quantidade <= 0) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.put(`/pdv/${user.empresaId}/venda/${vendaAtual.id}/item/${itemId}`, {
      //   quantidade
      // });
      // const response = await api.get(`/pdv/${user.empresaId}/venda/${vendaAtual.id}`);
      // setVendaAtual(response.data);
      // return true;
      
      // Por enquanto, simular resposta
      const itemIndex = vendaAtual.itens.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        setError('Item não encontrado');
        return false;
      }
      
      const itensAtualizados = [...vendaAtual.itens];
      const item = itensAtualizados[itemIndex];
      
      itensAtualizados[itemIndex] = {
        ...item,
        quantidade,
        total: (item.precoUnitario * quantidade) - item.desconto
      };
      
      const subtotal = itensAtualizados.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);
      const descontoTotal = itensAtualizados.reduce((sum, item) => sum + item.desconto, 0) + vendaAtual.desconto;
      const total = subtotal - descontoTotal;
      
      const vendaAtualizada: Venda = {
        ...vendaAtual,
        itens: itensAtualizados,
        subtotal,
        total
      };
      
      setVendaAtual(vendaAtualizada);
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar quantidade:', err);
      setError(err.response?.data?.error || 'Erro ao atualizar quantidade');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Aplicar desconto geral na venda
  const aplicarDescontoGeral = async (desconto: number) => {
    if (!vendaAtual || !user || desconto < 0) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.put(`/pdv/${user.empresaId}/venda/${vendaAtual.id}/desconto`, {
      //   desconto
      // });
      // const response = await api.get(`/pdv/${user.empresaId}/venda/${vendaAtual.id}`);
      // setVendaAtual(response.data);
      // return true;
      
      // Por enquanto, simular resposta
      const descontoItens = vendaAtual.itens.reduce((sum, item) => sum + item.desconto, 0);
      const total = vendaAtual.subtotal - descontoItens - desconto;
      
      if (total < 0) {
        setError('Desconto não pode ser maior que o valor da venda');
        return false;
      }
      
      const vendaAtualizada: Venda = {
        ...vendaAtual,
        desconto,
        total
      };
      
      setVendaAtual(vendaAtualizada);
      return true;
    } catch (err: any) {
      console.error('Erro ao aplicar desconto:', err);
      setError(err.response?.data?.error || 'Erro ao aplicar desconto');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Finalizar venda
  const finalizarVenda = async (formaPagamento: string, observacao?: string) => {
    if (!vendaAtual || !user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.put(`/pdv/${user.empresaId}/venda/${vendaAtual.id}/finalizar`, {
      //   formaPagamento,
      //   observacao
      // });
      // setVendaAtual(null);
      // return true;
      
      // Por enquanto, simular resposta
      setVendaAtual(null);
      return true;
    } catch (err: any) {
      console.error('Erro ao finalizar venda:', err);
      setError(err.response?.data?.error || 'Erro ao finalizar venda');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancelar venda
  const cancelarVenda = async (motivo?: string) => {
    if (!vendaAtual || !user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.put(`/pdv/${user.empresaId}/venda/${vendaAtual.id}/cancelar`, {
      //   motivo
      // });
      // setVendaAtual(null);
      // return true;
      
      // Por enquanto, simular resposta
      setVendaAtual(null);
      return true;
    } catch (err: any) {
      console.error('Erro ao cancelar venda:', err);
      setError(err.response?.data?.error || 'Erro ao cancelar venda');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    vendaAtual,
    isLoading,
    error,
    iniciarVenda,
    adicionarItem,
    removerItem,
    atualizarQuantidadeItem,
    aplicarDescontoGeral,
    finalizarVenda,
    cancelarVenda
  };
};
