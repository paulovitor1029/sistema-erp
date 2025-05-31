import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProdutos, Produto } from '../hooks/useProdutos';
import { useAuth } from '../../auth/context/AuthContext';

const ProdutosPage = () => {
  const navigate = useNavigate();
  const { produtos, isLoading, error, alterarStatusProduto, excluirProduto, recarregarProdutos } = useProdutos();
  const { hasPermission } = useAuth();
  
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  
  // Extrair categorias únicas dos produtos
  useEffect(() => {
    if (produtos.length > 0) {
      const categoriasUnicas = [...new Set(produtos.map(p => p.categoria))];
      setCategorias(categoriasUnicas);
    }
  }, [produtos]);
  
  // Aplicar filtros
  useEffect(() => {
    let resultado = [...produtos];
    
    // Filtro por texto (código ou nome)
    if (filtro) {
      const termoLowerCase = filtro.toLowerCase();
      resultado = resultado.filter(p => 
        p.codigo.toLowerCase().includes(termoLowerCase) || 
        p.nome.toLowerCase().includes(termoLowerCase)
      );
    }
    
    // Filtro por categoria
    if (categoriaFiltro) {
      resultado = resultado.filter(p => p.categoria === categoriaFiltro);
    }
    
    // Filtro por status
    if (statusFiltro !== 'todos') {
      const ativo = statusFiltro === 'ativos';
      resultado = resultado.filter(p => p.ativo === ativo);
    }
    
    setProdutosFiltrados(resultado);
  }, [produtos, filtro, categoriaFiltro, statusFiltro]);
  
  const handleAlterarStatus = async (id: number, novoStatus: boolean) => {
    if (!hasPermission('operador')) {
      alert('Você não tem permissão para alterar o status de produtos.');
      return;
    }
    
    const resultado = await alterarStatusProduto(id, novoStatus);
    if (resultado) {
      recarregarProdutos();
    }
  };
  
  const handleExcluirProduto = async (id: number) => {
    if (!hasPermission('gerente')) {
      alert('Você não tem permissão para excluir produtos.');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      const resultado = await excluirProduto(id);
      if (resultado) {
        recarregarProdutos();
      }
    }
  };
  
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Gerenciamento de Produtos</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate('/produtos/novo')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={!hasPermission('operador')}
          >
            Novo Produto
          </button>
          
          <button
            onClick={() => navigate('/produtos/categorias')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            disabled={!hasPermission('gerente')}
          >
            Gerenciar Categorias
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="filtro" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por código ou nome
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
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              id="categoria"
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as categorias</option>
              {categorias.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltro('');
                setCategoriaFiltro('');
                setStatusFiltro('todos');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabela de Produtos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p>Carregando produtos...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>Erro ao carregar produtos: {error}</p>
            <button
              onClick={recarregarProdutos}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : produtos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhum produto cadastrado no sistema.</p>
            <button
              onClick={() => navigate('/produtos/novo')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={!hasPermission('operador')}
            >
              Cadastrar Primeiro Produto
            </button>
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhum produto encontrado com os filtros atuais.</p>
            <p className="mt-2">Tente ajustar os filtros para ver mais resultados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço de Venda
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
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
                {produtosFiltrados.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {produto.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {produto.imagem && (
                          <img 
                            src={produto.imagem} 
                            alt={produto.nome} 
                            className="h-10 w-10 rounded-full mr-3 object-cover"
                          />
                        )}
                        <span>{produto.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {produto.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarMoeda(produto.precoVenda)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className={`mr-2 ${produto.estoqueAtual < produto.estoqueMinimo ? 'text-red-600 font-bold' : ''}`}>
                          {produto.estoqueAtual} {produto.unidadeMedida}
                        </span>
                        {produto.estoqueAtual < produto.estoqueMinimo && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Abaixo do mínimo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        produto.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/produtos/${produto.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => navigate(`/produtos/editar/${produto.id}`)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                          disabled={!hasPermission('operador')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleAlterarStatus(produto.id, !produto.ativo)}
                          className={`${produto.ativo ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'}`}
                          title={produto.ativo ? 'Desativar' : 'Ativar'}
                          disabled={!hasPermission('operador')}
                        >
                          {produto.ativo ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleExcluirProduto(produto.id)}
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

export default ProdutosPage;
