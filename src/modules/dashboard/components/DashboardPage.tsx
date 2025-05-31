import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProdutos } from '../../produtos/hooks/useProdutos';
import { useEstoque } from '../../estoque/hooks/useEstoque';
import { useCaixa } from '../../caixa/hooks/useCaixa';
import { useFuncionarios } from '../../usuarios/hooks/useFuncionarios';
import { useAuth } from '../../auth/context/AuthContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { produtos, isLoading: isLoadingProdutos } = useProdutos();
  const { movimentacoes, isLoading: isLoadingEstoque } = useEstoque();
  const { saldoAtual, isLoading: isLoadingCaixa } = useCaixa();
  const { funcionarios, isLoading: isLoadingFuncionarios } = useFuncionarios();
  
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [valorTotalEstoque, setValorTotalEstoque] = useState(0);
  const [produtosAbaixoMinimo, setProdutosAbaixoMinimo] = useState(0);
  const [funcionariosAtivos, setFuncionariosAtivos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calcular estatísticas
  useEffect(() => {
    // Verificar se todos os dados foram carregados
    if (isLoadingProdutos || isLoadingEstoque || isLoadingCaixa || isLoadingFuncionarios) {
      setIsLoading(true);
      return;
    }
    
    setIsLoading(false);
    
    // Total de produtos
    setTotalProdutos(produtos.length);
    
    // Valor total em estoque
    const valorTotal = produtos.reduce((total, produto) => {
      return total + (produto.precoCusto * produto.estoqueAtual);
    }, 0);
    setValorTotalEstoque(valorTotal);
    
    // Produtos abaixo do mínimo
    const abaixoMinimo = produtos.filter(produto => produto.estoqueAtual < produto.estoqueMinimo).length;
    setProdutosAbaixoMinimo(abaixoMinimo);
    
    // Funcionários ativos
    const ativos = funcionarios.filter(funcionario => funcionario.ativo).length;
    setFuncionariosAtivos(ativos);
    
  }, [produtos, funcionarios, isLoadingProdutos, isLoadingEstoque, isLoadingCaixa, isLoadingFuncionarios]);
  
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Carregando informações do dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Dashboard</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate('/relatorios')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Ver Relatórios
          </button>
        </div>
      </div>
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total de Produtos</p>
              <p className="text-xl font-bold text-gray-800">{totalProdutos}</p>
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/produtos')}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Ver detalhes &rarr;
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Valor em Estoque</p>
              <p className="text-xl font-bold text-gray-800">{formatarMoeda(valorTotalEstoque)}</p>
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/estoque')}
              className="text-sm text-green-500 hover:text-green-700"
            >
              Ver detalhes &rarr;
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Saldo em Caixa</p>
              <p className="text-xl font-bold text-gray-800">{formatarMoeda(saldoAtual)}</p>
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/caixa')}
              className="text-sm text-yellow-500 hover:text-yellow-700"
            >
              Ver detalhes &rarr;
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Funcionários Ativos</p>
              <p className="text-xl font-bold text-gray-800">{funcionariosAtivos}</p>
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/funcionarios')}
              className="text-sm text-purple-500 hover:text-purple-700"
            >
              Ver detalhes &rarr;
            </button>
          </div>
        </div>
      </div>
      
      {/* Alertas */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Alertas</h2>
        
        <div className="space-y-4">
          {produtosAbaixoMinimo > 0 ? (
            <div className="flex items-center p-4 bg-red-50 rounded-md border border-red-200">
              <div className="p-2 rounded-full bg-red-100 text-red-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Produtos abaixo do estoque mínimo: {produtosAbaixoMinimo}</p>
                <p className="text-xs text-red-600">Verifique o estoque e faça os pedidos necessários.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center p-4 bg-green-50 rounded-md border border-green-200">
              <div className="p-2 rounded-full bg-green-100 text-green-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Todos os produtos estão com estoque adequado</p>
                <p className="text-xs text-green-600">Não há produtos abaixo do estoque mínimo.</p>
              </div>
            </div>
          )}
          
          {movimentacoes.length === 0 ? (
            <div className="flex items-center p-4 bg-blue-50 rounded-md border border-blue-200">
              <div className="p-2 rounded-full bg-blue-100 text-blue-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Nenhuma venda registrada</p>
                <p className="text-xs text-blue-600">Registre suas vendas no módulo PDV.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center p-4 bg-blue-50 rounded-md border border-blue-200">
              <div className="p-2 rounded-full bg-blue-100 text-blue-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Movimentações registradas: {movimentacoes.length}</p>
                <p className="text-xs text-blue-600">Verifique o histórico completo no módulo de Estoque.</p>
              </div>
            </div>
          )}
          
          {funcionarios.length === 0 ? (
            <div className="flex items-center p-4 bg-yellow-50 rounded-md border border-yellow-200">
              <div className="p-2 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Nenhum funcionário cadastrado</p>
                <p className="text-xs text-yellow-600">Cadastre funcionários no módulo de Funcionários.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center p-4 bg-green-50 rounded-md border border-green-200">
              <div className="p-2 rounded-full bg-green-100 text-green-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Funcionários ativos: {funcionariosAtivos}</p>
                <p className="text-xs text-green-600">Total de funcionários: {funcionarios.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Vendas por Período</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500">Gráfico de vendas por período</p>
              <p className="text-sm text-gray-400 mt-2">Disponível quando houver dados de vendas</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Produtos Mais Vendidos</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p className="text-gray-500">Gráfico de produtos mais vendidos</p>
              <p className="text-sm text-gray-400 mt-2">Disponível quando houver dados de vendas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
