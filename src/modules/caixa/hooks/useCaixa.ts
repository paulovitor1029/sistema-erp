import { useState, useEffect, useCallback } from 'react';

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
  const [saldoAtual, setSaldoAtual] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoizar a função de cálculo para evitar recriações desnecessárias
  const calcularSaldoAtual = useCallback(() => {
    let saldo = 0;
    
    // Se houver caixa aberto, começar com o valor inicial
    if (caixaAtual) {
      saldo = caixaAtual.valorInicial;
      
      // Somar entradas e subtrair saídas desde a abertura do caixa
      const movimentacoesCaixa = movimentacoes.filter(m => 
        new Date(m.data) >= new Date(caixaAtual.dataAbertura)
      );
      
      movimentacoesCaixa.forEach(m => {
        if (m.tipo === 'entrada') {
          saldo += m.valor;
        } else {
          saldo -= m.valor;
        }
      });
    } else {
      // Se não houver caixa aberto, calcular com base no último fechamento
      const ultimoFechamento = [...fechamentos].sort((a, b) => 
        new Date(b.dataFechamento).getTime() - new Date(a.dataFechamento).getTime()
      )[0];
      
      if (ultimoFechamento) {
        saldo = ultimoFechamento.valorFinal;
      }
    }
    
    setSaldoAtual(saldo);
    return saldo;
  }, [movimentacoes, caixaAtual, fechamentos]);

  // Calcular saldo atual sempre que movimentações ou caixa atual mudar
  useEffect(() => {
    calcularSaldoAtual();
  }, [calcularSaldoAtual]);

  const fetchMovimentacoes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Para fins de demonstração, criar algumas movimentações de exemplo
      // Em produção, isso seria substituído por uma chamada de API real
      const dataAtual = new Date().toISOString().split('T')[0];
      const movimentacoesDemo = [
        {
          id: 1,
          data: dataAtual,
          tipo: 'entrada' as const,
          categoria: 'Venda',
          descricao: 'Venda de produto',
          valor: 150.00,
          formaPagamento: 'dinheiro',
          funcionarioId: 1,
        },
        {
          id: 2,
          data: dataAtual,
          tipo: 'saida' as const,
          categoria: 'Despesa',
          descricao: 'Pagamento de fornecedor',
          valor: 50.00,
          formaPagamento: 'transferencia',
          funcionarioId: 1,
        }
      ];
      
      setMovimentacoes(movimentacoesDemo);
    } catch (err) {
      setError('Erro ao carregar movimentações');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFechamentos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Para fins de demonstração, criar um caixa aberto
      // Em produção, isso seria substituído por uma chamada de API real
      const dataAtual = new Date().toISOString().split('T')[0];
      const caixaDemo: FechamentoCaixa = {
        id: 1,
        dataAbertura: dataAtual,
        dataFechamento: '',
        valorInicial: 100.00,
        valorFinal: 0,
        valorEntradas: 0,
        valorSaidas: 0,
        valorDiferenca: 0,
        funcionarioAberturaId: 1,
        funcionarioFechamentoId: 0,
        status: 'aberto'
      };
      
      setFechamentos([caixaDemo]);
      setCaixaAtual(caixaDemo);
    } catch (err) {
      setError('Erro ao carregar fechamentos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    fetchMovimentacoes();
    fetchFechamentos();
  }, [fetchMovimentacoes, fetchFechamentos]);

  const abrirCaixa = async (dados: { valorInicial: number, data: string, hora: string, observacao?: string }) => {
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
        dataAbertura: dados.data,
        dataFechamento: '',
        valorInicial: dados.valorInicial,
        valorFinal: 0,
        valorEntradas: 0,
        valorSaidas: 0,
        valorDiferenca: 0,
        funcionarioAberturaId: 1, // Usuário logado
        funcionarioFechamentoId: 0,
        observacao: dados.observacao,
        status: 'aberto'
      };
      
      setFechamentos(prev => [...prev, novoCaixa]);
      setCaixaAtual(novoCaixa);
      
      return novoCaixa;
    } catch (err) {
      setError('Erro ao abrir caixa');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fecharCaixa = async (dados: { valorFinal: number, data: string, hora: string, observacao?: string }) => {
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
      const valorDiferenca = dados.valorFinal - valorEsperado;
      
      // Atualizar caixa
      const caixaFechado: FechamentoCaixa = {
        ...caixaAtual,
        dataFechamento: dados.data,
        valorFinal: dados.valorFinal,
        valorEntradas,
        valorSaidas,
        valorDiferenca,
        funcionarioFechamentoId: 1, // Usuário logado
        observacao: dados.observacao || caixaAtual.observacao,
        status: 'fechado'
      };
      
      setFechamentos(prev => prev.map(f => 
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

  const registrarMovimentacao = async (movimentacao: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar se existe um caixa aberto para movimentações manuais
      if (!caixaAtual && !movimentacao.vendaId) {
        setError('Não existe um caixa aberto');
        return null;
      }
      
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const novaMovimentacao: MovimentacaoCaixa = {
        id: Math.max(...movimentacoes.map(m => m.id), 0) + 1,
        data: movimentacao.data,
        tipo: movimentacao.tipo,
        categoria: movimentacao.tipo === 'entrada' ? 'Venda' : 'Despesa',
        descricao: movimentacao.descricao,
        valor: movimentacao.valor,
        formaPagamento: movimentacao.formaPagamento,
        vendaId: movimentacao.vendaId,
        funcionarioId: 1, // Usuário logado
        observacao: movimentacao.observacao
      };
      
      setMovimentacoes(prev => [...prev, novaMovimentacao]);
      
      return novaMovimentacao;
    } catch (err) {
      setError('Erro ao registrar movimentação');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getMovimentacoesPorPeriodo = useCallback((dataInicio: string, dataFim: string) => {
    return movimentacoes.filter(m => 
      m.data >= dataInicio && 
      m.data <= dataFim
    );
  }, [movimentacoes]);

  const getMovimentacoesPorCategoria = useCallback((categoria: string) => {
    return movimentacoes.filter(m => m.categoria === categoria);
  }, [movimentacoes]);

  const getFechamentosPorPeriodo = useCallback((dataInicio: string, dataFim: string) => {
    return fechamentos.filter(f => 
      f.dataAbertura >= dataInicio && 
      (f.status === 'aberto' || f.dataFechamento <= dataFim)
    );
  }, [fechamentos]);

  const getResumoFinanceiro = useCallback((dataInicio: string, dataFim: string) => {
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
  }, [getMovimentacoesPorPeriodo]);

  return {
    movimentacoes,
    fechamentos,
    caixaAtual,
    saldoAtual,
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
