import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfiguracoes, Categoria, FormaPagamento } from '../hooks/useConfiguracoes';
import { useAuth } from '../../auth/context/AuthContext';

const ConfiguracoesPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { 
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
    recarregarCategorias,
    recarregarFormasPagamento,
    recarregarDadosEmpresa,
    recarregarConfiguracaoFiscal,
    recarregarConfiguracaoSistema
  } = useConfiguracoes();
  
  const [activeTab, setActiveTab] = useState('empresa');
  
  // Estado para nova categoria
  const [novaCategoria, setNovaCategoria] = useState<Omit<Categoria, 'id'>>({
    nome: '',
    descricao: '',
    ativa: true
  });
  
  // Estado para nova forma de pagamento
  const [novaFormaPagamento, setNovaFormaPagamento] = useState<Omit<FormaPagamento, 'id'>>({
    nome: '',
    tipo: 'dinheiro',
    taxa: 0,
    ativa: true,
    prazoRecebimento: 0,
    observacoes: ''
  });
  
  // Estado para edição de categoria
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  
  // Estado para edição de forma de pagamento
  const [formaPagamentoEditando, setFormaPagamentoEditando] = useState<FormaPagamento | null>(null);
  
  // Estado para dados da empresa
  const [empresaForm, setEmpresaForm] = useState(dadosEmpresa || {
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    contato: {
      telefone: '',
      celular: '',
      email: '',
      site: ''
    },
    regimeTributario: 'simples' as 'simples' | 'lucro_presumido' | 'lucro_real'
  });
  
  // Estado para configuração fiscal
  const [fiscalForm, setFiscalForm] = useState(configuracaoFiscal || {
    certificadoDigital: {
      arquivo: '',
      senha: '',
      validade: ''
    },
    sat: {
      modelo: '',
      codigoAtivacao: '',
      signAC: ''
    },
    nfce: {
      serie: '',
      numeroInicial: 1,
      ambiente: 'homologacao' as 'producao' | 'homologacao'
    },
    impressoraFiscal: {
      modelo: '',
      porta: '',
      velocidade: 9600
    }
  });
  
  // Estado para configuração do sistema
  const [sistemaForm, setSistemaForm] = useState(configuracaoSistema || {
    backupAutomatico: true,
    intervaloBackup: 24,
    localBackup: '/backup',
    tema: 'claro' as 'claro' | 'escuro' | 'sistema',
    decimaisValor: 2,
    decimaisQuantidade: 3,
    alertaEstoqueMinimo: true,
    alertaValidadeProdutos: true,
    diasAlertaValidade: 30
  });
  
  const handleAdicionarCategoria = async () => {
    if (!novaCategoria.nome) {
      alert('O nome da categoria é obrigatório');
      return;
    }
    
    const resultado = await adicionarCategoria(novaCategoria);
    
    if (resultado) {
      setNovaCategoria({
        nome: '',
        descricao: '',
        ativa: true
      });
      recarregarCategorias();
    }
  };
  
  const handleAtualizarCategoria = async () => {
    if (!categoriaEditando) return;
    
    if (!categoriaEditando.nome) {
      alert('O nome da categoria é obrigatório');
      return;
    }
    
    const resultado = await atualizarCategoria(categoriaEditando.id, categoriaEditando);
    
    if (resultado) {
      setCategoriaEditando(null);
      recarregarCategorias();
    }
  };
  
  const handleExcluirCategoria = async (id: number) => {
    if (!hasPermission('gerente')) {
      alert('Você não tem permissão para excluir categorias');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.')) {
      const resultado = await excluirCategoria(id);
      
      if (resultado) {
        recarregarCategorias();
      }
    }
  };
  
  const handleAdicionarFormaPagamento = async () => {
    if (!novaFormaPagamento.nome) {
      alert('O nome da forma de pagamento é obrigatório');
      return;
    }
    
    const resultado = await adicionarFormaPagamento(novaFormaPagamento);
    
    if (resultado) {
      setNovaFormaPagamento({
        nome: '',
        tipo: 'dinheiro',
        taxa: 0,
        ativa: true,
        prazoRecebimento: 0,
        observacoes: ''
      });
      recarregarFormasPagamento();
    }
  };
  
  const handleAtualizarFormaPagamento = async () => {
    if (!formaPagamentoEditando) return;
    
    if (!formaPagamentoEditando.nome) {
      alert('O nome da forma de pagamento é obrigatório');
      return;
    }
    
    const resultado = await atualizarFormaPagamento(formaPagamentoEditando.id, formaPagamentoEditando);
    
    if (resultado) {
      setFormaPagamentoEditando(null);
      recarregarFormasPagamento();
    }
  };
  
  const handleExcluirFormaPagamento = async (id: number) => {
    if (!hasPermission('gerente')) {
      alert('Você não tem permissão para excluir formas de pagamento');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir esta forma de pagamento? Esta ação não pode ser desfeita.')) {
      const resultado = await excluirFormaPagamento(id);
      
      if (resultado) {
        recarregarFormasPagamento();
      }
    }
  };
  
  const handleSalvarDadosEmpresa = async () => {
    if (!empresaForm.razaoSocial || !empresaForm.nomeFantasia || !empresaForm.cnpj) {
      alert('Razão Social, Nome Fantasia e CNPJ são obrigatórios');
      return;
    }
    
    const resultado = await atualizarDadosEmpresa(empresaForm);
    
    if (resultado) {
      alert('Dados da empresa salvos com sucesso!');
      recarregarDadosEmpresa();
    }
  };
  
  const handleSalvarConfiguracaoFiscal = async () => {
    const resultado = await atualizarConfiguracaoFiscal(fiscalForm);
    
    if (resultado) {
      alert('Configuração fiscal salva com sucesso!');
      recarregarConfiguracaoFiscal();
    }
  };
  
  const handleSalvarConfiguracaoSistema = async () => {
    const resultado = await atualizarConfiguracaoSistema(sistemaForm);
    
    if (resultado) {
      alert('Configuração do sistema salva com sucesso!');
      recarregarConfiguracaoSistema();
    }
  };
  
  // Componente de configuração de dados da empresa
  const TabEmpresa = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Dados da Empresa</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="razaoSocial" className="block text-sm font-medium text-gray-700 mb-1">
                Razão Social *
              </label>
              <input
                type="text"
                id="razaoSocial"
                value={empresaForm.razaoSocial}
                onChange={(e) => setEmpresaForm({...empresaForm, razaoSocial: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="nomeFantasia" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Fantasia *
              </label>
              <input
                type="text"
                id="nomeFantasia"
                value={empresaForm.nomeFantasia}
                onChange={(e) => setEmpresaForm({...empresaForm, nomeFantasia: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ *
              </label>
              <input
                type="text"
                id="cnpj"
                value={empresaForm.cnpj}
                onChange={(e) => setEmpresaForm({...empresaForm, cnpj: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00.000.000/0000-00"
                required
              />
            </div>
            
            <div>
              <label htmlFor="regimeTributario" className="block text-sm font-medium text-gray-700 mb-1">
                Regime Tributário *
              </label>
              <select
                id="regimeTributario"
                value={empresaForm.regimeTributario}
                onChange={(e) => setEmpresaForm({...empresaForm, regimeTributario: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="simples">Simples Nacional</option>
                <option value="lucro_presumido">Lucro Presumido</option>
                <option value="lucro_real">Lucro Real</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="inscricaoEstadual" className="block text-sm font-medium text-gray-700 mb-1">
                Inscrição Estadual
              </label>
              <input
                type="text"
                id="inscricaoEstadual"
                value={empresaForm.inscricaoEstadual}
                onChange={(e) => setEmpresaForm({...empresaForm, inscricaoEstadual: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="inscricaoMunicipal" className="block text-sm font-medium text-gray-700 mb-1">
                Inscrição Municipal
              </label>
              <input
                type="text"
                id="inscricaoMunicipal"
                value={empresaForm.inscricaoMunicipal}
                onChange={(e) => setEmpresaForm({...empresaForm, inscricaoMunicipal: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-3">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="logradouro" className="block text-sm font-medium text-gray-700 mb-1">
                Logradouro *
              </label>
              <input
                type="text"
                id="logradouro"
                value={empresaForm.endereco.logradouro}
                onChange={(e) => setEmpresaForm({
                  ...empresaForm, 
                  endereco: {...empresaForm.endereco, logradouro: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
                Número *
              </label>
              <input
                type="text"
                id="numero"
                value={empresaForm.endereco.numero}
                onChange={(e) => setEmpresaForm({
                  ...empresaForm, 
                  endereco: {...empresaForm.endereco, numero: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="complemento" className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <input
                type="text"
                id="complemento"
                value={empresaForm.endereco.complemento}
                onChange={(e) => setEmpresaForm({
                  ...empresaForm, 
                  endereco: {...empresaForm.endereco, complemento: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">
                Bairro *
              </label>
              <input
                type="text"
                id="bairro"
                value={empresaForm.endereco.bairro}
                onChange={(e) => setEmpresaForm({
                  ...empresaForm, 
                  endereco: {...empresaForm.endereco, bairro: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                id="cidade"
                value={empresaForm.endereco.cidade}
                onChange={(e) => setEmpresaForm({
                  ...empresaForm, 
                  endereco: {...empresaForm.endereco, cidade: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                id="estado"
                value={empresaForm.endereco.estado}
                onChange={(e) => setEmpresaForm({
                  ...empresaForm, 
                  endereco: {...empresaForm.endereco, estado: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione...</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                CEP *
              </label>
              <input
                type="text"
                id="cep"
                value={empresaForm.endereco.cep}
                onChange={(e) => setEmpresaForm({
                  ...empresaForm, 
                  endereco: {...empresaForm.endereco, cep: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00000-000"
                required
              />
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-3">Contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="text"
                id="telefone"
                value={empresaForm.contato.telefone}
                onChange={(e) => setEmpresaForm({
                  ...empresaForm, 
                  contato: {...empresaForm.contato, telefone: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(00) 0000-0000"
                required
              />
            </div>
            
            <div>
              <label htmlFor="celular" className="block text-sm font-medium text-gray-700 mb-1">
                Celular
              </label>
              <input
                type="text"
                id="celular"
                value={empresaForm.contato.celular}
                onChange={(e) => setEmpresaForm({
                  ...empresaForm, 
                  contato: {...empresaForm.contato, celular: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail *
              </label>
              <input
                type="email"
                id="email"
                value={empresaForm.contato.email}
                onChange={(e) => setEmpresaForm({
                  ...empresaForm, 
                  contato: {...empresaForm.contato, email: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="site" className="block text-sm font-medium text-gray-700 mb-1">
                Site
              </label>
              <input
                type="url"
                id="site"
                value={empresaForm.contato.site}
                onChange={(e) => setEmpresaForm({
                  ...empresaForm, 
                  contato: {...empresaForm.contato, site: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.exemplo.com.br"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSalvarDadosEmpresa}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={!hasPermission('gerente')}
            >
              Salvar Dados da Empresa
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Componente de configuração fiscal
  const TabFiscal = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Configuração Fiscal</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-3">Certificado Digital A1</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="certificadoArquivo" className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo do Certificado
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="certificadoArquivo"
                  value={fiscalForm.certificadoDigital?.arquivo || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Selecione o arquivo .pfx"
                />
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 transition-colors"
                  onClick={() => alert('Funcionalidade de upload será implementada no backend')}
                >
                  Selecionar
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="certificadoSenha" className="block text-sm font-medium text-gray-700 mb-1">
                Senha do Certificado
              </label>
              <input
                type="password"
                id="certificadoSenha"
                value={fiscalForm.certificadoDigital?.senha || ''}
                onChange={(e) => setFiscalForm({
                  ...fiscalForm, 
                  certificadoDigital: {...fiscalForm.certificadoDigital, senha: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Senha do certificado"
              />
            </div>
            
            <div>
              <label htmlFor="certificadoValidade" className="block text-sm font-medium text-gray-700 mb-1">
                Validade do Certificado
              </label>
              <input
                type="date"
                id="certificadoValidade"
                value={fiscalForm.certificadoDigital?.validade || ''}
                onChange={(e) => setFiscalForm({
                  ...fiscalForm, 
                  certificadoDigital: {...fiscalForm.certificadoDigital, validade: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-3">SAT Fiscal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="satModelo" className="block text-sm font-medium text-gray-700 mb-1">
                Modelo do SAT
              </label>
              <input
                type="text"
                id="satModelo"
                value={fiscalForm.sat?.modelo || ''}
                onChange={(e) => setFiscalForm({
                  ...fiscalForm, 
                  sat: {...fiscalForm.sat, modelo: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Elgin, Bematech, Daruma"
              />
            </div>
            
            <div>
              <label htmlFor="satCodigoAtivacao" className="block text-sm font-medium text-gray-700 mb-1">
                Código de Ativação
              </label>
              <input
                type="password"
                id="satCodigoAtivacao"
                value={fiscalForm.sat?.codigoAtivacao || ''}
                onChange={(e) => setFiscalForm({
                  ...fiscalForm, 
                  sat: {...fiscalForm.sat, codigoAtivacao: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Código de ativação do SAT"
              />
            </div>
            
            <div>
              <label htmlFor="satSignAC" className="block text-sm font-medium text-gray-700 mb-1">
                SignAC
              </label>
              <input
                type="password"
                id="satSignAC"
                value={fiscalForm.sat?.signAC || ''}
                onChange={(e) => setFiscalForm({
                  ...fiscalForm, 
                  sat: {...fiscalForm.sat, signAC: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Assinatura do AC"
              />
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-3">NFC-e</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="nfceSerie" className="block text-sm font-medium text-gray-700 mb-1">
                Série
              </label>
              <input
                type="text"
                id="nfceSerie"
                value={fiscalForm.nfce.serie}
                onChange={(e) => setFiscalForm({
                  ...fiscalForm, 
                  nfce: {...fiscalForm.nfce, serie: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 001"
              />
            </div>
            
            <div>
              <label htmlFor="nfceNumeroInicial" className="block text-sm font-medium text-gray-700 mb-1">
                Número Inicial
              </label>
              <input
                type="number"
                id="nfceNumeroInicial"
                value={fiscalForm.nfce.numeroInicial}
                onChange={(e) => setFiscalForm({
                  ...fiscalForm, 
                  nfce: {...fiscalForm.nfce, numeroInicial: parseInt(e.target.value) || 1}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            
            <div>
              <label htmlFor="nfceAmbiente" className="block text-sm font-medium text-gray-700 mb-1">
                Ambiente
              </label>
              <select
                id="nfceAmbiente"
                value={fiscalForm.nfce.ambiente}
                onChange={(e) => setFiscalForm({
                  ...fiscalForm, 
                  nfce: {...fiscalForm.nfce, ambiente: e.target.value as 'producao' | 'homologacao'}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="homologacao">Homologação (Testes)</option>
                <option value="producao">Produção</option>
              </select>
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-3">Impressora Fiscal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="impressoraModelo" className="block text-sm font-medium text-gray-700 mb-1">
                Modelo
              </label>
              <input
                type="text"
                id="impressoraModelo"
                value={fiscalForm.impressoraFiscal.modelo}
                onChange={(e) => setFiscalForm({
                  ...fiscalForm, 
                  impressoraFiscal: {...fiscalForm.impressoraFiscal, modelo: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Elgin i9, Bematech MP-4200 TH"
              />
            </div>
            
            <div>
              <label htmlFor="impressoraPorta" className="block text-sm font-medium text-gray-700 mb-1">
                Porta
              </label>
              <input
                type="text"
                id="impressoraPorta"
                value={fiscalForm.impressoraFiscal.porta}
                onChange={(e) => setFiscalForm({
                  ...fiscalForm, 
                  impressoraFiscal: {...fiscalForm.impressoraFiscal, porta: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: COM1, /dev/usb/lp0, USB"
              />
            </div>
            
            <div>
              <label htmlFor="impressoraVelocidade" className="block text-sm font-medium text-gray-700 mb-1">
                Velocidade (bps)
              </label>
              <select
                id="impressoraVelocidade"
                value={fiscalForm.impressoraFiscal.velocidade}
                onChange={(e) => setFiscalForm({
                  ...fiscalForm, 
                  impressoraFiscal: {...fiscalForm.impressoraFiscal, velocidade: parseInt(e.target.value)}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="9600">9600</option>
                <option value="19200">19200</option>
                <option value="38400">38400</option>
                <option value="57600">57600</option>
                <option value="115200">115200</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSalvarConfiguracaoFiscal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={!hasPermission('gerente')}
            >
              Salvar Configuração Fiscal
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Componente de configuração do sistema
  const TabSistema = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Configuração do Sistema</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-3">Backup</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="backupAutomatico"
                checked={sistemaForm.backupAutomatico}
                onChange={(e) => setSistemaForm({...sistemaForm, backupAutomatico: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="backupAutomatico" className="ml-2 block text-sm text-gray-900">
                Realizar backup automático
              </label>
            </div>
            
            <div>
              <label htmlFor="intervaloBackup" className="block text-sm font-medium text-gray-700 mb-1">
                Intervalo de Backup (horas)
              </label>
              <input
                type="number"
                id="intervaloBackup"
                value={sistemaForm.intervaloBackup}
                onChange={(e) => setSistemaForm({...sistemaForm, intervaloBackup: parseInt(e.target.value) || 24})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                disabled={!sistemaForm.backupAutomatico}
              />
            </div>
            
            <div>
              <label htmlFor="localBackup" className="block text-sm font-medium text-gray-700 mb-1">
                Local de Backup
              </label>
              <input
                type="text"
                id="localBackup"
                value={sistemaForm.localBackup}
                onChange={(e) => setSistemaForm({...sistemaForm, localBackup: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: /backup, C:\backup"
              />
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-3">Aparência</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="tema" className="block text-sm font-medium text-gray-700 mb-1">
                Tema
              </label>
              <select
                id="tema"
                value={sistemaForm.tema}
                onChange={(e) => setSistemaForm({...sistemaForm, tema: e.target.value as 'claro' | 'escuro' | 'sistema'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="claro">Claro</option>
                <option value="escuro">Escuro</option>
                <option value="sistema">Seguir Sistema</option>
              </select>
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-3">Formatação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="decimaisValor" className="block text-sm font-medium text-gray-700 mb-1">
                Casas Decimais para Valores
              </label>
              <select
                id="decimaisValor"
                value={sistemaForm.decimaisValor}
                onChange={(e) => setSistemaForm({...sistemaForm, decimaisValor: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2">2 (R$ 0,00)</option>
                <option value="3">3 (R$ 0,000)</option>
                <option value="4">4 (R$ 0,0000)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="decimaisQuantidade" className="block text-sm font-medium text-gray-700 mb-1">
                Casas Decimais para Quantidades
              </label>
              <select
                id="decimaisQuantidade"
                value={sistemaForm.decimaisQuantidade}
                onChange={(e) => setSistemaForm({...sistemaForm, decimaisQuantidade: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2">2 (0,00)</option>
                <option value="3">3 (0,000)</option>
                <option value="4">4 (0,0000)</option>
              </select>
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-3">Alertas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="alertaEstoqueMinimo"
                checked={sistemaForm.alertaEstoqueMinimo}
                onChange={(e) => setSistemaForm({...sistemaForm, alertaEstoqueMinimo: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="alertaEstoqueMinimo" className="ml-2 block text-sm text-gray-900">
                Alertar quando estoque atingir o mínimo
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="alertaValidadeProdutos"
                checked={sistemaForm.alertaValidadeProdutos}
                onChange={(e) => setSistemaForm({...sistemaForm, alertaValidadeProdutos: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="alertaValidadeProdutos" className="ml-2 block text-sm text-gray-900">
                Alertar sobre produtos próximos ao vencimento
              </label>
            </div>
            
            <div>
              <label htmlFor="diasAlertaValidade" className="block text-sm font-medium text-gray-700 mb-1">
                Dias para Alerta de Validade
              </label>
              <input
                type="number"
                id="diasAlertaValidade"
                value={sistemaForm.diasAlertaValidade}
                onChange={(e) => setSistemaForm({...sistemaForm, diasAlertaValidade: parseInt(e.target.value) || 30})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                disabled={!sistemaForm.alertaValidadeProdutos}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSalvarConfiguracaoSistema}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={!hasPermission('gerente')}
            >
              Salvar Configuração do Sistema
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Componente de configuração de categorias
  const TabCategorias = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Categorias de Produtos</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-medium mb-3">
            {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="categoriaNome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                id="categoriaNome"
                value={categoriaEditando ? categoriaEditando.nome : novaCategoria.nome}
                onChange={(e) => categoriaEditando 
                  ? setCategoriaEditando({...categoriaEditando, nome: e.target.value})
                  : setNovaCategoria({...novaCategoria, nome: e.target.value})
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="categoriaDescricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <input
                type="text"
                id="categoriaDescricao"
                value={categoriaEditando ? categoriaEditando.descricao || '' : novaCategoria.descricao || ''}
                onChange={(e) => categoriaEditando 
                  ? setCategoriaEditando({...categoriaEditando, descricao: e.target.value})
                  : setNovaCategoria({...novaCategoria, descricao: e.target.value})
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="categoriaAtiva"
                checked={categoriaEditando ? categoriaEditando.ativa : novaCategoria.ativa}
                onChange={(e) => categoriaEditando 
                  ? setCategoriaEditando({...categoriaEditando, ativa: e.target.checked})
                  : setNovaCategoria({...novaCategoria, ativa: e.target.checked})
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="categoriaAtiva" className="ml-2 block text-sm text-gray-900">
                Categoria Ativa
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            {categoriaEditando && (
              <button
                onClick={() => setCategoriaEditando(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            )}
            
            <button
              onClick={categoriaEditando ? handleAtualizarCategoria : handleAdicionarCategoria}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={!hasPermission('operador')}
            >
              {categoriaEditando ? 'Atualizar Categoria' : 'Adicionar Categoria'}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Lista de Categorias</h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p>Carregando categorias...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <p>Erro ao carregar categorias: {error}</p>
              <button
                onClick={recarregarCategorias}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          ) : categorias.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Nenhuma categoria cadastrada.</p>
              <p className="mt-2">Adicione uma nova categoria usando o formulário acima.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categorias.map((categoria) => (
                    <tr key={categoria.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {categoria.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categoria.descricao || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          categoria.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {categoria.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setCategoriaEditando(categoria)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Editar"
                            disabled={!hasPermission('operador')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleExcluirCategoria(categoria.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                            disabled={!hasPermission('gerente')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Componente de configuração de formas de pagamento
  const TabPagamentos = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Formas de Pagamento</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-medium mb-3">
            {formaPagamentoEditando ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="pagamentoNome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                id="pagamentoNome"
                value={formaPagamentoEditando ? formaPagamentoEditando.nome : novaFormaPagamento.nome}
                onChange={(e) => formaPagamentoEditando 
                  ? setFormaPagamentoEditando({...formaPagamentoEditando, nome: e.target.value})
                  : setNovaFormaPagamento({...novaFormaPagamento, nome: e.target.value})
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="pagamentoTipo" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                id="pagamentoTipo"
                value={formaPagamentoEditando ? formaPagamentoEditando.tipo : novaFormaPagamento.tipo}
                onChange={(e) => {
                  const tipo = e.target.value as FormaPagamento['tipo'];
                  formaPagamentoEditando 
                    ? setFormaPagamentoEditando({...formaPagamentoEditando, tipo})
                    : setNovaFormaPagamento({...novaFormaPagamento, tipo});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
                <option value="transferencia">Transferência Bancária</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="pagamentoTaxa" className="block text-sm font-medium text-gray-700 mb-1">
                Taxa (%)
              </label>
              <input
                type="number"
                id="pagamentoTaxa"
                value={formaPagamentoEditando ? formaPagamentoEditando.taxa : novaFormaPagamento.taxa}
                onChange={(e) => {
                  const taxa = parseFloat(e.target.value) || 0;
                  formaPagamentoEditando 
                    ? setFormaPagamentoEditando({...formaPagamentoEditando, taxa})
                    : setNovaFormaPagamento({...novaFormaPagamento, taxa});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label htmlFor="pagamentoPrazo" className="block text-sm font-medium text-gray-700 mb-1">
                Prazo de Recebimento (dias)
              </label>
              <input
                type="number"
                id="pagamentoPrazo"
                value={formaPagamentoEditando ? formaPagamentoEditando.prazoRecebimento : novaFormaPagamento.prazoRecebimento}
                onChange={(e) => {
                  const prazoRecebimento = parseInt(e.target.value) || 0;
                  formaPagamentoEditando 
                    ? setFormaPagamentoEditando({...formaPagamentoEditando, prazoRecebimento})
                    : setNovaFormaPagamento({...novaFormaPagamento, prazoRecebimento});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            
            <div>
              <label htmlFor="pagamentoObservacoes" className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <input
                type="text"
                id="pagamentoObservacoes"
                value={formaPagamentoEditando ? formaPagamentoEditando.observacoes || '' : novaFormaPagamento.observacoes || ''}
                onChange={(e) => formaPagamentoEditando 
                  ? setFormaPagamentoEditando({...formaPagamentoEditando, observacoes: e.target.value})
                  : setNovaFormaPagamento({...novaFormaPagamento, observacoes: e.target.value})
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pagamentoAtivo"
                checked={formaPagamentoEditando ? formaPagamentoEditando.ativa : novaFormaPagamento.ativa}
                onChange={(e) => formaPagamentoEditando 
                  ? setFormaPagamentoEditando({...formaPagamentoEditando, ativa: e.target.checked})
                  : setNovaFormaPagamento({...novaFormaPagamento, ativa: e.target.checked})
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="pagamentoAtivo" className="ml-2 block text-sm text-gray-900">
                Forma de Pagamento Ativa
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            {formaPagamentoEditando && (
              <button
                onClick={() => setFormaPagamentoEditando(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            )}
            
            <button
              onClick={formaPagamentoEditando ? handleAtualizarFormaPagamento : handleAdicionarFormaPagamento}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={!hasPermission('operador')}
            >
              {formaPagamentoEditando ? 'Atualizar Forma de Pagamento' : 'Adicionar Forma de Pagamento'}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Lista de Formas de Pagamento</h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p>Carregando formas de pagamento...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <p>Erro ao carregar formas de pagamento: {error}</p>
              <button
                onClick={recarregarFormasPagamento}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          ) : formasPagamento.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Nenhuma forma de pagamento cadastrada.</p>
              <p className="mt-2">Adicione uma nova forma de pagamento usando o formulário acima.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxa
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prazo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formasPagamento.map((formaPagamento) => (
                    <tr key={formaPagamento.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formaPagamento.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formaPagamento.tipo === 'dinheiro' ? 'Dinheiro' :
                         formaPagamento.tipo === 'cartao_credito' ? 'Cartão de Crédito' :
                         formaPagamento.tipo === 'cartao_debito' ? 'Cartão de Débito' :
                         formaPagamento.tipo === 'pix' ? 'PIX' :
                         formaPagamento.tipo === 'boleto' ? 'Boleto' :
                         formaPagamento.tipo === 'transferencia' ? 'Transferência Bancária' : 'Outro'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formaPagamento.taxa}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formaPagamento.prazoRecebimento} {formaPagamento.prazoRecebimento === 1 ? 'dia' : 'dias'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          formaPagamento.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {formaPagamento.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setFormaPagamentoEditando(formaPagamento)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Editar"
                            disabled={!hasPermission('operador')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleExcluirFormaPagamento(formaPagamento.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                            disabled={!hasPermission('gerente')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Configurações</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('empresa')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'empresa'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dados da Empresa
            </button>
            
            <button
              onClick={() => setActiveTab('fiscal')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'fiscal'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Fiscal
            </button>
            
            <button
              onClick={() => setActiveTab('sistema')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'sistema'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sistema
            </button>
            
            <button
              onClick={() => setActiveTab('categorias')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'categorias'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categorias
            </button>
            
            <button
              onClick={() => setActiveTab('pagamentos')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'pagamentos'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Formas de Pagamento
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'empresa' && <TabEmpresa />}
      {activeTab === 'fiscal' && <TabFiscal />}
      {activeTab === 'sistema' && <TabSistema />}
      {activeTab === 'categorias' && <TabCategorias />}
      {activeTab === 'pagamentos' && <TabPagamentos />}
    </div>
  );
};

export default ConfiguracoesPage;
