import { useState, useEffect } from 'react';

export interface Promocao {
  id: number;
  produtoId?: number;
  categoriaId?: string;
  nome: string;
  descricao?: string;
  tipoDesconto: 'percentual' | 'valor';
  valorDesconto: number;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export const usePromocoes = () => {
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromocoes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Inicializa com array vazio em vez de dados mockados
      setPromocoes([]);
    } catch (err) {
      setError('Erro ao carregar promoções');
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarPromocao = async (promocao: Omit<Promocao, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const novaPromocao = {
        ...promocao,
        id: Math.max(...promocoes.map(p => p.id), 0) + 1,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      };
      
      setPromocoes([...promocoes, novaPromocao]);
      return novaPromocao;
    } catch (err) {
      setError('Erro ao adicionar promoção');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarPromocao = async (id: number, promocao: Partial<Promocao>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPromocoes(promocoes.map(p => 
        p.id === id ? { 
          ...p, 
          ...promocao, 
          atualizadoEm: new Date().toISOString() 
        } : p
      ));
      
      return true;
    } catch (err) {
      setError('Erro ao atualizar promoção');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const excluirPromocao = async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPromocoes(promocoes.filter(p => p.id !== id));
      
      return true;
    } catch (err) {
      setError('Erro ao excluir promoção');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const alterarStatusPromocao = async (id: number, ativo: boolean) => {
    return atualizarPromocao(id, { ativo });
  };

  const getPromocaoPorId = (id: number) => {
    return promocoes.find(p => p.id === id) || null;
  };

  const getPromocoesAtivas = () => {
    const hoje = new Date();
    return promocoes.filter(p => 
      p.ativo && 
      new Date(p.dataInicio) <= hoje && 
      new Date(p.dataFim) >= hoje
    );
  };

  const getPromocoesPorProduto = (produtoId: number) => {
    return promocoes.filter(p => p.produtoId === produtoId);
  };

  const getPromocoesPorCategoria = (categoriaId: string) => {
    return promocoes.filter(p => p.categoriaId === categoriaId);
  };

  useEffect(() => {
    fetchPromocoes();
  }, []);

  return {
    promocoes,
    isLoading,
    error,
    adicionarPromocao,
    atualizarPromocao,
    excluirPromocao,
    alterarStatusPromocao,
    getPromocaoPorId,
    getPromocoesAtivas,
    getPromocoesPorProduto,
    getPromocoesPorCategoria,
    recarregarPromocoes: fetchPromocoes
  };
};
