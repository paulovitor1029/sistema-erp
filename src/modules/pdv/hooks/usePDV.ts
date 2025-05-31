import { useState, useEffect } from 'react';

export interface Venda {
  id: number;
  data: string;
  clienteId?: number;
  funcionarioId: number;
  itens: ItemVenda[];
  subtotal: number;
  desconto: number;
  total: number;
  formaPagamento: string;
  status: 'aberta' | 'finalizada' | 'cancelada';
  observacao?: string;
}

export interface ItemVenda {
  id: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  total: number;
  promocaoId?: number;
}

export const usePDV = () => {
  const [vendaAtual, setVendaAtual] = useState<Venda | null>(null);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVendas = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Inicializa com array vazio em vez de dados mockados
      setVendas([]);
    } catch (err) {
      setError('Erro ao carregar vendas');
    } finally {
      setIsLoading(false);
    }
  };

  const iniciarVenda = async (funcionarioId: number, clienteId?: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const novaVenda: Venda = {
        id: Math.max(...vendas.map(v => v.id), 0) + 1,
        data: new Date().toISOString(),
        funcionarioId,
        clienteId,
        itens: [],
        subtotal: 0,
        desconto: 0,
        total: 0,
        formaPagamento: '',
        status: 'aberta'
      };
      
      setVendaAtual(novaVenda);
      return novaVenda;
    } catch (err) {
      setError('Erro ao iniciar venda');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarItem = async (
    produtoId: number, 
    quantidade: number, 
    precoUnitario: number, 
    desconto: number = 0,
    promocaoId?: number
  ) => {
    if (!vendaAtual) {
      setError('Nenhuma venda em andamento');
      return false;
    }
    
    try {
      // Verificar se o produto já está na venda
      const itemExistente = vendaAtual.itens.find(item => item.produtoId === produtoId);
      
      let novosItens;
      
      if (itemExistente) {
        // Atualizar quantidade do item existente
        novosItens = vendaAtual.itens.map(item => {
          if (item.produtoId === produtoId) {
            const novaQuantidade = item.quantidade + quantidade;
            const novoTotal = (precoUnitario * novaQuantidade) - desconto;
            
            return {
              ...item,
              quantidade: novaQuantidade,
              desconto: desconto,
              total: novoTotal
            };
          }
          return item;
        });
      } else {
        // Adicionar novo item
        const novoItem: ItemVenda = {
          id: Math.max(...vendaAtual.itens.map(i => i.id), 0) + 1,
          produtoId,
          quantidade,
          precoUnitario,
          desconto,
          total: (precoUnitario * quantidade) - desconto,
          promocaoId
        };
        
        novosItens = [...vendaAtual.itens, novoItem];
      }
      
      // Recalcular totais
      const subtotal = novosItens.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);
      const descontoTotal = novosItens.reduce((sum, item) => sum + item.desconto, 0);
      const total = subtotal - descontoTotal;
      
      // Atualizar venda
      const vendaAtualizada = {
        ...vendaAtual,
        itens: novosItens,
        subtotal,
        desconto: descontoTotal,
        total
      };
      
      setVendaAtual(vendaAtualizada);
      return true;
    } catch (err) {
      setError('Erro ao adicionar item');
      return false;
    }
  };

  const removerItem = async (itemId: number) => {
    if (!vendaAtual) {
      setError('Nenhuma venda em andamento');
      return false;
    }
    
    try {
      // Remover item
      const novosItens = vendaAtual.itens.filter(item => item.id !== itemId);
      
      // Recalcular totais
      const subtotal = novosItens.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);
      const descontoTotal = novosItens.reduce((sum, item) => sum + item.desconto, 0);
      const total = subtotal - descontoTotal;
      
      // Atualizar venda
      const vendaAtualizada = {
        ...vendaAtual,
        itens: novosItens,
        subtotal,
        desconto: descontoTotal,
        total
      };
      
      setVendaAtual(vendaAtualizada);
      return true;
    } catch (err) {
      setError('Erro ao remover item');
      return false;
    }
  };

  const atualizarQuantidadeItem = async (itemId: number, quantidade: number) => {
    if (!vendaAtual) {
      setError('Nenhuma venda em andamento');
      return false;
    }
    
    if (quantidade <= 0) {
      return removerItem(itemId);
    }
    
    try {
      // Atualizar quantidade do item
      const novosItens = vendaAtual.itens.map(item => {
        if (item.id === itemId) {
          const novoTotal = (item.precoUnitario * quantidade) - item.desconto;
          
          return {
            ...item,
            quantidade,
            total: novoTotal
          };
        }
        return item;
      });
      
      // Recalcular totais
      const subtotal = novosItens.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);
      const descontoTotal = novosItens.reduce((sum, item) => sum + item.desconto, 0);
      const total = subtotal - descontoTotal;
      
      // Atualizar venda
      const vendaAtualizada = {
        ...vendaAtual,
        itens: novosItens,
        subtotal,
        desconto: descontoTotal,
        total
      };
      
      setVendaAtual(vendaAtualizada);
      return true;
    } catch (err) {
      setError('Erro ao atualizar quantidade');
      return false;
    }
  };

  const aplicarDescontoGeral = async (desconto: number) => {
    if (!vendaAtual) {
      setError('Nenhuma venda em andamento');
      return false;
    }
    
    try {
      // Atualizar venda com desconto geral
      const vendaAtualizada = {
        ...vendaAtual,
        desconto,
        total: vendaAtual.subtotal - desconto
      };
      
      setVendaAtual(vendaAtualizada);
      return true;
    } catch (err) {
      setError('Erro ao aplicar desconto');
      return false;
    }
  };

  const finalizarVenda = async (formaPagamento: string, observacao?: string) => {
    if (!vendaAtual) {
      setError('Nenhuma venda em andamento');
      return false;
    }
    
    if (vendaAtual.itens.length === 0) {
      setError('Não é possível finalizar uma venda sem itens');
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Finalizar venda
      const vendaFinalizada: Venda = {
        ...vendaAtual,
        formaPagamento,
        observacao,
        status: 'finalizada',
        data: new Date().toISOString()
      };
      
      // Adicionar à lista de vendas
      setVendas([...vendas, vendaFinalizada]);
      
      // Limpar venda atual
      setVendaAtual(null);
      
      return vendaFinalizada;
    } catch (err) {
      setError('Erro ao finalizar venda');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelarVenda = async (motivo?: string) => {
    if (!vendaAtual) {
      setError('Nenhuma venda em andamento');
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Cancelar venda
      const vendaCancelada: Venda = {
        ...vendaAtual,
        status: 'cancelada',
        observacao: motivo || vendaAtual.observacao
      };
      
      // Adicionar à lista de vendas (opcional, dependendo da regra de negócio)
      setVendas([...vendas, vendaCancelada]);
      
      // Limpar venda atual
      setVendaAtual(null);
      
      return true;
    } catch (err) {
      setError('Erro ao cancelar venda');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getVendaPorId = (id: number) => {
    return vendas.find(v => v.id === id) || null;
  };

  useEffect(() => {
    fetchVendas();
  }, []);

  return {
    vendaAtual,
    vendas,
    isLoading,
    error,
    iniciarVenda,
    adicionarItem,
    removerItem,
    atualizarQuantidadeItem,
    aplicarDescontoGeral,
    finalizarVenda,
    cancelarVenda,
    getVendaPorId,
    recarregarVendas: fetchVendas
  };
};
