import React, { useState, useEffect } from 'react';
import { useConfig, TipoNegocio, ModulosConfig } from '../context/ConfigContext';
import { useAuth } from '../../auth/context/AuthContext';

const ConfiguracoesPage: React.FC = () => {
  const { config, setTipoNegocio, ativarModulo, desativarModulo, isLoading } = useConfig();
  const { user, hasPermission } = useAuth();
  
  const [dadosEmpresa, setDadosEmpresa] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    logo: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Carregar dados da empresa
  useEffect(() => {
    if (user && !isLoading) {
      // No futuro, isso virá da API
      setDadosEmpresa({
        nome: config.nome,
        cnpj: '',
        email: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        logo: ''
      });
    }
  }, [user, config, isLoading]);
  
  // Função para alterar tipo de negócio
  const handleChangeTipoNegocio = (tipo: TipoNegocio) => {
    if (!hasPermission('admin')) {
      setSaveMessage({
        type: 'error',
        text: 'Você não tem permissão para alterar o tipo de negócio'
      });
      return;
    }
    
    setTipoNegocio(tipo);
    setSaveMessage({
      type: 'success',
      text: `Tipo de negócio alterado para ${getTipoNegocioLabel(tipo)}`
    });
  };
  
  // Função para alternar estado de um módulo
  const handleToggleModulo = (modulo: keyof ModulosConfig) => {
    if (!hasPermission('admin')) {
      setSaveMessage({
        type: 'error',
        text: 'Você não tem permissão para ativar/desativar módulos'
      });
      return;
    }
    
    if (config.modulos[modulo]) {
      desativarModulo(modulo);
    } else {
      ativarModulo(modulo);
    }
    
    setSaveMessage({
      type: 'success',
      text: `Módulo ${getModuloLabel(modulo)} ${config.modulos[modulo] ? 'desativado' : 'ativado'}`
    });
  };
  
  // Função para salvar dados da empresa
  const handleSaveEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('admin')) {
      setSaveMessage({
        type: 'error',
        text: 'Você não tem permissão para alterar dados da empresa'
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // No futuro, isso será enviado para a API
      // await api.put(`/config/${user.empresaId}`, { ...dadosEmpresa });
      
      setSaveMessage({
        type: 'success',
        text: 'Dados da empresa salvos com sucesso'
      });
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Erro ao salvar dados da empresa'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Função para obter label do tipo de negócio
  const getTipoNegocioLabel = (tipo: TipoNegocio): string => {
    const labels = {
      comercio: 'Comércio',
      servico: 'Prestação de Serviços',
      industria: 'Indústria',
      misto: 'Misto (Produtos e Serviços)'
    };
    
    return labels[tipo];
  };
  
  // Função para obter label do módulo
  const getModuloLabel = (modulo: keyof ModulosConfig): string => {
    const labels: Record<keyof ModulosConfig, string> = {
      produtos: 'Produtos',
      servicos: 'Serviços',
      estoque: 'Estoque',
      pdv: 'PDV',
      promocoes: 'Promoções',
      fiscal: 'Emissão Fiscal',
      ponto: 'Controle de Ponto'
    };
    
    return labels[modulo];
  };
  
  // Função para obter descrição do módulo
  const getModuloDescricao = (modulo: keyof ModulosConfig): string => {
    const descricoes: Record<keyof ModulosConfig, string> = {
      produtos: 'Cadastro e gerenciamento de produtos físicos',
      servicos: 'Cadastro e gerenciamento de serviços prestados',
      estoque: 'Controle de estoque, entradas, saídas e inventário',
      pdv: 'Ponto de Venda para produtos e/ou serviços',
      promocoes: 'Gerenciamento de descontos e promoções',
      fiscal: 'Emissão de notas fiscais (NF-e e NFS-e)',
      ponto: 'Registro de ponto de funcionários'
    };
    
    return descricoes[modulo];
  };
  
  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="text-3xl font-bold mb-8">Configurações do Sistema</h1>
      
      {saveMessage && (
        <div className={`p-4 mb-6 rounded-md ${saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {saveMessage.text}
        </div>
      )}
      
      {/* Tipo de Negócio */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Tipo de Negócio</h2>
        <p className="text-gray-600 mb-4">
          Selecione o tipo de negócio da sua empresa. Isso ajustará automaticamente os módulos disponíveis e a interface do sistema.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['comercio', 'servico', 'industria', 'misto'] as TipoNegocio[]).map((tipo) => (
            <div
              key={tipo}
              onClick={() => handleChangeTipoNegocio(tipo)}
              className={`p-4 border rounded-md cursor-pointer transition-colors ${
                config.tipoNegocio === tipo
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="font-medium">{getTipoNegocioLabel(tipo)}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Módulos Ativos */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Módulos Ativos</h2>
        <p className="text-gray-600 mb-4">
          Ative ou desative os módulos conforme as necessidades da sua empresa.
        </p>
        
        <div className="space-y-4">
          {(Object.keys(config.modulos) as Array<keyof ModulosConfig>).map((modulo) => (
            <div key={modulo} className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <div className="font-medium">{getModuloLabel(modulo)}</div>
                <div className="text-sm text-gray-600">{getModuloDescricao(modulo)}</div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={config.modulos[modulo]}
                  onChange={() => handleToggleModulo(modulo)}
                  disabled={!hasPermission('admin')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dados da Empresa */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Dados da Empresa</h2>
        
        <form onSubmit={handleSaveEmpresa}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Empresa
              </label>
              <input
                type="text"
                id="nome"
                value={dadosEmpresa.nome}
                onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ
              </label>
              <input
                type="text"
                id="cnpj"
                value={dadosEmpresa.cnpj}
                onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, cnpj: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={dadosEmpresa.email}
                onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                id="telefone"
                value={dadosEmpresa.telefone}
                onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, telefone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                id="endereco"
                value={dadosEmpresa.endereco}
                onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, endereco: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                id="cidade"
                value={dadosEmpresa.cidade}
                onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, cidade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <input
                type="text"
                id="estado"
                value={dadosEmpresa.estado}
                onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, estado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <input
                type="text"
                id="cep"
                value={dadosEmpresa.cep}
                onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, cep: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                Logo (URL)
              </label>
              <input
                type="text"
                id="logo"
                value={dadosEmpresa.logo}
                onChange={(e) => setDadosEmpresa({ ...dadosEmpresa, logo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              disabled={isSaving || !hasPermission('admin')}
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfiguracoesPage;
