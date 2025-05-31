import { useState, useEffect } from 'react';

export interface MovimentacaoCaixa {
  id: number;
  data: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
  vendaId?: number;
  funcionarioId: number;
  observacao?: string;
}

export interface FechamentoCaixa {
  id: number;
  dataAbertura: string;
  dataFechamento: string;
  valorInicial: number;
  valorFinal: number;
  valorEntradas: number;
  valorSaidas: number;
  valorDiferenca: number;
  funcionarioAberturaId: number;
  funcionarioFechamentoId: number;
  observacao?: string;
  status: 'aberto' | 'fechado';
}

export const useCaixa = () => {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoCaixa[]>([]);
  const [fechamentos, setFechamentos] = useState<FechamentoCaixa[]>([]);
  const [caixaAtual, setCaixaAtual] = useState<FechamentoCaixa | null>(null);
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
      setError('Erro ao carregar movimentações');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFechamentos = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Inicializa com array vazio em vez de dados mockados
      setFechamentos([]);
      
      // Verificar se existe caixa aberto
      const caixaAberto = [] as FechamentoCaixa[];
      if (caixaAberto.length > 0) {
        setCaixaAtual(caixaAberto[0]);
      } else {
        setCaixaAtual(null);
      }
    } catch (err) {
      setError('Erro ao carregar fechamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const abrirCaixa = async (funcionarioId: number, valorInicial: number, observacao?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar se já existe um caixa aberto
      if (caixaAtual) {
        setError('Já existe um caixa aberto');
        return null;
      }
      
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const novoCaixa: FechamentoCaixa = {
        id: Math.max(...fechamentos.map(f => f.id), 0) + 1,
        dataAbertura: new Date().toISOString(),
        dataFechamento: '',
        valorInicial,
        valorFinal: 0,
        valorEntradas: 0,
        valorSaidas: 0,
        valorDiferenca: 0,
        funcionarioAberturaId: funcionarioId,
        funcionarioFechamentoId: 0,
        observacao,
        status: 'aberto'
      };
      
      setFechamentos([...fechamentos, novoCaixa]);
      setCaixaAtual(novoCaixa);
      
      return novoCaixa;
    } catch (err) {
      setError('Erro ao abrir caixa');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fecharCaixa = async (funcionarioId: number, valorFinal: number, observacao?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar se existe um caixa aberto
      if (!caixaAtual) {
        setError('Não existe um caixa aberto');
        return null;
      }
      
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Calcular valores
      const movimentacoesCaixa = movimentacoes.filter(m => 
        new Date(m.data) >= new Date(caixaAtual.dataAbertura)
      );
      
      const valorEntradas = movimentacoesCaixa
        .filter(m => m.tipo === 'entrada')
        .reduce((sum, m) => sum + m.valor, 0);
      
      const valorSaidas = movimentacoesCaixa
        .filter(m => m.tipo === 'saida')
        .reduce((sum, m) => sum + m.valor, 0);
      
      const valorEsperado = caixaAtual.valorInicial + valorEntradas - valorSaidas;
      const valorDiferenca = valorFinal - valorEsperado;
      
      // Atualizar caixa
      const caixaFechado: FechamentoCaixa = {
        ...caixaAtual,
        dataFechamento: new Date().toISOString(),
        valorFinal,
        valorEntradas,
        valorSaidas,
        valorDiferenca,
        funcionarioFechamentoId: funcionarioId,
        observacao: observacao || caixaAtual.observacao,
        status: 'fechado'
      };
      
      setFechamentos(fechamentos.map(f => 
        f.id === caixaAtual.id ? caixaFechado : f
      ));
      
      setCaixaAtual(null);
      
      return caixaFechado;
    } catch (err) {
      setError('Erro ao fechar caixa');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const registrarMovimentacao = async (movimentacao: Omit<MovimentacaoCaixa, 'id' | 'data'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar se existe um caixa aberto
      if (!caixaAtual && (movimentacao.vendaId === undefined)) {
        setError('Não existe um caixa aberto');
        return null;
      }
      
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const novaMovimentacao: MovimentacaoCaixa = {
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

  const getMovimentacoesPorPeriodo = (dataInicio: string, dataFim: string) => {
    return movimentacoes.filter(m => 
      m.data >= dataInicio && 
      m.data <= dataFim
    );
  };

  const getMovimentacoesPorCategoria = (categoria: string) => {
    return movimentacoes.filter(m => m.categoria === categoria);
  };

  const getFechamentosPorPeriodo = (dataInicio: string, dataFim: string) => {
    return fechamentos.filter(f => 
      f.dataAbertura >= dataInicio && 
      (f.status === 'aberto' || f.dataFechamento <= dataFim)
    );
  };

  const getResumoFinanceiro = (dataInicio: string, dataFim: string) => {
    const movimentacoesPeriodo = getMovimentacoesPorPeriodo(dataInicio, dataFim);
    
    const totalEntradas = movimentacoesPeriodo
      .filter(m => m.tipo === 'entrada')
      .reduce((sum, m) => sum + m.valor, 0);
    
    const totalSaidas = movimentacoesPeriodo
      .filter(m => m.tipo === 'saida')
      .reduce((sum, m) => sum + m.valor, 0);
    
    const saldo = totalEntradas - totalSaidas;
    
    // Agrupar por categoria
    const categorias = {} as Record<string, { entradas: number, saidas: number }>;
    
    movimentacoesPeriodo.forEach(m => {
      if (!categorias[m.categoria]) {
        categorias[m.categoria] = { entradas: 0, saidas: 0 };
      }
      
      if (m.tipo === 'entrada') {
        categorias[m.categoria].entradas += m.valor;
      } else {
        categorias[m.categoria].saidas += m.valor;
      }
    });
    
    // Agrupar por forma de pagamento
    const formasPagamento = {} as Record<string, number>;
    
    movimentacoesPeriodo
      .filter(m => m.tipo === 'entrada')
      .forEach(m => {
        if (!formasPagamento[m.formaPagamento]) {
          formasPagamento[m.formaPagamento] = 0;
        }
        
        formasPagamento[m.formaPagamento] += m.valor;
      });
    
    return {
      totalEntradas,
      totalSaidas,
      saldo,
      categorias,
      formasPagamento
    };
  };

  useEffect(() => {
    fetchMovimentacoes();
    fetchFechamentos();
  }, []);

  return {
    movimentacoes,
    fechamentos,
    caixaAtual,
    isLoading,
    error,
    abrirCaixa,
    fecharCaixa,
    registrarMovimentacao,
    getMovimentacoesPorPeriodo,
    getMovimentacoesPorCategoria,
    getFechamentosPorPeriodo,
    getResumoFinanceiro,
    recarregarMovimentacoes: fetchMovimentacoes,
    recarregarFechamentos: fetchFechamentos
  };
};
