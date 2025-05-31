import { useState, useEffect } from 'react';
import { Produto } from '../../produtos/hooks/useProdutos';

export interface MovimentacaoEstoque {
  id: number;
  produtoId: number;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'perda' | 'devolucao';
  quantidade: number;
  data: string;
  responsavel: string;
  observacao?: string;
}

export const useEstoque = () => {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovimentacoes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Inicializa com array vazio em vez de dados mockados
      setMovimentacoes([]);
    } catch (err) {
      setError('Erro ao carregar movimentações de estoque');
    } finally {
      setIsLoading(false);
    }
  };

  const registrarMovimentacao = async (movimentacao: Omit<MovimentacaoEstoque, 'id' | 'data'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const novaMovimentacao = {
        ...movimentacao,
        id: Math.max(...movimentacoes.map(m => m.id), 0) + 1,
        data: new Date().toISOString()
      };
      
      setMovimentacoes([...movimentacoes, novaMovimentacao]);
      return novaMovimentacao;
    } catch (err) {
      setError('Erro ao registrar movimentação');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getHistoricoProduto = (produtoId: number) => {
    return movimentacoes.filter(m => m.produtoId === produtoId);
  };

  const getProdutosAbaixoEstoqueMinimo = (produtos: Produto[]) => {
    return produtos.filter(p => p.estoqueAtual < p.estoqueMinimo);
  };

  useEffect(() => {
    fetchMovimentacoes();
  }, []);

  return {
    movimentacoes,
    isLoading,
    error,
    registrarMovimentacao,
    getHistoricoProduto,
    getProdutosAbaixoEstoqueMinimo,
    recarregarMovimentacoes: fetchMovimentacoes
  };
};
