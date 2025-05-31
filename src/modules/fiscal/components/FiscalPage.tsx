import { useState, useEffect, useRef } from 'react';
import { useFiscal, ConfiguracaoFiscal, DocumentoFiscal } from '../hooks/useFiscal';
import { Venda } from '../../pdv/hooks/usePDV';

const FiscalPage = () => {
  const { 
    configuracaoFiscal, 
    documentosFiscais, 
    isLoading, 
    error,
    salvarConfiguracaoFiscal,
    cancelarDocumentoFiscal,
    imprimirDANFE,
    uploadCertificadoDigital,
    testarConexaoSAT,
    testarConexaoSEFAZ,
    testarImpressora,
    recarregarDocumentosFiscais
  } = useFiscal();
  
  // Estados para configuração fiscal
  const [configForm, setConfigForm] = useState<Partial<ConfiguracaoFiscal>>({
    tipoEmissao: 'nenhum',
    ambiente: 'homologacao',
    impressoraModelo: 'elgin'
  });
  
  // Estados para upload de certificado
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null);
  const [certificadoSenha, setCertificadoSenha] = useState('');
  
  // Estados para cancelamento de documento
  const [documentoSelecionado, setDocumentoSelecionado] = useState<DocumentoFiscal | null>(null);
  const [justificativaCancelamento, setJustificativaCancelamento] = useState('');
  
  // Estados para filtros
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('');
  const [filtroDataFim, setFiltroDataFim] = useState<string>('');
  
  // Estados para modais
  const [mostrarModalCancelamento, setMostrarModalCancelamento] = useState(false);
  const [mostrarModalCertificado, setMostrarModalCertificado] = useState(false);
  const [mostrarModalDetalhes, setMostrarModalDetalhes] = useState(false);
  
  // Referência para input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Inicializar formulário com configuração atual
  useEffect(() => {
    if (configuracaoFiscal) {
      setConfigForm({
        tipoEmissao: configuracaoFiscal.tipoEmissao,
        ambiente: configuracaoFiscal.ambiente,
        satModelo: configuracaoFiscal.satModelo,
        satCodigoAtivacao: configuracaoFiscal.satCodigoAtivacao,
        satCnpj: configuracaoFiscal.satCnpj,
        nfceToken: configuracaoFiscal.nfceToken,
        nfceCSC: configuracaoFiscal.nfceCSC,
        nfceIdCSC: configuracaoFiscal.nfceIdCSC,
        impressoraTermica: configuracaoFiscal.impressoraTermica,
        impressoraModelo: configuracaoFiscal.impressoraModelo,
        impressoraPorta: configuracaoFiscal.impressoraPorta
      });
    }
  }, [configuracaoFiscal]);
  
  // Aplicar filtros aos documentos fiscais
  const documentosFiltrados = documentosFiscais.filter(documento => {
    // Filtro por tipo
    if (filtroTipo && documento.tipo !== filtroTipo) return false;
    
    // Filtro por status
    if (filtroStatus && documento.status !== filtroStatus) return false;
    
    // Filtro por data de início
    if (filtroDataInicio) {
      const dataInicio = new Date(filtroDataInicio);
      const dataDocumento = new Date(documento.dataEmissao);
      if (dataDocumento < dataInicio) return false;
    }
    
    // Filtro por data de fim
    if (filtroDataFim) {
      const dataFim = new Date(filtroDataFim);
      dataFim.setHours(23, 59, 59); // Ajustar para o final do dia
      const dataDocumento = new Date(documento.dataEmissao);
      if (dataDocumento > dataFim) return false;
    }
    
    return true;
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfigForm({
      ...configForm,
      [name]: value,
    });
  };
  
  const handleSalvarConfiguracao = async () => {
    try {
      await salvarConfiguracaoFiscal(configForm);
      alert('Configuração fiscal salva com sucesso!');
    } catch (err) {
      alert('Erro ao salvar configuração fiscal. Por favor, tente novamente.');
      console.error(err);
    }
  };
  
  const handleUploadCertificado = async () => {
    if (!certificadoFile) {
      alert('Por favor, selecione um arquivo de certificado');
      return;
    }
    
    if (!certificadoSenha) {
      alert('Por favor, informe a senha do certificado');
      return;
    }
    
    try {
      await uploadCertificadoDigital(certificadoFile, certificadoSenha);
      alert('Certificado digital instalado com sucesso!');
      setMostrarModalCertificado(false);
      setCertificadoFile(null);
      setCertificadoSenha('');
    } catch (err) {
      alert('Erro ao instalar certificado digital. Por favor, tente novamente.');
      console.error(err);
    }
  };
  
  const handleCancelarDocumento = async () => {
    if (!documentoSelecionado) {
      alert('Nenhum documento selecionado');
      return;
    }
    
    if (justificativaCancelamento.length < 15) {
      alert('A justificativa deve ter pelo menos 15 caracteres');
      return;
    }
    
    try {
      await cancelarDocumentoFiscal(documentoSelecionado.id, justificativaCancelamento);
      alert('Documento fiscal cancelado com sucesso!');
      setMostrarModalCancelamento(false);
      setDocumentoSelecionado(null);
      setJustificativaCancelamento('');
      recarregarDocumentosFiscais();
    } catch (err) {
      alert('Erro ao cancelar documento fiscal. Por favor, tente novamente.');
      console.error(err);
    }
  };
  
  const handleImprimirDANFE = async (documentoId: number) => {
    try {
      await imprimirDANFE(documentoId);
      alert('DANFE enviado para impressão com sucesso!');
    } catch (err) {
      alert('Erro ao imprimir DANFE. Por favor, tente novamente.');
      console.error(err);
    }
  };
  
  const handleTestarConexaoSAT = async () => {
    try {
      const resultado = await testarConexaoSAT();
      if (resultado) {
        alert('Conexão com o SAT estabelecida com sucesso!');
      } else {
        alert('Não foi possível estabelecer conexão com o SAT. Verifique as configurações.');
      }
    } catch (err) {
      alert('Erro ao testar conexão com o SAT. Por favor, tente novamente.');
      console.error(err);
    }
  };
  
  const handleTestarConexaoSEFAZ = async () => {
    try {
      const resultado = await testarConexaoSEFAZ();
      if (resultado) {
        alert('Conexão com a SEFAZ estabelecida com sucesso!');
      } else {
        alert('Não foi possível estabelecer conexão com a SEFAZ. Verifique as configurações e o certificado digital.');
      }
    } catch (err) {
      alert('Erro ao testar conexão com a SEFAZ. Por favor, tente novamente.');
      console.error(err);
    }
  };
  
  const handleTestarImpressora = async () => {
    try {
      const resultado = await testarImpressora();
      if (resultado) {
        alert('Teste de impressão enviado com sucesso!');
      } else {
        alert('Não foi possível enviar o teste para a impressora. Verifique as configurações.');
      }
    } catch (err) {
      alert('Erro ao testar impressora. Por favor, tente novamente.');
      console.error(err);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCertificadoFile(e.target.files[0]);
    }
  };
  
  const handleAbrirSelecionarArquivo = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const limparFiltros = () => {
    setFiltroTipo('');
    setFiltroStatus('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
  };
  
  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleString('pt-BR');
  };
  
  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-center">Emissão Fiscal</h1>
      
      {/* Configuração Fiscal */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Configuração Fiscal</h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium">Tipo de Emissão *</label>
            <select
              name="tipoEmissao"
              value={configForm.tipoEmissao}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="nenhum">Nenhum (Apenas Cupom Não Fiscal)</option>
              <option value="nfce">NFC-e (Nota Fiscal de Consumidor Eletrônica)</option>
              <option value="sat">SAT Fiscal (Sistema Autenticador e Transmissor)</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Ambiente *</label>
            <select
              name="ambiente"
              value={configForm.ambiente}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="homologacao">Homologação (Testes)</option>
              <option value="producao">Produção</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <span className={`inline-block w-3 h-3 rounded-full ${configuracaoFiscal?.certificadoInstalado ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm font-medium">
                Certificado Digital: {configuracaoFiscal?.certificadoInstalado ? 'Instalado' : 'Não Instalado'}
              </span>
            </div>
            
            <button
              onClick={() => setMostrarModalCertificado(true)}
              className="px-3 py-1 ml-4 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {configuracaoFiscal?.certificadoInstalado ? 'Atualizar' : 'Instalar'}
            </button>
          </div>
        </div>
        
        {/* Configurações específicas para NFC-e */}
        {configForm.tipoEmissao === 'nfce' && (
          <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium">Token</label>
              <input
                type="text"
                name="nfceToken"
                value={configForm.nfceToken || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Token de integração"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">CSC (Código de Segurança do Contribuinte)</label>
              <input
                type="text"
                name="nfceCSC"
                value={configForm.nfceCSC || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="CSC fornecido pela SEFAZ"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">ID do CSC</label>
              <input
                type="text"
                name="nfceIdCSC"
                value={configForm.nfceIdCSC || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="ID do CSC fornecido pela SEFAZ"
              />
            </div>
          </div>
        )}
        
        {/* Configurações específicas para SAT */}
        {configForm.tipoEmissao === 'sat' && (
          <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium">Modelo do SAT</label>
              <select
                name="satModelo"
                value={configForm.satModelo || 'sat_fiscal'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="sat_fiscal">SAT Fiscal (Padrão)</option>
                <option value="sat_fiscal_cdecl">SAT Fiscal (CDECL)</option>
                <option value="sat_fiscal_dll">SAT Fiscal (DLL)</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">Código de Ativação</label>
              <input
                type="password"
                name="satCodigoAtivacao"
                value={configForm.satCodigoAtivacao || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Código de ativação do SAT"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">CNPJ do Contribuinte</label>
              <input
                type="text"
                name="satCnpj"
                value={configForm.satCnpj || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="CNPJ vinculado ao SAT"
              />
            </div>
          </div>
        )}
        
        {/* Configurações de Impressora */}
        <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium">Impressora Térmica</label>
            <input
              type="text"
              name="impressoraTermica"
              value={configForm.impressoraTermica || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nome da impressora térmica"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Modelo da Impressora</label>
            <select
              name="impressoraModelo"
              value={configForm.impressoraModelo || 'elgin'}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="elgin">Elgin</option>
              <option value="daruma">Daruma</option>
              <option value="bematech">Bematech</option>
              <option value="epson">Epson</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Porta da Impressora</label>
            <input
              type="text"
              name="impressoraPorta"
              value={configForm.impressoraPorta || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="USB, COM1, TCP/IP, etc."
            />
          </div>
        </div>
        
        {/* Botões de Ação */}
        <div className="flex flex-wrap justify-between mt-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSalvarConfiguracao}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Salvar Configuração
            </button>
            
            {configForm.tipoEmissao === 'nfce' && (
              <button
                onClick={handleTestarConexaoSEFAZ}
                className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                disabled={!configuracaoFiscal?.certificadoInstalado}
              >
                Testar Conexão SEFAZ
              </button>
            )}
            
            {configForm.tipoEmissao === 'sat' && (
              <button
                onClick={handleTestarConexaoSAT}
                className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                disabled={!configForm.satCodigoAtivacao}
              >
                Testar Conexão SAT
              </button>
            )}
            
            {configForm.impressoraTermica && (
              <button
                onClick={handleTestarImpressora}
                className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Testar Impressora
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Documentos Fiscais */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Documentos Fiscais Emitidos</h2>
        
        {/* Filtros */}
        <div className="p-4 mb-6 bg-gray-50 rounded-md">
          <h3 className="mb-3 text-lg font-medium">Filtros</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Tipo</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Todos</option>
                <option value="nfce">NFC-e</option>
                <option value="sat">SAT</option>
                <option value="nenhum">Cupom Não Fiscal</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Todos</option>
                <option value="emitido">Emitido</option>
                <option value="cancelado">Cancelado</option>
                <option value="erro">Erro</option>
                <option value="contingencia">Contingência</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">Data Início</label>
              <input
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">Data Fim</label>
              <input
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={limparFiltros}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
        
        {/* Tabela de Documentos */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Número</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Data/Hora</th>
                <th className="px-4 py-2 text-left">Valor</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                    Carregando documentos fiscais...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-center text-red-500">
                    Erro ao carregar documentos fiscais: {error}
                  </td>
                </tr>
              ) : documentosFiltrados.length > 0 ? (
                documentosFiltrados.map((documento) => (
                  <tr key={documento.id} className="border-t border-gray-200">
                    <td className="px-4 py-3">
                      {documento.numero}
                      <span className="ml-1 text-xs text-gray-500">
                        (Série: {documento.serie})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {documento.tipo === 'nfce' ? 'NFC-e' : 
                       documento.tipo === 'sat' ? 'SAT' : 
                       'Cupom Não Fiscal'}
                    </td>
                    <td className="px-4 py-3">{formatarData(documento.dataEmissao)}</td>
                    <td className="px-4 py-3">{formatarValor(documento.valorTotal)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs text-white rounded-full ${
                        documento.status === 'emitido' ? 'bg-green-500' :
                        documento.status === 'cancelado' ? 'bg-red-500' :
                        documento.status === 'erro' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}>
                        {documento.status === 'emitido' ? 'Emitido' :
                         documento.status === 'cancelado' ? 'Cancelado' :
                         documento.status === 'erro' ? 'Erro' :
                         'Contingência'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setDocumentoSelecionado(documento);
                            setMostrarModalDetalhes(true);
                          }}
                          className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                          Detalhes
                        </button>
                        
                        <button
                          onClick={() => handleImprimirDANFE(documento.id)}
                          className="px-2 py-1 text-xs text-white bg-purple-500 rounded hover:bg-purple-600"
                          disabled={documento.status === 'erro'}
                        >
                          Imprimir
                        </button>
                        
                        {documento.status === 'emitido' && (
                          <button
                            onClick={() => {
                              setDocumentoSelecionado(documento);
                              setMostrarModalCancelamento(true);
                            }}
                            className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                    Nenhum documento fiscal encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal de Upload de Certificado */}
      {mostrarModalCertificado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Instalar Certificado Digital</h2>
              <button
                onClick={() => setMostrarModalCertificado(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">Arquivo do Certificado (.pfx) *</label>
              <div className="flex items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pfx"
                  className="hidden"
                />
                <button
                  onClick={handleAbrirSelecionarArquivo}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Selecionar Arquivo
                </button>
                <span className="ml-2 text-sm text-gray-600">
                  {certificadoFile ? certificadoFile.name : 'Nenhum arquivo selecionado'}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">Senha do Certificado *</label>
              <input
                type="password"
                value={certificadoSenha}
                onChange={(e) => setCertificadoSenha(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Senha do certificado digital"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setMostrarModalCertificado(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadCertificado}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                disabled={!certificadoFile || !certificadoSenha}
              >
                Instalar Certificado
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Cancelamento */}
      {mostrarModalCancelamento && documentoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Cancelar Documento Fiscal</h2>
              <button
                onClick={() => setMostrarModalCancelamento(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-3 mb-4 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Documento:</span> {documentoSelecionado.numero} (Série: {documentoSelecionado.serie})
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tipo:</span> {documentoSelecionado.tipo === 'nfce' ? 'NFC-e' : documentoSelecionado.tipo === 'sat' ? 'SAT' : 'Cupom Não Fiscal'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Emissão:</span> {formatarData(documentoSelecionado.dataEmissao)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Valor:</span> {formatarValor(documentoSelecionado.valorTotal)}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">Justificativa do Cancelamento *</label>
              <textarea
                value={justificativaCancelamento}
                onChange={(e) => setJustificativaCancelamento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Informe o motivo do cancelamento (mínimo 15 caracteres)"
                minLength={15}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {justificativaCancelamento.length}/150 caracteres (mínimo 15)
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setMostrarModalCancelamento(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleCancelarDocumento}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                disabled={justificativaCancelamento.length < 15}
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Detalhes */}
      {mostrarModalDetalhes && documentoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Detalhes do Documento Fiscal</h2>
              <button
                onClick={() => setMostrarModalDetalhes(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
              <div className="p-3 bg-gray-100 rounded-md">
                <h3 className="mb-2 text-lg font-medium">Informações Gerais</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Número:</span> {documentoSelecionado.numero}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Série:</span> {documentoSelecionado.serie}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tipo:</span> {documentoSelecionado.tipo === 'nfce' ? 'NFC-e' : documentoSelecionado.tipo === 'sat' ? 'SAT' : 'Cupom Não Fiscal'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span> {documentoSelecionado.status === 'emitido' ? 'Emitido' : documentoSelecionado.status === 'cancelado' ? 'Cancelado' : documentoSelecionado.status === 'erro' ? 'Erro' : 'Contingência'}
                </p>
              </div>
              
              <div className="p-3 bg-gray-100 rounded-md">
                <h3 className="mb-2 text-lg font-medium">Datas</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Emissão:</span> {formatarData(documentoSelecionado.dataEmissao)}
                </p>
                {documentoSelecionado.dataCancelamento && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Cancelamento:</span> {formatarData(documentoSelecionado.dataCancelamento)}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Valor Total:</span> {formatarValor(documentoSelecionado.valorTotal)}
                </p>
              </div>
            </div>
            
            {documentoSelecionado.chave && (
              <div className="p-3 mb-4 bg-gray-100 rounded-md">
                <h3 className="mb-2 text-lg font-medium">Chave de Acesso</h3>
                <p className="text-sm font-mono break-all">{documentoSelecionado.chave}</p>
              </div>
            )}
            
            {documentoSelecionado.mensagemSefaz && (
              <div className="p-3 mb-4 bg-gray-100 rounded-md">
                <h3 className="mb-2 text-lg font-medium">Mensagem SEFAZ</h3>
                <p className="text-sm text-gray-600">{documentoSelecionado.mensagemSefaz}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleImprimirDANFE(documentoSelecionado.id)}
                className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
                disabled={documentoSelecionado.status === 'erro'}
              >
                Imprimir DANFE
              </button>
              
              <button
                onClick={() => setMostrarModalDetalhes(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiscalPage;
