import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePromocoes, Promocao } from '../hooks/usePromocoes';
import { useProdutos } from '../../produtos/hooks/useProdutos';
import { useAuth } from '../../auth/context/AuthContext';

const PromocoesPage = () => {
  const navigate = useNavigate();
  const { promocoes, isLoading, error, alterarStatusPromocao, excluirPromocao, recarregarPromocoes } = usePromocoes();
  const { produtos } = useProdutos();
  const { hasPermission } = useAuth();
  
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [promocoesFiltradas, setPromocoesFiltradas] = useState<Promocao[]>([]);
  
  // Aplicar filtros
  useEffect(() => {
    let resultado = [...promocoes];
    
    // Filtro por nome ou descrição
    if (filtro) {
      const termoLowerCase = filtro.toLowerCase();
      resultado = resultado.filter(p => 
        p.nome.toLowerCase().includes(termoLowerCase) || 
        (p.descricao && p.descricao.toLowerCase().includes(termoLowerCase)) ||
        (p.produtoId && produtos.find(prod => prod.id === p.produtoId)?.nome.toLowerCase().includes(termoLowerCase))
      );
    }
    
    // Filtro por status
    if (statusFiltro !== 'todos') {
      const hoje = new Date();
      
      if (statusFiltro === 'ativas') {
        resultado = resultado.filter(p => 
          p.ativo && 
          new Date(p.dataInicio) <= hoje && 
          new Date(p.dataFim) >= hoje
        );
      } else if (statusFiltro === 'inativas') {
        resultado = resultado.filter(p => !p.ativo);
      } else if (statusFiltro === 'agendadas') {
        resultado = resultado.filter(p => 
          p.ativo && 
          new Date(p.dataInicio) > hoje
        );
      } else if (statusFiltro === 'expiradas') {
        resultado = resultado.filter(p => 
          new Date(p.dataFim) < hoje
        );
      }
    }
    
    // Filtro por tipo
    if (tipoFiltro !== 'todos') {
      if (tipoFiltro === 'produto') {
        resultado = resultado.filter(p => p.produtoId !== undefined);
      } else if (tipoFiltro === 'categoria') {
        resultado = resultado.filter(p => p.categoriaId !== undefined);
      }
    }
    
    // Ordenar por data de início (mais recente primeiro)
    resultado.sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
    
    setPromocoesFiltradas(resultado);
  }, [promocoes, produtos, filtro, statusFiltro, tipoFiltro]);
  
  const handleAlterarStatus = async (id: number, novoStatus: boolean) => {
    if (!hasPermission('operador')) {
      alert('Você não tem permissão para alterar o status de promoções.');
      return;
    }
    
    const resultado = await alterarStatusPromocao(id, novoStatus);
    if (resultado) {
      recarregarPromocoes();
    }
  };
  
  const handleExcluirPromocao = async (id: number) => {
    if (!hasPermission('gerente')) {
      alert('Você não tem permissão para excluir promoções.');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir esta promoção?')) {
      const resultado = await excluirPromocao(id);
      if (resultado) {
        recarregarPromocoes();
      }
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
  
  const getStatusPromocao = (promocao: Promocao) => {
    const hoje = new Date();
    const dataInicio = new Date(promocao.dataInicio);
    const dataFim = new Date(promocao.dataFim);
    
    if (!promocao.ativo) {
      return { texto: 'Inativa', classe: 'bg-gray-100 text-gray-800' };
    } else if (dataInicio > hoje) {
      return { texto: 'Agendada', classe: 'bg-blue-100 text-blue-800' };
    } else if (dataFim < hoje) {
      return { texto: 'Expirada', classe: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { texto: 'Ativa', classe: 'bg-green-100 text-green-800' };
    }
  };
  
  const getNomeProdutoOuCategoria = (promocao: Promocao) => {
    if (promocao.produtoId) {
      const produto = produtos.find(p => p.id === promocao.produtoId);
      return produto ? produto.nome : 'Produto não encontrado';
    } else if (promocao.categoriaId) {
      return `Categoria: ${promocao.categoriaId}`;
    } else {
      return 'Todos os produtos';
    }
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Gerenciamento de Promoções</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate('/promocoes/nova')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={!hasPermission('operador')}
          >
            Nova Promoção
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="filtro" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nome ou produto
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
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os status</option>
              <option value="ativas">Ativas</option>
              <option value="agendadas">Agendadas</option>
              <option value="expiradas">Expiradas</option>
              <option value="inativas">Inativas</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="tipo"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os tipos</option>
              <option value="produto">Por produto</option>
              <option value="categoria">Por categoria</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setFiltro('');
              setStatusFiltro('todos');
              setTipoFiltro('todos');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
      
      {/* Tabela de Promoções */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p>Carregando promoções...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>Erro ao carregar promoções: {error}</p>
            <button
              onClick={recarregarPromocoes}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : promocoesFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhuma promoção encontrada.</p>
            {(filtro || statusFiltro !== 'todos' || tipoFiltro !== 'todos') && (
              <p className="mt-2">Tente ajustar os filtros ou adicione uma nova promoção.</p>
            )}
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
                    Aplicação
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Desconto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
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
                  const statusInfo = getStatusPromocao(promocao);
                  
                  return (
                    <tr key={promocao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{promocao.nome}</div>
                        {promocao.descricao && (
                          <div className="text-sm text-gray-500">{promocao.descricao}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getNomeProdutoOuCategoria(promocao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {promocao.tipoDesconto === 'percentual' 
                          ? `${promocao.valorDesconto}%` 
                          : formatarMoeda(promocao.valorDesconto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>De: {formatarData(promocao.dataInicio)}</div>
                        <div>Até: {formatarData(promocao.dataFim)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.classe}`}>
                          {statusInfo.texto}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/promocoes/${promocao.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Visualizar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => navigate(`/promocoes/editar/${promocao.id}`)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Editar"
                            disabled={!hasPermission('operador')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleAlterarStatus(promocao.id, !promocao.ativo)}
                            className={`${promocao.ativo ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'}`}
                            title={promocao.ativo ? 'Desativar' : 'Ativar'}
                            disabled={!hasPermission('operador')}
                          >
                            {promocao.ativo ? (
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
                            onClick={() => handleExcluirPromocao(promocao.id)}
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
