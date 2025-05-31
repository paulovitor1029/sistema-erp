import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/context/AuthContext';

// Tipos para relatórios
export interface RelatorioConfig {
  id: number;
  nome: string;
  tipo: 'vendas' | 'estoque' | 'financeiro' | 'clientes' | 'produtos' | 'fiscal';
  descricao: string;
  filtros: Record<string, any>;
  colunas: string[];
  ordenacao: string;
  agrupamento?: string;
  formato: 'tabela' | 'grafico';
  tipoGrafico?: 'barra' | 'linha' | 'pizza' | 'area';
  compartilhado: boolean;
  usuarioId: number;
}

export interface DadosRelatorio {
  colunas: string[];
  dados: any[];
  totais?: Record<string, any>;
  grafico?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string;
    }[];
  };
}

// Hook para gerenciar relatórios
export const useRelatorios = () => {
  const { token, user } = useAuth();
  
  // Estados
  const [relatoriosConfig, setRelatoriosConfig] = useState<RelatorioConfig[]>([]);
  const [dadosRelatorio, setDadosRelatorio] = useState<DadosRelatorio | null>(null);
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
  
  // Carregar configurações de relatórios
  const carregarRelatoriosConfig = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/relatorios/${user.empresaId}/config`);
      // setRelatoriosConfig(response.data);
      
      // Por enquanto, retornar array vazio (sem dados mockados)
      setRelatoriosConfig([]);
    } catch (err: any) {
      console.error('Erro ao carregar configurações de relatórios:', err);
      setError(err.response?.data?.error || 'Erro ao carregar configurações de relatórios');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar dados de um relatório
  const carregarDadosRelatorio = async (
    relatorioId?: number,
    filtros?: Record<string, any>,
    tipo?: string,
    colunas?: string[],
    ordenacao?: string,
    agrupamento?: string,
    formato?: string
  ) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setDadosRelatorio(null);
    
    try {
      // No futuro, isso virá da API
      // const params: any = {};
      // 
      // if (relatorioId) {
      //   params.relatorioId = relatorioId;
      // } else {
      //   params.tipo = tipo;
      //   params.colunas = colunas?.join(',');
      //   params.ordenacao = ordenacao;
      //   params.agrupamento = agrupamento;
      //   params.formato = formato;
      //   params.filtros = JSON.stringify(filtros);
      // }
      // 
      // const response = await api.get(`/relatorios/${user.empresaId}/dados`, { params });
      // setDadosRelatorio(response.data);
      
      // Por enquanto, retornar dados vazios (sem dados mockados)
      setDadosRelatorio({
        colunas: [],
        dados: []
      });
    } catch (err: any) {
      console.error('Erro ao carregar dados do relatório:', err);
      setError(err.response?.data?.error || 'Erro ao carregar dados do relatório');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Salvar configuração de relatório
  const salvarRelatorioConfig = async (config: Omit<RelatorioConfig, 'id' | 'usuarioId'>) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // const response = await api.post(`/relatorios/${user.empresaId}/config`, config);
      // const novaConfig = response.data;
      // setRelatoriosConfig(prev => [...prev, novaConfig]);
      // return novaConfig;
      
      // Por enquanto, simular resposta
      const novaConfig: RelatorioConfig = {
        ...config,
        id: Math.floor(Math.random() * 1000),
        usuarioId: user.id
      };
      
      setRelatoriosConfig(prev => [...prev, novaConfig]);
      return novaConfig;
    } catch (err: any) {
      console.error('Erro ao salvar configuração de relatório:', err);
      setError(err.response?.data?.error || 'Erro ao salvar configuração de relatório');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Atualizar configuração de relatório
  const atualizarRelatorioConfig = async (id: number, config: Partial<RelatorioConfig>) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.put(`/relatorios/${user.empresaId}/config/${id}`, config);
      
      // Atualizar estado local
      setRelatoriosConfig(prev => 
        prev.map(r => r.id === id ? { ...r, ...config } : r)
      );
      
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar configuração de relatório:', err);
      setError(err.response?.data?.error || 'Erro ao atualizar configuração de relatório');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Excluir configuração de relatório
  const excluirRelatorioConfig = async (id: number) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.delete(`/relatorios/${user.empresaId}/config/${id}`);
      
      // Atualizar estado local
      setRelatoriosConfig(prev => prev.filter(r => r.id !== id));
      
      return true;
    } catch (err: any) {
      console.error('Erro ao excluir configuração de relatório:', err);
      setError(err.response?.data?.error || 'Erro ao excluir configuração de relatório');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Exportar relatório
  const exportarRelatorio = async (
    formato: 'pdf' | 'excel' | 'csv',
    relatorioId?: number,
    filtros?: Record<string, any>,
    tipo?: string,
    colunas?: string[],
    ordenacao?: string,
    agrupamento?: string
  ) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const params: any = {
      //   formato
      // };
      // 
      // if (relatorioId) {
      //   params.relatorioId = relatorioId;
      // } else {
      //   params.tipo = tipo;
      //   params.colunas = colunas?.join(',');
      //   params.ordenacao = ordenacao;
      //   params.agrupamento = agrupamento;
      //   params.filtros = JSON.stringify(filtros);
      // }
      // 
      // const response = await api.get(`/relatorios/${user.empresaId}/exportar`, {
      //   params,
      //   responseType: 'blob'
      // });
      // 
      // // Criar URL para download
      // const blob = new Blob([response.data], {
      //   type: formato === 'pdf' ? 'application/pdf' : 
      //         formato === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
      //         'text/csv'
      // });
      // 
      // const url = window.URL.createObjectURL(blob);
      // return url;
      
      // Por enquanto, retornar null (sem dados mockados)
      return null;
    } catch (err: any) {
      console.error('Erro ao exportar relatório:', err);
      setError(err.response?.data?.error || 'Erro ao exportar relatório');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Obter metadados para construção de relatórios
  const obterMetadados = async (tipo: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // No futuro, isso virá da API
      // const response = await api.get(`/relatorios/${user.empresaId}/metadados/${tipo}`);
      // return response.data;
      
      // Por enquanto, retornar dados básicos para cada tipo
      const metadados: Record<string, any> = {
        vendas: {
          colunas: [
            { id: 'id', nome: 'ID', tipo: 'numero' },
            { id: 'data', nome: 'Data', tipo: 'data' },
            { id: 'cliente', nome: 'Cliente', tipo: 'texto' },
            { id: 'valor', nome: 'Valor', tipo: 'moeda' },
            { id: 'status', nome: 'Status', tipo: 'texto' }
          ],
          filtros: [
            { id: 'dataInicio', nome: 'Data Início', tipo: 'data' },
            { id: 'dataFim', nome: 'Data Fim', tipo: 'data' },
            { id: 'clienteId', nome: 'Cliente', tipo: 'selecao' },
            { id: 'status', nome: 'Status', tipo: 'selecao' }
          ],
          agrupamentos: [
            { id: 'data', nome: 'Data' },
            { id: 'cliente', nome: 'Cliente' },
            { id: 'status', nome: 'Status' }
          ]
        },
        estoque: {
          colunas: [
            { id: 'id', nome: 'ID', tipo: 'numero' },
            { id: 'produto', nome: 'Produto', tipo: 'texto' },
            { id: 'quantidade', nome: 'Quantidade', tipo: 'numero' },
            { id: 'tipo', nome: 'Tipo', tipo: 'texto' },
            { id: 'data', nome: 'Data', tipo: 'data' }
          ],
          filtros: [
            { id: 'dataInicio', nome: 'Data Início', tipo: 'data' },
            { id: 'dataFim', nome: 'Data Fim', tipo: 'data' },
            { id: 'produtoId', nome: 'Produto', tipo: 'selecao' },
            { id: 'tipo', nome: 'Tipo', tipo: 'selecao' }
          ],
          agrupamentos: [
            { id: 'data', nome: 'Data' },
            { id: 'produto', nome: 'Produto' },
            { id: 'tipo', nome: 'Tipo' }
          ]
        },
        financeiro: {
          colunas: [
            { id: 'id', nome: 'ID', tipo: 'numero' },
            { id: 'data', nome: 'Data', tipo: 'data' },
            { id: 'tipo', nome: 'Tipo', tipo: 'texto' },
            { id: 'categoria', nome: 'Categoria', tipo: 'texto' },
            { id: 'valor', nome: 'Valor', tipo: 'moeda' },
            { id: 'status', nome: 'Status', tipo: 'texto' }
          ],
          filtros: [
            { id: 'dataInicio', nome: 'Data Início', tipo: 'data' },
            { id: 'dataFim', nome: 'Data Fim', tipo: 'data' },
            { id: 'tipo', nome: 'Tipo', tipo: 'selecao' },
            { id: 'categoria', nome: 'Categoria', tipo: 'selecao' },
            { id: 'status', nome: 'Status', tipo: 'selecao' }
          ],
          agrupamentos: [
            { id: 'data', nome: 'Data' },
            { id: 'tipo', nome: 'Tipo' },
            { id: 'categoria', nome: 'Categoria' },
            { id: 'status', nome: 'Status' }
          ]
        }
      };
      
      return metadados[tipo] || null;
    } catch (err: any) {
      console.error('Erro ao obter metadados:', err);
      setError(err.response?.data?.error || 'Erro ao obter metadados');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar dados iniciais quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      carregarRelatoriosConfig();
    }
  }, [user]);
  
  return {
    relatoriosConfig,
    dadosRelatorio,
    isLoading,
    error,
    carregarRelatoriosConfig,
    carregarDadosRelatorio,
    salvarRelatorioConfig,
    atualizarRelatorioConfig,
    excluirRelatorioConfig,
    exportarRelatorio,
    obterMetadados
  };
};
