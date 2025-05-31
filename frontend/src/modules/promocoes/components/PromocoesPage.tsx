import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePromocoes } from '../hooks/usePromocoes';
import { useProdutos } from '../../produtos/hooks/useProdutos';
import { useAuth } from '../../auth/context/AuthContext';

const PromocoesPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { promocoes, adicionarPromocao, atualizarPromocao, excluirPromocao } = usePromocoes();
  const { produtos } = useProdutos();
  
  // Estados para formulário de promoção
  const [showForm, setShowForm] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [promocaoId, setPromocaoId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [tipoDesconto, setTipoDesconto] = useState<'percentual' | 'valor'>('percentual');
  const [valorDesconto, setValorDesconto] = useState('');
  const [produtosSelecionados, setProdutosSelecionados] = useState<number[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [ativa, setAtiva] = useState(true);
  
  // Estados para filtros
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [filtroProduto, setFiltroProduto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [promocoesFiltradas, setPromocoesFiltradas] = useState(promocoes);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Extrair categorias únicas dos produtos
  const categorias = [...new Set(produtos.map(p => p.categoria))];
  
  // Aplicar filtros
  useEffect(() => {
    let resultado = [...promocoes];
    
    // Filtro por status
    if (filtroStatus === 'ativas') {
      const hoje = new Date().toISOString().split('T')[0];
      resultado = resultado.filter(p => p.ativa && p.dataFim >= hoje);
    } else if (filtroStatus === 'inativas') {
      const hoje = new Date().toISOString().split('T')[0];
      resultado = resultado.filter(p => !p.ativa || p.dataFim < hoje);
    } else if (filtroStatus === 'expiradas') {
      const hoje = new Date().toISOString().split('T')[0];
      resultado = resultado.filter(p => p.dataFim < hoje);
    }
    
    // Filtro por produto
    if (filtroProduto) {
      resultado = resultado.filter(p => 
        p.produtosIds.includes(parseInt(filtroProduto))
      );
    }
    
    // Filtro por categoria
    if (filtroCategoria) {
      const produtosDaCategoria = produtos
        .filter(p => p.categoria === filtroCategoria)
        .map(p => p.id);
      
      resultado = resultado.filter(p => 
        p.produtosIds.some(id => produtosDaCategoria.includes(id))
      );
    }
    
    // Ordenar por data de fim (mais próximas primeiro)
    resultado.sort((a, b) => {
      const dataA = new Date(a.dataFim).getTime();
      const dataB = new Date(b.dataFim).getTime();
      return dataA - dataB;
    });
    
    setPromocoesFiltradas(resultado);
  }, [promocoes, filtroStatus, filtroProduto, filtroCategoria, produtos]);
  
  const limparFormulario = () => {
    setNome('');
    setDescricao('');
    setDataInicio('');
    setDataFim('');
    setTipoDesconto('percentual');
    setValorDesconto('');
    setProdutosSelecionados([]);
    setCategoriaSelecionada('');
    setAtiva(true);
    setPromocaoId(null);
    setModoEdicao(false);
  };
  
  const handleNovaPromocao = () => {
    limparFormulario();
    setShowForm(true);
  };
  
  const handleEditarPromocao = (promocao: any) => {
    setNome(promocao.nome);
    setDescricao(promocao.descricao);
    setDataInicio(promocao.dataInicio);
    setDataFim(promocao.dataFim);
    setTipoDesconto(promocao.tipoDesconto);
    setValorDesconto(promocao.valorDesconto.toString());
    setProdutosSelecionados(promocao.produtosIds);
    setCategoriaSelecionada(promocao.categoria || '');
    setAtiva(promocao.ativa);
    setPromocaoId(promocao.id);
    setModoEdicao(true);
    setShowForm(true);
  };
  
  const handleExcluirPromocao = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta promoção? Esta ação não pode ser desfeita.')) {
      setIsLoading(true);
      setError(null);
      
      try {
        const resultado = await excluirPromocao(id);
        
        if (resultado) {
          setSuccess('Promoção excluída com sucesso!');
          
          // Limpar mensagem de sucesso após 3 segundos
          setTimeout(() => {
            setSuccess(null);
          }, 3000);
        } else {
          setError('Erro ao excluir promoção');
        }
      } catch (err) {
        setError('Erro ao processar a solicitação');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleSelecionarCategoria = (categoria: string) => {
    setCategoriaSelecionada(categoria);
    
    // Selecionar todos os produtos da categoria
    const produtosDaCategoria = produtos
      .filter(p => p.categoria === categoria)
      .map(p => p.id);
    
    setProdutosSelecionados(produtosDaCategoria);
  };
  
  const handleToggleProduto = (produtoId: number) => {
    if (produtosSelecionados.includes(produtoId)) {
      setProdutosSelecionados(produtosSelecionados.filter(id => id !== produtoId));
    } else {
      setProdutosSelecionados([...produtosSelecionados, produtoId]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !dataInicio || !dataFim || !valorDesconto || produtosSelecionados.length === 0) {
      setError('Preencha todos os campos obrigatórios e selecione pelo menos um produto');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const valorDescontoNumerico = parseFloat(valorDesconto);
      
      if (isNaN(valorDescontoNumerico) || valorDescontoNumerico <= 0) {
        setError('Valor de desconto inválido');
        setIsLoading(false);
        return;
      }
      
      // Validar percentual máximo
      if (tipoDesconto === 'percentual' && valorDescontoNumerico > 100) {
        setError('Percentual de desconto não pode ser maior que 100%');
        setIsLoading(false);
        return;
      }
      
      const promocaoData = {
        nome,
        descricao,
        dataInicio,
        dataFim,
        tipoDesconto,
        valorDesconto: valorDescontoNumerico,
        produtosIds: produtosSelecionados,
        categoria: categoriaSelecionada,
        ativa
      };
      
      let resultado;
      
      if (modoEdicao && promocaoId !== null) {
        resultado = await atualizarPromocao(promocaoId, promocaoData);
      } else {
        resultado = await adicionarPromocao(promocaoData);
      }
      
      if (resultado) {
        setSuccess(`Promoção ${modoEdicao ? 'atualizada' : 'cadastrada'} com sucesso!`);
        setShowForm(false);
        limparFormulario();
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(`Erro ao ${modoEdicao ? 'atualizar' : 'cadastrar'} promoção`);
      }
    } catch (err) {
      setError('Erro ao processar a solicitação');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  const verificarStatus = (promocao: any) => {
    const hoje = new Date();
    const dataInicio = new Date(promocao.dataInicio);
    const dataFim = new Date(promocao.dataFim);
    
    if (!promocao.ativa) {
      return { status: 'inativa', texto: 'Inativa', classe: 'bg-gray-100 text-gray-800' };
    } else if (hoje < dataInicio) {
      return { status: 'futura', texto: 'Agendada', classe: 'bg-blue-100 text-blue-800' };
    } else if (hoje > dataFim) {
      return { status: 'expirada', texto: 'Expirada', classe: 'bg-red-100 text-red-800' };
    } else {
      return { status: 'ativa', texto: 'Ativa', classe: 'bg-green-100 text-green-800' };
    }
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Gerenciamento de Promoções</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleNovaPromocao}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={!hasPermission('operador')}
          >
            Nova Promoção
          </button>
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
      
      {/* Formulário de Promoção */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {modoEdicao ? 'Editar Promoção' : 'Nova Promoção'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Promoção *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      id="dataInicio"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Término *
                    </label>
                    <input
                      type="date"
                      id="dataFim"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="tipoDesconto" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Desconto *
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="percentual"
                        checked={tipoDesconto === 'percentual'}
                        onChange={() => setTipoDesconto('percentual')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Percentual (%)</span>
                    </label>
                    
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="valor"
                        checked={tipoDesconto === 'valor'}
                        onChange={() => setTipoDesconto('valor')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Valor Fixo (R$)</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="valorDesconto" className="block text-sm font-medium text-gray-700 mb-1">
                    {tipoDesconto === 'percentual' ? 'Percentual de Desconto (%)' : 'Valor do Desconto (R$)'} *
                  </label>
                  <input
                    type="number"
                    id="valorDesconto"
                    value={valorDesconto}
                    onChange={(e) => setValorDesconto(e.target.value)}
                    step="0.01"
                    min="0"
                    max={tipoDesconto === 'percentual' ? "100" : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativa"
                    checked={ativa}
                    onChange={(e) => setAtiva(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="ativa" className="ml-2 block text-sm text-gray-900">
                    Promoção Ativa
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                    Aplicar a uma Categoria
                  </label>
                  <select
                    id="categoria"
                    value={categoriaSelecionada}
                    onChange={(e) => handleSelecionarCategoria(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((categoria, index) => (
                      <option key={index} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Produtos Incluídos na Promoção *
                  </label>
                  <div className="border border-gray-300 rounded-md h-64 overflow-y-auto p-2">
                    {produtos.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Nenhum produto cadastrado</p>
                    ) : (
                      <div className="space-y-2">
                        {produtos.map((produto) => (
                          <div key={produto.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`produto-${produto.id}`}
                              checked={produtosSelecionados.includes(produto.id)}
                              onChange={() => handleToggleProduto(produto.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`produto-${produto.id}`} className="ml-2 block text-sm text-gray-900">
                              {produto.nome} - {formatarMoeda(produto.precoVenda)}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Produtos selecionados: {produtosSelecionados.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  'Salvar Promoção'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="filtroStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="filtroStatus"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas</option>
              <option value="ativas">Ativas</option>
              <option value="inativas">Inativas</option>
              <option value="expiradas">Expiradas</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="filtroProduto" className="block text-sm font-medium text-gray-700 mb-1">
              Produto
            </label>
            <select
              id="filtroProduto"
              value={filtroProduto}
              onChange={(e) => setFiltroProduto(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os produtos</option>
              {produtos.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="filtroCategoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              id="filtroCategoria"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as categorias</option>
              {categorias.map((categoria, index) => (
                <option key={index} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Lista de Promoções */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Promoções</h2>
        </div>
        
        {promocoesFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhuma promoção encontrada.</p>
            <p className="mt-2">Crie uma nova promoção ou ajuste os filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promoção
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Desconto
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
                {promocoesFiltradas.map((promocao) => {
                  const statusInfo = verificarStatus(promocao);
                  
                  return (
                    <tr key={promocao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{promocao.nome}</div>
                        <div className="text-sm text-gray-500">
                          {promocao.produtosIds.length} produtos incluídos
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>De: {formatarData(promocao.dataInicio)}</div>
                        <div>Até: {formatarData(promocao.dataFim)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {promocao.tipoDesconto === 'percentual' ? (
                          <span>{promocao.valorDesconto}%</span>
                        ) : (
                          <span>{formatarMoeda(promocao.valorDesconto)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.classe}`}>
                          {statusInfo.texto}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditarPromocao(promocao)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Editar"
                            disabled={!hasPermission('operador')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleExcluirPromocao(promocao.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                            disabled={!hasPermission('operador')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromocoesPage;
