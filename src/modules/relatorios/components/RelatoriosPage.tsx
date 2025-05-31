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
  
  const handleExportarPDF = () => {
    alert('Funcionalidade de exportação para PDF será implementada no backend');
  };
  
  const handleExportarExcel = () => {
    alert('Funcionalidade de exportação para Excel será implementada no backend');
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
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimentacoes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Não há movimentações no período selecionado
                    </td>
                  </tr>
                ) : (
                  movimentacoes.map((mov) => (
                    <tr key={mov.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarData(mov.data)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          mov.tipo === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mov.categoria}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {mov.descricao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                          {formatarMoeda(mov.valor)}
                        </span>
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
  
  // Componente de relatório de clientes
  const RelatorioClientes = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Total de Clientes</div>
            <div className="text-2xl font-bold text-blue-600">{clientes.length}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Clientes Ativos</div>
            <div className="text-2xl font-bold text-green-600">
              {clientes.filter(c => c.ativo).length}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Valor Total em Compras</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatarMoeda(clientes.reduce((sum, c) => sum + c.valorTotalCompras, 0))}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Clientes por Valor de Compra</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF/CNPJ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Compra
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total em Compras
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pontos Fidelidade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Não há clientes cadastrados
                    </td>
                  </tr>
                ) : (
                  // Ordenar por valor total de compras (decrescente)
                  [...clientes]
                    .sort((a, b) => b.valorTotalCompras - a.valorTotalCompras)
                    .map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cliente.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cliente.cpfCnpj}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cliente.dataUltimaCompra ? formatarData(cliente.dataUltimaCompra) : 'Nunca'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatarMoeda(cliente.valorTotalCompras)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cliente.pontosFidelidade} pts
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
  
  // Componente de relatório de funcionários
  const RelatorioFuncionarios = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Total de Funcionários</div>
            <div className="text-2xl font-bold text-blue-600">{funcionarios.length}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Funcionários Ativos</div>
            <div className="text-2xl font-bold text-green-600">
              {funcionarios.filter(f => f.ativo).length}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-sm text-gray-500">Total em Salários</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatarMoeda(funcionarios.reduce((sum, f) => sum + (f.ativo ? f.salario : 0), 0))}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Funcionários por Cargo</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funcionário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nível de Acesso
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Admissão
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {funcionarios.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Não há funcionários cadastrados
                    </td>
                  </tr>
                ) : (
                  // Ordenar por cargo
                  [...funcionarios]
                    .sort((a, b) => a.cargo.localeCompare(b.cargo))
                    .map((funcionario) => (
                      <tr key={funcionario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {funcionario.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {funcionario.cargo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {funcionario.nivelAcesso === 'admin' ? 'Administrador' : 
                           funcionario.nivelAcesso === 'gerente' ? 'Gerente' : 'Operador'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatarData(funcionario.dataAdmissao)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatarMoeda(funcionario.salario)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            funcionario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {funcionario.ativo ? 'Ativo' : 'Inativo'}
                          </span>
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
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Relatórios</h1>
        
        {relatorioGerado && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleExportarPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Exportar PDF
            </button>
            
            <button
              onClick={handleExportarExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Exportar Excel
            </button>
          </div>
        )}
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
              <option value="vendas">Vendas</option>
              <option value="estoque">Estoque</option>
              <option value="financeiro">Financeiro</option>
              <option value="clientes">Clientes</option>
              <option value="funcionarios">Funcionários</option>
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
          
          {tipoRelatorio === 'vendas' && (
            <div>
              <label htmlFor="agruparPor" className="block text-sm font-medium text-gray-700 mb-1">
                Agrupar Por
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
                <option value="funcionario">Funcionário</option>
                <option value="cliente">Cliente</option>
                <option value="produto">Produto</option>
              </select>
            </div>
          )}
        </div>
        
        {/* Filtros adicionais específicos por tipo de relatório */}
        {tipoRelatorio === 'vendas' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="funcionario" className="block text-sm font-medium text-gray-700 mb-1">
                Funcionário
              </label>
              <select
                id="funcionario"
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
              <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                id="cliente"
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
                <option value="">Todas</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
                <option value="transferencia">Transferência Bancária</option>
              </select>
            </div>
          </div>
        )}
        
        {tipoRelatorio === 'estoque' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="produto" className="block text-sm font-medium text-gray-700 mb-1">
                Produto
              </label>
              <select
                id="produto"
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
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                id="categoria"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as categorias</option>
                {[...new Set(produtos.map(p => p.categoria))].map((categoria, index) => (
                  <option key={index} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={handleGerarRelatorio}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Gerar Relatório
          </button>
        </div>
      </div>
      
      {/* Conteúdo do Relatório */}
      {isLoading ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p>Gerando relatório...</p>
        </div>
      ) : error ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center text-red-600">
          <p>Erro ao gerar relatório: {error}</p>
          <button
            onClick={handleGerarRelatorio}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      ) : relatorioGerado ? (
        <>
          {tipoRelatorio === 'vendas' && <RelatorioVendas />}
          {tipoRelatorio === 'estoque' && <RelatorioEstoque />}
          {tipoRelatorio === 'financeiro' && <RelatorioFinanceiro />}
          {tipoRelatorio === 'clientes' && <RelatorioClientes />}
          {tipoRelatorio === 'funcionarios' && <RelatorioFuncionarios />}
        </>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
          <p>Selecione os filtros e clique em "Gerar Relatório" para visualizar os dados.</p>
        </div>
      )}
    </div>
  );
};

export default RelatoriosPage;
