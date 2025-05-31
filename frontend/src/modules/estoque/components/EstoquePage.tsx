import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstoque, MovimentacaoEstoque } from '../hooks/useEstoque';
import { useProdutos } from '../../produtos/hooks/useProdutos';
import { useAuth } from '../../auth/context/AuthContext';

const EstoquePage = () => {
  const navigate = useNavigate();
  const { movimentacoes, isLoading, error, recarregarMovimentacoes } = useEstoque();
  const { produtos, isLoading: isLoadingProdutos } = useProdutos();
  const { hasPermission } = useAuth();
  
  const [filtro, setFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [dataInicioFiltro, setDataInicioFiltro] = useState('');
  const [dataFimFiltro, setDataFimFiltro] = useState('');
  const [movimentacoesFiltradas, setMovimentacoesFiltradas] = useState<MovimentacaoEstoque[]>([]);
  
  // Aplicar filtros
  useEffect(() => {
    let resultado = [...movimentacoes];
    
    // Filtro por produto
    if (filtro) {
      const termoLowerCase = filtro.toLowerCase();
      resultado = resultado.filter(m => {
        const produto = produtos.find(p => p.id === m.produtoId);
        return produto && (
          produto.nome.toLowerCase().includes(termoLowerCase) || 
          produto.codigo.toLowerCase().includes(termoLowerCase)
        );
      });
    }
    
    // Filtro por tipo
    if (tipoFiltro) {
      resultado = resultado.filter(m => m.tipo === tipoFiltro);
    }
    
    // Filtro por data de início
    if (dataInicioFiltro) {
      const dataInicio = new Date(dataInicioFiltro);
      dataInicio.setHours(0, 0, 0, 0);
      resultado = resultado.filter(m => new Date(m.data) >= dataInicio);
    }
    
    // Filtro por data de fim
    if (dataFimFiltro) {
      const dataFim = new Date(dataFimFiltro);
      dataFim.setHours(23, 59, 59, 999);
      resultado = resultado.filter(m => new Date(m.data) <= dataFim);
    }
    
    // Ordenar por data (mais recente primeiro)
    resultado.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    
    setMovimentacoesFiltradas(resultado);
  }, [movimentacoes, produtos, filtro, tipoFiltro, dataInicioFiltro, dataFimFiltro]);
  
  const getNomeProduto = (produtoId: number) => {
    const produto = produtos.find(p => p.id === produtoId);
    return produto ? produto.nome : 'Produto não encontrado';
  };
  
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getTipoMovimentacao = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return { texto: 'Entrada', classe: 'bg-green-100 text-green-800' };
      case 'saida':
        return { texto: 'Saída', classe: 'bg-red-100 text-red-800' };
      case 'ajuste':
        return { texto: 'Ajuste', classe: 'bg-blue-100 text-blue-800' };
      case 'perda':
        return { texto: 'Perda', classe: 'bg-yellow-100 text-yellow-800' };
      case 'devolucao':
        return { texto: 'Devolução', classe: 'bg-purple-100 text-purple-800' };
      default:
        return { texto: tipo, classe: 'bg-gray-100 text-gray-800' };
    }
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Controle de Estoque</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate('/estoque/entrada')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            disabled={!hasPermission('operador')}
          >
            Registrar Entrada
          </button>
          
          <button
            onClick={() => navigate('/estoque/saida')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            disabled={!hasPermission('operador')}
          >
            Registrar Saída
          </button>
          
          <button
            onClick={() => navigate('/estoque/ajuste')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={!hasPermission('gerente')}
          >
            Ajuste de Estoque
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="filtro" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por produto
            </label>
            <input
              type="text"
              id="filtro"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Digite para buscar..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Movimentação
            </label>
            <select
              id="tipo"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os tipos</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
              <option value="ajuste">Ajuste</option>
              <option value="perda">Perda</option>
              <option value="devolucao">Devolução</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              id="dataInicio"
              value={dataInicioFiltro}
              onChange={(e) => setDataInicioFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              id="dataFim"
              value={dataFimFiltro}
              onChange={(e) => setDataFimFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setFiltro('');
              setTipoFiltro('');
              setDataInicioFiltro('');
              setDataFimFiltro('');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
      
      {/* Alertas de Estoque */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Alertas de Estoque</h2>
        
        {isLoadingProdutos ? (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
            <p>Carregando alertas...</p>
          </div>
        ) : produtos.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>Nenhum produto cadastrado no sistema.</p>
            <button
              onClick={() => navigate('/produtos/novo')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={!hasPermission('operador')}
            >
              Cadastrar Produto
            </button>
          </div>
        ) : produtos.filter(p => p.estoqueAtual < p.estoqueMinimo).length === 0 ? (
          <p className="text-green-600">Não há produtos abaixo do estoque mínimo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Atual
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Mínimo
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtos
                  .filter(p => p.estoqueAtual < p.estoqueMinimo)
                  .map((produto) => (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {produto.nome}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-red-600 font-bold">
                          {produto.estoqueAtual} {produto.unidadeMedida}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {produto.estoqueMinimo} {produto.unidadeMedida}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/estoque/entrada?produtoId=${produto.id}`)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          disabled={!hasPermission('operador')}
                        >
                          Registrar Entrada
                        </button>
                        <button
                          onClick={() => navigate(`/produtos/${produto.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver Produto
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Histórico de Movimentações */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Histórico de Movimentações</h2>
        </div>
        
        {isLoading || isLoadingProdutos ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p>Carregando movimentações...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>Erro ao carregar movimentações: {error}</p>
            <button
              onClick={recarregarMovimentacoes}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : movimentacoesFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhuma movimentação encontrada.</p>
            {(filtro || tipoFiltro || dataInicioFiltro || dataFimFiltro) ? (
              <p className="mt-2">Tente ajustar os filtros para ver mais resultados.</p>
            ) : (
              <div className="mt-4">
                <p>Registre sua primeira movimentação de estoque.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  <button
                    onClick={() => navigate('/estoque/entrada')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    disabled={!hasPermission('operador')}
                  >
                    Registrar Entrada
                  </button>
                  <button
                    onClick={() => navigate('/estoque/saida')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    disabled={!hasPermission('operador')}
                  >
                    Registrar Saída
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observação
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimentacoesFiltradas.map((mov) => {
                  const tipoInfo = getTipoMovimentacao(mov.tipo);
                  const produto = produtos.find(p => p.id === mov.produtoId);
                  
                  return (
                    <tr key={mov.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarData(mov.data)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getNomeProduto(mov.produtoId)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {produto?.codigo || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoInfo.classe}`}>
                          {tipoInfo.texto}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mov.quantidade} {produto?.unidadeMedida || 'un'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mov.responsavel}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {mov.observacao || '-'}
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

export default EstoquePage;
