import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/context/AuthContext';

// Tipos para documentos fiscais
export interface NotaFiscal {
  id: number;
  tipo: 'entrada' | 'saida';
  modelo: 'nfe' | 'nfce' | 'nfse';
  numero: string;
  serie: string;
  chave?: string;
  dataEmissao: string;
  dataAutorizacao?: string;
  valor: number;
  status: 'rascunho' | 'emitida' | 'autorizada' | 'cancelada' | 'rejeitada';
  xml?: string;
  pdf?: string;
  observacao?: string;
  vendaId?: number;
  clienteId?: number;
  fornecedorId?: number;
}

export interface ConfiguracaoFiscal {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal?: string;
  regimeTributario: 'simples' | 'presumido' | 'real';
  ambiente: 'homologacao' | 'producao';
  certificadoDigital?: string;
  senhaCertificado?: string;
  validadeCertificado?: string;
  serieNFe: string;
  serieNFCe: string;
  proximoNumeroNFe: number;
  proximoNumeroNFCe: number;
  proximoNumeroNFSe: number;
  csc?: string;
  idCsc?: string;
  tokenIBPT?: string;
  ativo: boolean;
}

// Hook para gerenciar documentos fiscais
export const useFiscal = () => {
  const { token, user } = useAuth();
  
  // Estados
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);
  const [configuracaoFiscal, setConfiguracaoFiscal] = useState<ConfiguracaoFiscal | null>(null);
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
  
  // Carregar configuração fiscal
  const carregarConfiguracaoFiscal = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/fiscal/${user.empresaId}/configuracao`);
      // setConfiguracaoFiscal(response.data);
      
      // Por enquanto, retornar null (sem dados mockados)
      setConfiguracaoFiscal(null);
    } catch (err: any) {
      console.error('Erro ao carregar configuração fiscal:', err);
      setError(err.response?.data?.error || 'Erro ao carregar configuração fiscal');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar notas fiscais
  const carregarNotasFiscais = async (filtros?: {
    tipo?: string;
    modelo?: string;
    status?: string;
    dataInicio?: string;
    dataFim?: string;
    clienteId?: number;
    fornecedorId?: number;
  }) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/fiscal/${user.empresaId}/notas`, {
      //   params: filtros
      // });
      // setNotasFiscais(response.data);
      
      // Por enquanto, retornar array vazio (sem dados mockados)
      setNotasFiscais([]);
    } catch (err: any) {
      console.error('Erro ao carregar notas fiscais:', err);
      setError(err.response?.data?.error || 'Erro ao carregar notas fiscais');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Salvar configuração fiscal
  const salvarConfiguracaoFiscal = async (config: Omit<ConfiguracaoFiscal, 'id'>) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/fiscal/${user.empresaId}/configuracao`, config);
      // const novaConfig = response.data;
      // setConfiguracaoFiscal(novaConfig);
      // return novaConfig;
      
      // Por enquanto, simular resposta
      const novaConfig: ConfiguracaoFiscal = {
        ...config,
        id: 1
      };
      
      setConfiguracaoFiscal(novaConfig);
      return novaConfig;
    } catch (err: any) {
      console.error('Erro ao salvar configuração fiscal:', err);
      setError(err.response?.data?.error || 'Erro ao salvar configuração fiscal');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Atualizar configuração fiscal
  const atualizarConfiguracaoFiscal = async (config: Partial<ConfiguracaoFiscal>) => {
    if (!user || !configuracaoFiscal) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.put(`/fiscal/${user.empresaId}/configuracao/${configuracaoFiscal.id}`, config);
      
      // Atualizar estado local
      setConfiguracaoFiscal(prev => prev ? { ...prev, ...config } : null);
      
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar configuração fiscal:', err);
      setError(err.response?.data?.error || 'Erro ao atualizar configuração fiscal');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Emitir nota fiscal de venda
  const emitirNotaFiscalVenda = async (vendaId: number, observacao?: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/fiscal/${user.empresaId}/emitir/venda/${vendaId}`, {
      //   observacao
      // });
      // const novaNota = response.data;
      // setNotasFiscais(prev => [...prev, novaNota]);
      // return novaNota;
      
      // Por enquanto, simular resposta
      const novaNota: NotaFiscal = {
        id: Math.floor(Math.random() * 1000),
        tipo: 'saida',
        modelo: 'nfe',
        numero: '000000001',
        serie: '1',
        dataEmissao: new Date().toISOString(),
        valor: 0,
        status: 'rascunho',
        observacao,
        vendaId
      };
      
      setNotasFiscais(prev => [...prev, novaNota]);
      return novaNota;
    } catch (err: any) {
      console.error('Erro ao emitir nota fiscal:', err);
      setError(err.response?.data?.error || 'Erro ao emitir nota fiscal');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Emitir nota fiscal de entrada (compra)
  const emitirNotaFiscalEntrada = async (
    fornecedorId: number,
    valor: number,
    dataEmissao: string,
    numero: string,
    serie: string,
    chave?: string,
    observacao?: string
  ) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/fiscal/${user.empresaId}/entrada`, {
      //   fornecedorId,
      //   valor,
      //   dataEmissao,
      //   numero,
      //   serie,
      //   chave,
      //   observacao
      // });
      // const novaNota = response.data;
      // setNotasFiscais(prev => [...prev, novaNota]);
      // return novaNota;
      
      // Por enquanto, simular resposta
      const novaNota: NotaFiscal = {
        id: Math.floor(Math.random() * 1000),
        tipo: 'entrada',
        modelo: 'nfe',
        numero,
        serie,
        chave,
        dataEmissao,
        valor,
        status: 'autorizada',
        observacao,
        fornecedorId
      };
      
      setNotasFiscais(prev => [...prev, novaNota]);
      return novaNota;
    } catch (err: any) {
      console.error('Erro ao registrar nota fiscal de entrada:', err);
      setError(err.response?.data?.error || 'Erro ao registrar nota fiscal de entrada');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancelar nota fiscal
  const cancelarNotaFiscal = async (notaId: number, justificativa: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.post(`/fiscal/${user.empresaId}/notas/${notaId}/cancelar`, {
      //   justificativa
      // });
      
      // Atualizar estado local
      setNotasFiscais(prev => 
        prev.map(nota => {
          if (nota.id === notaId) {
            return {
              ...nota,
              status: 'cancelada',
              observacao: `${nota.observacao || ''} | Cancelada: ${justificativa}`
            };
          }
          return nota;
        })
      );
      
      return true;
    } catch (err: any) {
      console.error('Erro ao cancelar nota fiscal:', err);
      setError(err.response?.data?.error || 'Erro ao cancelar nota fiscal');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Obter XML da nota fiscal
  const obterXmlNotaFiscal = async (notaId: number) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/fiscal/${user.empresaId}/notas/${notaId}/xml`);
      // return response.data;
      
      // Por enquanto, retornar null (sem dados mockados)
      return null;
    } catch (err: any) {
      console.error('Erro ao obter XML da nota fiscal:', err);
      setError(err.response?.data?.error || 'Erro ao obter XML da nota fiscal');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Obter DANFE da nota fiscal
  const obterDanfeNotaFiscal = async (notaId: number) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/fiscal/${user.empresaId}/notas/${notaId}/danfe`);
      // return response.data;
      
      // Por enquanto, retornar null (sem dados mockados)
      return null;
    } catch (err: any) {
      console.error('Erro ao obter DANFE da nota fiscal:', err);
      setError(err.response?.data?.error || 'Erro ao obter DANFE da nota fiscal');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar dados iniciais quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      carregarConfiguracaoFiscal();
      carregarNotasFiscais();
    }
  }, [user]);
  
  return {
    notasFiscais,
    configuracaoFiscal,
    isLoading,
    error,
    carregarConfiguracaoFiscal,
    carregarNotasFiscais,
    salvarConfiguracaoFiscal,
    atualizarConfiguracaoFiscal,
    emitirNotaFiscalVenda,
    emitirNotaFiscalEntrada,
    cancelarNotaFiscal,
    obterXmlNotaFiscal,
    obterDanfeNotaFiscal
  };
};
