import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProdutos } from '../../produtos/hooks/useProdutos';
import { useClientes } from '../../clientes/hooks/useClientes';
import { useAuth } from '../../auth/context/AuthContext';

const FiscalPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { produtos } = useProdutos();
  const { clientes } = useClientes();
  
  // Estados para emissão de nota
  const [tipoNota, setTipoNota] = useState<'nfce' | 'sat'>('nfce');
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const [produtosSelecionados, setProdutosSelecionados] = useState<{id: number, quantidade: number}[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  
  // Estados para busca de produtos
  const [codigoBarras, setCodigoBarras] = useState('');
  const [produtoBusca, setProdutoBusca] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState(produtos);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCertificadoModal, setShowCertificadoModal] = useState(false);
  const [certificadoSenha, setCertificadoSenha] = useState('');
  const [certificadoArquivo, setCertificadoArquivo] = useState<string | null>(null);
  
  // Histórico de notas emitidas (simulado)
  const [notasEmitidas, setNotasEmitidas] = useState<any[]>([]);
  
  // Filtrar produtos com base na busca
  useEffect(() => {
    if (produtoBusca) {
      const termoBusca = produtoBusca.toLowerCase();
      const filtrados = produtos.filter(p => 
        p.nome.toLowerCase().includes(termoBusca) || 
        p.codigoBarras.includes(termoBusca)
      );
      setProdutosFiltrados(filtrados);
    } else {
      setProdutosFiltrados(produtos);
    }
  }, [produtoBusca, produtos]);
  
  // Buscar produto por código de barras
  useEffect(() => {
    if (codigoBarras.length >= 8) {
      const produto = produtos.find(p => p.codigoBarras === codigoBarras);
      if (produto) {
        adicionarProduto(produto.id);
        setCodigoBarras('');
      }
    }
  }, [codigoBarras, produtos]);
  
  const adicionarProduto = (produtoId: number) => {
    // Verificar se o produto já está na lista
    const produtoExistente = produtosSelecionados.find(p => p.id === produtoId);
    
    if (produtoExistente) {
      // Incrementar quantidade
      setProdutosSelecionados(
        produtosSelecionados.map(p => 
          p.id === produtoId ? { ...p, quantidade: p.quantidade + 1 } : p
        )
      );
    } else {
      // Adicionar novo produto
      setProdutosSelecionados([
        ...produtosSelecionados,
        { id: produtoId, quantidade: 1 }
      ]);
    }
  };
  
  const removerProduto = (produtoId: number) => {
    setProdutosSelecionados(produtosSelecionados.filter(p => p.id !== produtoId));
  };
  
  const alterarQuantidade = (produtoId: number, quantidade: number) => {
    if (quantidade <= 0) {
      removerProduto(produtoId);
      return;
    }
    
    setProdutosSelecionados(
      produtosSelecionados.map(p => 
        p.id === produtoId ? { ...p, quantidade } : p
      )
    );
  };
  
  const calcularTotal = () => {
    return produtosSelecionados.reduce((total, item) => {
      const produto = produtos.find(p => p.id === item.id);
      if (produto) {
        return total + (produto.precoVenda * item.quantidade);
      }
      return total;
    }, 0);
  };
  
  const handleEmitirNota = async () => {
    if (produtosSelecionados.length === 0) {
      setError('Selecione pelo menos um produto');
      return;
    }
    
    if (tipoNota === 'nfce' && !clienteSelecionado) {
      setError('Selecione um cliente para emitir NFC-e');
      return;
    }
    
    if (tipoNota === 'nfce' && !certificadoArquivo) {
      setShowCertificadoModal(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulação de emissão de nota
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const cliente = clienteSelecionado 
        ? clientes.find(c => c.id === clienteSelecionado) 
        : null;
      
      const itens = produtosSelecionados.map(item => {
        const produto = produtos.find(p => p.id === item.id);
        return {
          produto: produto?.nome,
          quantidade: item.quantidade,
          valorUnitario: produto?.precoVenda,
          valorTotal: produto ? produto.precoVenda * item.quantidade : 0
        };
      });
      
      const novaNota = {
        id: notasEmitidas.length + 1,
        tipo: tipoNota,
        cliente: cliente?.nome || 'Consumidor Final',
        data: new Date().toISOString(),
        itens,
        valorTotal: calcularTotal(),
        formaPagamento,
        observacoes,
        status: 'emitida',
        chave: tipoNota === 'nfce' 
          ? `${Math.floor(Math.random() * 10000)}${Math.floor(Math.random() * 10000)}${Math.floor(Math.random() * 10000)}${Math.floor(Math.random() * 10000)}`
          : `${Math.floor(Math.random() * 1000000)}`,
      };
      
      setNotasEmitidas([novaNota, ...notasEmitidas]);
      
      setSuccess(`${tipoNota === 'nfce' ? 'NFC-e' : 'SAT'} emitida com sucesso!`);
      
      // Limpar formulário
      setProdutosSelecionados([]);
      setClienteSelecionado(null);
      setObservacoes('');
      
      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      setError('Erro ao emitir nota fiscal');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUploadCertificado = () => {
    // Simulação de upload de certificado
    setCertificadoArquivo('certificado_a1.pfx');
    setShowCertificadoModal(false);
    setSuccess('Certificado A1 carregado com sucesso!');
    
    // Limpar mensagem de sucesso após 3 segundos
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };
  
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Emissão Fiscal</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate('/configuracoes/fiscal')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Configurações Fiscais
          </button>
          
          {!certificadoArquivo && (
            <button
              onClick={() => setShowCertificadoModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Carregar Certificado A1
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p>{success}</p>
        </div>
      )}
      
      {/* Formulário de Emissão */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Emissão de Documento Fiscal</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Tipo de Nota e Cliente */}
          <div className="space-y-4">
            <div>
              <label htmlFor="tipoNota" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="nfce"
                    checked={tipoNota === 'nfce'}
                    onChange={() => setTipoNota('nfce')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">NFC-e</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="sat"
                    checked={tipoNota === 'sat'}
                    onChange={() => setTipoNota('sat')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">SAT Fiscal</span>
                </label>
              </div>
            </div>
            
            <div>
              <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
                Cliente {tipoNota === 'nfce' && '*'}
              </label>
              <select
                id="cliente"
                value={clienteSelecionado || ''}
                onChange={(e) => setClienteSelecionado(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={tipoNota === 'nfce'}
              >
                <option value="">Consumidor Final</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} - {cliente.cpfCnpj}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="formaPagamento" className="block text-sm font-medium text-gray-700 mb-1">
                Forma de Pagamento
              </label>
              <select
                id="formaPagamento"
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
                <option value="transferencia">Transferência</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Coluna 2: Busca de Produtos */}
          <div className="space-y-4">
            <div>
              <label htmlFor="codigoBarras" className="block text-sm font-medium text-gray-700 mb-1">
                Código de Barras
              </label>
              <input
                type="text"
                id="codigoBarras"
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                placeholder="Escaneie ou digite o código de barras"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="produtoBusca" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar Produto
              </label>
              <input
                type="text"
                id="produtoBusca"
                value={produtoBusca}
                onChange={(e) => setProdutoBusca(e.target.value)}
                placeholder="Digite o nome do produto"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produtos Encontrados
              </label>
              <div className="border border-gray-300 rounded-md h-64 overflow-y-auto p-2">
                {produtosFiltrados.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhum produto encontrado</p>
                ) : (
                  <div className="space-y-2">
                    {produtosFiltrados.map((produto) => (
                      <div key={produto.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                        <div>
                          <div className="text-sm font-medium">{produto.nome}</div>
                          <div className="text-xs text-gray-500">Código: {produto.codigoBarras}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-sm font-medium mr-2">{formatarMoeda(produto.precoVenda)}</div>
                          <button
                            onClick={() => adicionarProduto(produto.id)}
                            className="p-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                            title="Adicionar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Coluna 3: Produtos Selecionados */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produtos Selecionados
              </label>
              <div className="border border-gray-300 rounded-md h-64 overflow-y-auto p-2">
                {produtosSelecionados.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhum produto selecionado</p>
                ) : (
                  <div className="space-y-2">
                    {produtosSelecionados.map((item) => {
                      const produto = produtos.find(p => p.id === item.id);
                      if (!produto) return null;
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                          <div>
                            <div className="text-sm font-medium">{produto.nome}</div>
                            <div className="text-xs text-gray-500">
                              {formatarMoeda(produto.precoVenda)} x {item.quantidade} = {formatarMoeda(produto.precoVenda * item.quantidade)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                              className="p-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                              title="Diminuir"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            
                            <span className="text-sm font-medium w-6 text-center">{item.quantidade}</span>
                            
                            <button
                              onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                              className="p-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                              title="Aumentar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={() => removerProduto(item.id)}
                              className="p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                              title="Remover"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-xl font-bold text-blue-600">{formatarMoeda(calcularTotal())}</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleEmitirNota}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading || produtosSelecionados.length === 0}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Emitindo...</span>
                  </div>
                ) : (
                  `Emitir ${tipoNota === 'nfce' ? 'NFC-e' : 'SAT'}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Histórico de Notas Emitidas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Histórico de Documentos Fiscais</h2>
        </div>
        
        {notasEmitidas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhum documento fiscal emitido.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
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
                {notasEmitidas.map((nota) => (
                  <tr key={nota.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {nota.tipo === 'nfce' ? 'NFC-e' : 'SAT'} #{nota.id}
                      </div>
                      <div className="text-xs text-gray-500">
                        Chave: {nota.chave}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {nota.cliente}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatarData(nota.data)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatarMoeda(nota.valorTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Emitida
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar DANFE"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Imprimir"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </button>
                        
                        <button
                          className="text-purple-600 hover:text-purple-900"
                          title="Enviar por Email"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
      
      {/* Modal de Certificado A1 */}
      {showCertificadoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Carregar Certificado A1</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="certificadoArquivo" className="block text-sm font-medium text-gray-700 mb-1">
                  Arquivo do Certificado (.pfx)
                </label>
                <div className="flex items-center">
                  <label className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span>Selecionar arquivo</span>
                    <input type="file" className="sr-only" />
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="certificadoSenha" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha do Certificado
                </label>
                <input
                  type="password"
                  id="certificadoSenha"
                  value={certificadoSenha}
                  onChange={(e) => setCertificadoSenha(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowCertificadoModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleUploadCertificado}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={!certificadoSenha}
              >
                Carregar Certificado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiscalPage;
