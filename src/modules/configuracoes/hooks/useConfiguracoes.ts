import { useState, useEffect } from 'react';

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  ativa: boolean;
}

export interface FormaPagamento {
  id: number;
  nome: string;
  tipo: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto' | 'transferencia' | 'outro';
  taxa: number;
  ativa: boolean;
  prazoRecebimento: number;
  observacoes?: string;
}

export interface DadosEmpresa {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  contato: {
    telefone: string;
    celular?: string;
    email: string;
    site?: string;
  };
  logo?: string;
  regimeTributario: 'simples' | 'lucro_presumido' | 'lucro_real';
}

export interface ConfiguracaoFiscal {
  certificadoDigital?: {
    arquivo: string;
    senha: string;
    validade: string;
  };
  sat?: {
    modelo: string;
    codigoAtivacao: string;
    signAC: string;
  };
  nfce: {
    serie: string;
    numeroInicial: number;
    ambiente: 'producao' | 'homologacao';
  };
  impressoraFiscal: {
    modelo: string;
    porta: string;
    velocidade: number;
  };
}

export interface ConfiguracaoSistema {
  backupAutomatico: boolean;
  intervaloBackup: number;
  localBackup: string;
  tema: 'claro' | 'escuro' | 'sistema';
  decimaisValor: number;
  decimaisQuantidade: number;
  alertaEstoqueMinimo: boolean;
  alertaValidadeProdutos: boolean;
  diasAlertaValidade: number;
}

export const useConfiguracoes = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [dadosEmpresa, setDadosEmpresa] = useState<DadosEmpresa | null>(null);
  const [configuracaoFiscal, setConfiguracaoFiscal] = useState<ConfiguracaoFiscal | null>(null);
  const [configuracaoSistema, setConfiguracaoSistema] = useState<ConfiguracaoSistema | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Inicializa com array vazio em vez de dados mockados
      setCategorias([]);
    } catch (err) {
      setError('Erro ao carregar categorias');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFormasPagamento = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Inicializa com array vazio em vez de dados mockados
      setFormasPagamento([]);
    } catch (err) {
      setError('Erro ao carregar formas de pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDadosEmpresa = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Inicializa com null em vez de dados mockados
      setDadosEmpresa(null);
    } catch (err) {
      setError('Erro ao carregar dados da empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfiguracaoFiscal = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Inicializa com null em vez de dados mockados
      setConfiguracaoFiscal(null);
    } catch (err) {
      setError('Erro ao carregar configuração fiscal');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfiguracaoSistema = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Inicializa com null em vez de dados mockados
      setConfiguracaoSistema(null);
    } catch (err) {
      setError('Erro ao carregar configuração do sistema');
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarCategoria = async (categoria: Omit<Categoria, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const novaCategoria: Categoria = {
        ...categoria,
        id: Math.max(...categorias.map(c => c.id), 0) + 1
      };
      
      setCategorias([...categorias, novaCategoria]);
      return novaCategoria;
    } catch (err) {
      setError('Erro ao adicionar categoria');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarCategoria = async (id: number, categoria: Partial<Categoria>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCategorias(categorias.map(c => 
        c.id === id ? { ...c, ...categoria } : c
      ));
      
      return true;
    } catch (err) {
      setError('Erro ao atualizar categoria');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const excluirCategoria = async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCategorias(categorias.filter(c => c.id !== id));
      
      return true;
    } catch (err) {
      setError('Erro ao excluir categoria');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarFormaPagamento = async (formaPagamento: Omit<FormaPagamento, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const novaFormaPagamento: FormaPagamento = {
        ...formaPagamento,
        id: Math.max(...formasPagamento.map(f => f.id), 0) + 1
      };
      
      setFormasPagamento([...formasPagamento, novaFormaPagamento]);
      return novaFormaPagamento;
    } catch (err) {
      setError('Erro ao adicionar forma de pagamento');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarFormaPagamento = async (id: number, formaPagamento: Partial<FormaPagamento>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFormasPagamento(formasPagamento.map(f => 
        f.id === id ? { ...f, ...formaPagamento } : f
      ));
      
      return true;
    } catch (err) {
      setError('Erro ao atualizar forma de pagamento');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const excluirFormaPagamento = async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFormasPagamento(formasPagamento.filter(f => f.id !== id));
      
      return true;
    } catch (err) {
      setError('Erro ao excluir forma de pagamento');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarDadosEmpresa = async (dados: DadosEmpresa) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDadosEmpresa(dados);
      
      return true;
    } catch (err) {
      setError('Erro ao atualizar dados da empresa');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarConfiguracaoFiscal = async (config: ConfiguracaoFiscal) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setConfiguracaoFiscal(config);
      
      return true;
    } catch (err) {
      setError('Erro ao atualizar configuração fiscal');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarConfiguracaoSistema = async (config: ConfiguracaoSistema) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setConfiguracaoSistema(config);
      
      return true;
    } catch (err) {
      setError('Erro ao atualizar configuração do sistema');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
    fetchFormasPagamento();
    fetchDadosEmpresa();
    fetchConfiguracaoFiscal();
    fetchConfiguracaoSistema();
  }, []);

  return {
    categorias,
    formasPagamento,
    dadosEmpresa,
    configuracaoFiscal,
    configuracaoSistema,
    isLoading,
    error,
    adicionarCategoria,
    atualizarCategoria,
    excluirCategoria,
    adicionarFormaPagamento,
    atualizarFormaPagamento,
    excluirFormaPagamento,
    atualizarDadosEmpresa,
    atualizarConfiguracaoFiscal,
    atualizarConfiguracaoSistema,
    recarregarCategorias: fetchCategorias,
    recarregarFormasPagamento: fetchFormasPagamento,
    recarregarDadosEmpresa: fetchDadosEmpresa,
    recarregarConfiguracaoFiscal: fetchConfiguracaoFiscal,
    recarregarConfiguracaoSistema: fetchConfiguracaoSistema
  };
};
