import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/context/AuthContext';

// Tipos para movimentações financeiras
export interface MovimentacaoFinanceira {
  id: number;
  tipo: 'receita' | 'despesa' | 'transferencia';
  categoria: string;
  valor: number;
  data: string;
  dataVencimento?: string;
  dataPagamento?: string;
  status: 'pendente' | 'pago' | 'cancelado';
  formaPagamento?: string;
  descricao: string;
  observacao?: string;
  comprovante?: string;
  contaId: number;
  vendaId?: number;
  fornecedorId?: number;
}

export interface ContaBancaria {
  id: number;
  nome: string;
  tipo: 'corrente' | 'poupanca' | 'investimento' | 'caixa';
  banco?: string;
  agencia?: string;
  conta?: string;
  saldoInicial: number;
  saldoAtual: number;
  ativo: boolean;
}

// Hook para gerenciar finanças
export const useFinanceiro = () => {
  const { token, user } = useAuth();
  
  // Estados
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFinanceira[]>([]);
  const [contas, setContas] = useState<ContaBancaria[]>([]);
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
  
  // Carregar contas bancárias
  const carregarContas = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/financeiro/${user.empresaId}/contas`);
      // setContas(response.data);
      
      // Por enquanto, retornar array vazio (sem dados mockados)
      setContas([]);
    } catch (err: any) {
      console.error('Erro ao carregar contas:', err);
      setError(err.response?.data?.error || 'Erro ao carregar contas');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar movimentações financeiras
  const carregarMovimentacoes = async (filtros?: {
    tipo?: string;
    status?: string;
    dataInicio?: string;
    dataFim?: string;
    contaId?: number;
  }) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/financeiro/${user.empresaId}/movimentacoes`, {
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
  
  // Adicionar conta bancária
  const adicionarConta = async (conta: Omit<ContaBancaria, 'id' | 'saldoAtual'>) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/financeiro/${user.empresaId}/contas`, conta);
      // const novaConta = response.data;
      // setContas(prev => [...prev, novaConta]);
      // return novaConta;
      
      // Por enquanto, simular resposta
      const novaConta: ContaBancaria = {
        ...conta,
        id: Math.floor(Math.random() * 1000),
        saldoAtual: conta.saldoInicial
      };
      
      setContas(prev => [...prev, novaConta]);
      return novaConta;
    } catch (err: any) {
      console.error('Erro ao adicionar conta:', err);
      setError(err.response?.data?.error || 'Erro ao adicionar conta');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Atualizar conta bancária
  const atualizarConta = async (id: number, conta: Partial<ContaBancaria>) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.put(`/financeiro/${user.empresaId}/contas/${id}`, conta);
      
      // Atualizar estado local
      setContas(prev => 
        prev.map(c => c.id === id ? { ...c, ...conta } : c)
      );
      
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar conta:', err);
      setError(err.response?.data?.error || 'Erro ao atualizar conta');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Excluir conta bancária
  const excluirConta = async (id: number) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.delete(`/financeiro/${user.empresaId}/contas/${id}`);
      
      // Atualizar estado local
      setContas(prev => prev.filter(c => c.id !== id));
      
      return true;
    } catch (err: any) {
      console.error('Erro ao excluir conta:', err);
      setError(err.response?.data?.error || 'Erro ao excluir conta');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Registrar receita
  const registrarReceita = async (
    contaId: number,
    valor: number,
    categoria: string,
    descricao: string,
    data: string,
    dataPagamento?: string,
    formaPagamento?: string,
    observacao?: string,
    comprovante?: string,
    vendaId?: number
  ) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/financeiro/${user.empresaId}/receitas`, {
      //   contaId,
      //   valor,
      //   categoria,
      //   descricao,
      //   data,
      //   dataPagamento,
      //   formaPagamento,
      //   observacao,
      //   comprovante,
      //   vendaId
      // });
      // const novaReceita = response.data;
      // setMovimentacoes(prev => [...prev, novaReceita]);
      // return novaReceita;
      
      // Por enquanto, simular resposta
      const novaReceita: MovimentacaoFinanceira = {
        id: Math.floor(Math.random() * 1000),
        tipo: 'receita',
        categoria,
        valor,
        data,
        dataPagamento,
        status: dataPagamento ? 'pago' : 'pendente',
        formaPagamento,
        descricao,
        observacao,
        comprovante,
        contaId,
        vendaId
      };
      
      setMovimentacoes(prev => [...prev, novaReceita]);
      
      // Atualizar saldo da conta
      if (dataPagamento) {
        setContas(prev => 
          prev.map(c => c.id === contaId ? { ...c, saldoAtual: c.saldoAtual + valor } : c)
        );
      }
      
      return novaReceita;
    } catch (err: any) {
      console.error('Erro ao registrar receita:', err);
      setError(err.response?.data?.error || 'Erro ao registrar receita');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Registrar despesa
  const registrarDespesa = async (
    contaId: number,
    valor: number,
    categoria: string,
    descricao: string,
    data: string,
    dataVencimento?: string,
    dataPagamento?: string,
    formaPagamento?: string,
    observacao?: string,
    comprovante?: string,
    fornecedorId?: number
  ) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/financeiro/${user.empresaId}/despesas`, {
      //   contaId,
      //   valor,
      //   categoria,
      //   descricao,
      //   data,
      //   dataVencimento,
      //   dataPagamento,
      //   formaPagamento,
      //   observacao,
      //   comprovante,
      //   fornecedorId
      // });
      // const novaDespesa = response.data;
      // setMovimentacoes(prev => [...prev, novaDespesa]);
      // return novaDespesa;
      
      // Por enquanto, simular resposta
      const novaDespesa: MovimentacaoFinanceira = {
        id: Math.floor(Math.random() * 1000),
        tipo: 'despesa',
        categoria,
        valor,
        data,
        dataVencimento,
        dataPagamento,
        status: dataPagamento ? 'pago' : 'pendente',
        formaPagamento,
        descricao,
        observacao,
        comprovante,
        contaId,
        fornecedorId
      };
      
      setMovimentacoes(prev => [...prev, novaDespesa]);
      
      // Atualizar saldo da conta
      if (dataPagamento) {
        setContas(prev => 
          prev.map(c => c.id === contaId ? { ...c, saldoAtual: c.saldoAtual - valor } : c)
        );
      }
      
      return novaDespesa;
    } catch (err: any) {
      console.error('Erro ao registrar despesa:', err);
      setError(err.response?.data?.error || 'Erro ao registrar despesa');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Registrar transferência entre contas
  const registrarTransferencia = async (
    contaOrigemId: number,
    contaDestinoId: number,
    valor: number,
    data: string,
    descricao: string,
    observacao?: string
  ) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/financeiro/${user.empresaId}/transferencias`, {
      //   contaOrigemId,
      //   contaDestinoId,
      //   valor,
      //   data,
      //   descricao,
      //   observacao
      // });
      // const novaTransferencia = response.data;
      // setMovimentacoes(prev => [...prev, novaTransferencia]);
      // return novaTransferencia;
      
      // Por enquanto, simular resposta
      const novaTransferencia: MovimentacaoFinanceira = {
        id: Math.floor(Math.random() * 1000),
        tipo: 'transferencia',
        categoria: 'Transferência entre contas',
        valor,
        data,
        dataPagamento: data,
        status: 'pago',
        descricao,
        observacao,
        contaId: contaOrigemId
      };
      
      setMovimentacoes(prev => [...prev, novaTransferencia]);
      
      // Atualizar saldo das contas
      setContas(prev => 
        prev.map(c => {
          if (c.id === contaOrigemId) {
            return { ...c, saldoAtual: c.saldoAtual - valor };
          } else if (c.id === contaDestinoId) {
            return { ...c, saldoAtual: c.saldoAtual + valor };
          }
          return c;
        })
      );
      
      return novaTransferencia;
    } catch (err: any) {
      console.error('Erro ao registrar transferência:', err);
      setError(err.response?.data?.error || 'Erro ao registrar transferência');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Confirmar pagamento de uma movimentação pendente
  const confirmarPagamento = async (
    movimentacaoId: number,
    dataPagamento: string,
    formaPagamento: string,
    comprovante?: string
  ) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.put(`/financeiro/${user.empresaId}/movimentacoes/${movimentacaoId}/pagar`, {
      //   dataPagamento,
      //   formaPagamento,
      //   comprovante
      // });
      
      // Atualizar estado local
      const movimentacao = movimentacoes.find(m => m.id === movimentacaoId);
      
      if (!movimentacao) {
        setError('Movimentação não encontrada');
        return false;
      }
      
      setMovimentacoes(prev => 
        prev.map(m => {
          if (m.id === movimentacaoId) {
            return {
              ...m,
              dataPagamento,
              formaPagamento,
              comprovante,
              status: 'pago'
            };
          }
          return m;
        })
      );
      
      // Atualizar saldo da conta
      if (movimentacao.tipo === 'receita') {
        setContas(prev => 
          prev.map(c => c.id === movimentacao.contaId ? { ...c, saldoAtual: c.saldoAtual + movimentacao.valor } : c)
        );
      } else if (movimentacao.tipo === 'despesa') {
        setContas(prev => 
          prev.map(c => c.id === movimentacao.contaId ? { ...c, saldoAtual: c.saldoAtual - movimentacao.valor } : c)
        );
      }
      
      return true;
    } catch (err: any) {
      console.error('Erro ao confirmar pagamento:', err);
      setError(err.response?.data?.error || 'Erro ao confirmar pagamento');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancelar uma movimentação
  const cancelarMovimentacao = async (movimentacaoId: number, motivo?: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.put(`/financeiro/${user.empresaId}/movimentacoes/${movimentacaoId}/cancelar`, {
      //   motivo
      // });
      
      // Atualizar estado local
      const movimentacao = movimentacoes.find(m => m.id === movimentacaoId);
      
      if (!movimentacao) {
        setError('Movimentação não encontrada');
        return false;
      }
      
      // Se a movimentação já foi paga, restaurar o saldo da conta
      if (movimentacao.status === 'pago') {
        if (movimentacao.tipo === 'receita') {
          setContas(prev => 
            prev.map(c => c.id === movimentacao.contaId ? { ...c, saldoAtual: c.saldoAtual - movimentacao.valor } : c)
          );
        } else if (movimentacao.tipo === 'despesa') {
          setContas(prev => 
            prev.map(c => c.id === movimentacao.contaId ? { ...c, saldoAtual: c.saldoAtual + movimentacao.valor } : c)
          );
        }
      }
      
      setMovimentacoes(prev => 
        prev.map(m => {
          if (m.id === movimentacaoId) {
            return {
              ...m,
              status: 'cancelado',
              observacao: motivo ? `${m.observacao || ''} | Cancelado: ${motivo}` : m.observacao
            };
          }
          return m;
        })
      );
      
      return true;
    } catch (err: any) {
      console.error('Erro ao cancelar movimentação:', err);
      setError(err.response?.data?.error || 'Erro ao cancelar movimentação');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Obter saldo atual de uma conta
  const obterSaldoConta = (contaId: number) => {
    const conta = contas.find(c => c.id === contaId);
    return conta ? conta.saldoAtual : 0;
  };
  
  // Obter saldo total de todas as contas
  const obterSaldoTotal = () => {
    return contas.reduce((total, conta) => total + conta.saldoAtual, 0);
  };
  
  // Carregar dados iniciais quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      carregarContas();
      carregarMovimentacoes();
    }
  }, [user]);
  
  return {
    movimentacoes,
    contas,
    isLoading,
    error,
    carregarContas,
    carregarMovimentacoes,
    adicionarConta,
    atualizarConta,
    excluirConta,
    registrarReceita,
    registrarDespesa,
    registrarTransferencia,
    confirmarPagamento,
    cancelarMovimentacao,
    obterSaldoConta,
    obterSaldoTotal
  };
};
