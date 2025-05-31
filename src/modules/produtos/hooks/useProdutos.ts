import { useState, useEffect } from 'react';

export interface Produto {
  id: number;
  codigo: string;
  nome: string;
  categoria: string;
  precoCusto: number;
  precoVenda: number;
  validade?: string;
  unidadeMedida: string;
  estoqueMinimo: number;
  estoqueAtual: number;
  ativo: boolean;
  imagem?: string;
  observacoes?: string;
}

export const useProdutos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProdutos = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Inicializa com array vazio em vez de dados mockados
      setProdutos([]);
    } catch (err) {
      setError('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarProduto = async (produto: Omit<Produto, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const novoProduto = {
        ...produto,
        id: Math.max(...produtos.map(p => p.id), 0) + 1
      };
      
      setProdutos([...produtos, novoProduto as Produto]);
      return novoProduto;
    } catch (err) {
      setError('Erro ao adicionar produto');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarProduto = async (id: number, produto: Partial<Produto>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProdutos(produtos.map(p => 
        p.id === id ? { ...p, ...produto } : p
      ));
      
      return true;
    } catch (err) {
      setError('Erro ao atualizar produto');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const excluirProduto = async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProdutos(produtos.filter(p => p.id !== id));
      
      return true;
    } catch (err) {
      setError('Erro ao excluir produto');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const alterarStatusProduto = async (id: number, ativo: boolean) => {
    return atualizarProduto(id, { ativo });
  };

  const getProdutoPorId = (id: number) => {
    return produtos.find(p => p.id === id) || null;
  };

  const getProdutosPorCategoria = (categoria: string) => {
    return produtos.filter(p => p.categoria === categoria);
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  return {
    produtos,
    isLoading,
    error,
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
    alterarStatusProduto,
    getProdutoPorId,
    getProdutosPorCategoria,
    recarregarProdutos: fetchProdutos
  };
};
