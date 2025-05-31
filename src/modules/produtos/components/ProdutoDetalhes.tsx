import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProdutos } from '../hooks/useProdutos';
import { useEstoque } from '../../estoque/hooks/useEstoque';

const ProdutoDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { produtos, getProdutoPorId, isLoading: isLoadingProduto, error: produtoError } = useProdutos();
  const { movimentacoes, getHistoricoProduto, isLoading: isLoadingEstoque, error: estoqueError } = useEstoque();
  
  const [produto, setProduto] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  
  useEffect(() => {
    if (id && produtos.length > 0) {
      const produtoId = parseInt(id);
      const produtoEncontrado = getProdutoPorId(produtoId);
      
      if (produtoEncontrado) {
        setProduto(produtoEncontrado);
        setHistorico(getHistoricoProduto(produtoId));
      }
    }
  }, [id, produtos, movimentacoes, getProdutoPorId, getHistoricoProduto]);
  
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
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
  
  if (isLoadingProduto || isLoadingEstoque) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p>Carregando detalhes do produto...</p>
        </div>
      </div>
    );
  }
  
  if (produtoError || estoqueError) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="p-8 text-center text-red-600">
          <p>Erro ao carregar detalhes do produto: {produtoError || estoqueError}</p>
          <button
            onClick={() => navigate('/produtos')}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Voltar para Produtos
          </button>
        </div>
      </div>
    );
  }
  
  if (!produto) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="p-8 text-center text-red-600">
          <p>Produto não encontrado</p>
          <button
            onClick={() => navigate('/produtos')}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Voltar para Produtos
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Detalhes do Produto</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/produtos/editar/${produto.id}`)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => navigate('/produtos')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coluna da imagem */}
            <div className="flex flex-col items-center">
              {produto.imagem ? (
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="w-full max-w-xs h-auto object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full max-w-xs h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg
                    className="h-24 w-24 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              
              <div className="mt-4 text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  produto.ativo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {produto.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
            
            {/* Coluna de informações */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold mb-4">{produto.nome}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Código</p>
                  <p className="font-medium">{produto.codigo}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Categoria</p>
                  <p className="font-medium">{produto.categoria}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Preço de Custo</p>
                  <p className="font-medium">{formatarMoeda(produto.precoCusto)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Preço de Venda</p>
                  <p className="font-medium">{formatarMoeda(produto.precoVenda)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Margem de Lucro</p>
                  <p className="font-medium">
                    {produto.precoCusto > 0 
                      ? `${(((produto.precoVenda - produto.precoCusto) / produto.precoCusto) * 100).toFixed(2)}%` 
                      : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Unidade de Medida</p>
                  <p className="font-medium">{produto.unidadeMedida}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Estoque Atual</p>
                  <p className={`font-medium ${produto.estoqueAtual < produto.estoqueMinimo ? 'text-red-600' : ''}`}>
                    {produto.estoqueAtual} {produto.unidadeMedida}
                    {produto.estoqueAtual < produto.estoqueMinimo && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Abaixo do mínimo
                      </span>
                    )}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Estoque Mínimo</p>
                  <p className="font-medium">{produto.estoqueMinimo} {produto.unidadeMedida}</p>
                </div>
                
                {produto.validade && (
                  <div>
                    <p className="text-sm text-gray-500">Data de Validade</p>
                    <p className="font-medium">{new Date(produto.validade).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </div>
              
              {produto.observacoes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Observações</p>
                  <p className="mt-1 text-gray-700">{produto.observacoes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Histórico de Movimentações */}
        <div className="border-t border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold mb-4">Histórico de Movimentações</h3>
          
          {historico.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma movimentação registrada para este produto.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
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
                  {historico.map((mov) => {
                    const tipoInfo = getTipoMovimentacao(mov.tipo);
                    return (
                      <tr key={mov.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatarData(mov.data)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoInfo.classe}`}>
                            {tipoInfo.texto}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {mov.quantidade} {produto.unidadeMedida}
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
    </div>
  );
};

export default ProdutoDetalhes;
