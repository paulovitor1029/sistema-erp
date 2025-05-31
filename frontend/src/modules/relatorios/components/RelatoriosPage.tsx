import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePDV } from '../../pdv/hooks/usePDV';
import { useCaixa } from '../../caixa/hooks/useCaixa';
import { useProdutos } from '../../produtos/hooks/useProdutos';
import { useClientes } from '../../clientes/hooks/useClientes';
import { useFuncionarios } from '../../usuarios/hooks/useFuncionarios';
import { useAuth } from '../../auth/context/AuthContext';

const RelatoriosPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [tipoRelatorio, setTipoRelatorio] = useState('vendas');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [funcionarioId, setFuncionarioId] = useState<number | null>(null);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [produtoId, setProdutoId] = useState<number | null>(null);
  const [categoriaId, setCategoriaId] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [agruparPor, setAgruparPor] = useState('dia');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatorioGerado, setRelatorioGerado] = useState(false);
  
  // Hooks para obter dados
  const { vendas } = usePDV();
  const { movimentacoes, fechamentos } = useCaixa();
  const { produtos } = useProdutos();
  const { clientes } = useClientes();
  const { funcionarios } = useFuncionarios();
  
  // Definir data inicial e final do mês atual para filtro
  useEffect(() => {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    setDataInicio(primeiroDiaMes.toISOString().split('T')[0]);
    setDataFim(ultimoDiaMes.toISOString().split('T')[0]);
  }, []);
  
  const handleGerarRelatorio = () => {
    if (!dataInicio || !dataFim) {
      alert('Selecione o período do relatório');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando geração de relatório
      setTimeout(() => {
        setIsLoading(false);
        setRelatorioGerado(true);
      }, 1000);
    } catch (err) {
      setError('Erro ao gerar relatório');
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
  
  // Componente de relatório de vendas
  const RelatorioVendas = () => {
    // Dados mockados para visualização
    const dadosVendas = {
      totalVendas: 0,
      quantidadeVendas: 0,
      ticketMedio: 0,
      vendasPorFormaPagamento: {},
      vendasPorDia: {},
      produtosMaisVendidos: [],
      clientesQueMaisCompraram: []
    };
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Total de Vendas</div>
            <div className="text-2xl font-bold text-blue-600">{formatarMoeda(dadosVendas.totalVendas)}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Quantidade de Vendas</div>
            <div className="text-2xl font-bold text-blue-600">{dadosVendas.quantidadeVendas}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Ticket Médio</div>
            <div className="text-2xl font-bold text-blue-600">{formatarMoeda(dadosVendas.ticketMedio)}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Produtos Vendidos</div>
            <div className="text-2xl font-bold text-blue-600">0</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Vendas por Forma de Pagamento</h3>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Não há dados para exibir</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Vendas por Período</h3>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Não há dados para exibir</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Produtos Mais Vendidos</h3>
            {dadosVendas.produtosMaisVendidos.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>Não há dados para exibir</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        Não há dados para exibir
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Clientes que Mais Compraram</h3>
            {dadosVendas.clientesQueMaisCompraram.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>Não há dados para exibir</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Compras
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        Não há dados para exibir
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Componente de relatório de estoque
  const RelatorioEstoque = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Total de Produtos</div>
            <div className="text-2xl font-bold text-blue-600">{produtos.length}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Valor Total em Estoque</div>
            <div className="text-2xl font-bold text-blue-600">{formatarMoeda(0)}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Produtos Abaixo do Mínimo</div>
            <div className="text-2xl font-bold text-red-600">0</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Produtos sem Estoque</div>
            <div className="text-2xl font-bold text-yellow-600">0</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Produtos em Estoque</h3>
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
                    Estoque Atual
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Mínimo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Unitário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Não há produtos cadastrados
                    </td>
                  </tr>
                ) : (
                  produtos.map((produto) => (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {produto.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {produto.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {produto.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {produto.estoqueAtual} {produto.unidadeMedida}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {produto.estoqueMinimo} {produto.unidadeMedida}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarMoeda(produto.precoCusto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarMoeda(produto.precoCusto * produto.estoqueAtual)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  // Componente de relatório financeiro
  const RelatorioFinanceiro = () => {
    // Dados mockados para visualização
    const dadosFinanceiros = {
      totalEntradas: 0,
      totalSaidas: 0,
      saldo: 0,
      entradasPorCategoria: {},
      saidasPorCategoria: {},
      fluxoPorPeriodo: {}
    };
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Total de Entradas</div>
            <div className="text-2xl font-bold text-green-600">{formatarMoeda(dadosFinanceiros.totalEntradas)}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Total de Saídas</div>
            <div className="text-2xl font-bold text-red-600">{formatarMoeda(dadosFinanceiros.totalSaidas)}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Saldo</div>
            <div className={`text-2xl font-bold ${dadosFinanceiros.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatarMoeda(dadosFinanceiros.saldo)}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Entradas por Categoria</h3>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Não há dados para exibir</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Saídas por Categoria</h3>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Não há dados para exibir</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Fluxo de Caixa</h3>
          <div className="h-80 flex items-center justify-center">
            <p className="text-gray-500">Não há dados para exibir</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Movimentações</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Não há movimentações para o período selecionado
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Relatórios</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            disabled={!relatorioGerado}
            className={`px-4 py-2 rounded-md flex items-center justify-center ${
              !relatorioGerado 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } transition-colors`}
            title={!relatorioGerado ? 'Gere um relatório primeiro' : 'Exportar para PDF'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Exportar para PDF
          </button>
          
          <button
            disabled={!relatorioGerado}
            className={`px-4 py-2 rounded-md flex items-center justify-center ${
              !relatorioGerado 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            } transition-colors`}
            title={!relatorioGerado ? 'Gere um relatório primeiro' : 'Exportar para Excel'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar para Excel
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="tipoRelatorio" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Relatório
            </label>
            <select
              id="tipoRelatorio"
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vendas">Relatório de Vendas</option>
              <option value="estoque">Relatório de Estoque</option>
              <option value="financeiro">Relatório Financeiro</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              id="dataInicio"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
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
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {tipoRelatorio === 'vendas' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="funcionarioId" className="block text-sm font-medium text-gray-700 mb-1">
                Funcionário
              </label>
              <select
                id="funcionarioId"
                value={funcionarioId || ''}
                onChange={(e) => setFuncionarioId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os funcionários</option>
                {funcionarios.map((funcionario) => (
                  <option key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                id="clienteId"
                value={clienteId || ''}
                onChange={(e) => setClienteId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os clientes</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
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
                <option value="">Todas as formas</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>
          </div>
        )}
        
        {tipoRelatorio === 'estoque' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="produtoId" className="block text-sm font-medium text-gray-700 mb-1">
                Produto
              </label>
              <select
                id="produtoId"
                value={produtoId || ''}
                onChange={(e) => setProdutoId(e.target.value ? parseInt(e.target.value) : null)}
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
              <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                id="categoriaId"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as categorias</option>
                {Array.from(new Set(produtos.map(p => p.categoria))).map((categoria, index) => (
                  <option key={index} value={categoria as string}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {tipoRelatorio === 'financeiro' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="agruparPor" className="block text-sm font-medium text-gray-700 mb-1">
                Agrupar por
              </label>
              <select
                id="agruparPor"
                value={agruparPor}
                onChange={(e) => setAgruparPor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dia">Dia</option>
                <option value="semana">Semana</option>
                <option value="mes">Mês</option>
              </select>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={handleGerarRelatorio}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>Gerando...</span>
              </div>
            ) : (
              'Gerar Relatório'
            )}
          </button>
        </div>
      </div>
      
      {/* Mensagem sobre exportação */}
      {relatorioGerado && (
        <div className="mb-4 text-sm text-gray-500 text-right">
          <p>Funcionalidade de exportação será disponibilizada em breve.</p>
        </div>
      )}
      
      {/* Conteúdo do Relatório */}
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      ) : relatorioGerado ? (
        <div>
          {tipoRelatorio === 'vendas' && <RelatorioVendas />}
          {tipoRelatorio === 'estoque' && <RelatorioEstoque />}
          {tipoRelatorio === 'financeiro' && <RelatorioFinanceiro />}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">Nenhum relatório gerado</h2>
          <p className="text-gray-500 mb-4">Selecione os filtros desejados e clique em "Gerar Relatório"</p>
        </div>
      )}
    </div>
  );
};

export default RelatoriosPage;
