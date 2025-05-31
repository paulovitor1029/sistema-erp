import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaixa, MovimentacaoCaixa } from '../hooks/useCaixa';
import { useFuncionarios } from '../../usuarios/hooks/useFuncionarios';
import { useAuth } from '../../auth/context/AuthContext';

const CaixaPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    movimentacoes, 
    caixaAtual, 
    isLoading, 
    error, 
    abrirCaixa, 
    fecharCaixa, 
    registrarMovimentacao,
    recarregarMovimentacoes,
    recarregarFechamentos
  } = useCaixa();
  const { funcionarios } = useFuncionarios();
  const { hasPermission } = useAuth();
  
  const [filtro, setFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [dataInicioFiltro, setDataInicioFiltro] = useState('');
  const [dataFimFiltro, setDataFimFiltro] = useState('');
  const [movimentacoesFiltradas, setMovimentacoesFiltradas] = useState<MovimentacaoCaixa[]>([]);
  
  const [valorInicial, setValorInicial] = useState(0);
  const [valorFinal, setValorFinal] = useState(0);
  const [observacao, setObservacao] = useState('');
  
  const [novaMovimentacao, setNovaMovimentacao] = useState({
    tipo: 'entrada' as 'entrada' | 'saida',
    categoria: '',
    descricao: '',
    valor: 0,
    formaPagamento: 'dinheiro',
    observacao: ''
  });
  
  const [mostrarFormAbertura, setMostrarFormAbertura] = useState(false);
  const [mostrarFormFechamento, setMostrarFormFechamento] = useState(false);
  const [mostrarFormMovimentacao, setMostrarFormMovimentacao] = useState(false);
  
  // Definir data inicial e final do dia atual para filtro
  useEffect(() => {
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
    
    setDataInicioFiltro(inicioHoje.toISOString().split('T')[0]);
    setDataFimFiltro(fimHoje.toISOString().split('T')[0]);
  }, []);
  
  // Aplicar filtros
  useEffect(() => {
    let resultado = [...movimentacoes];
    
    // Filtro por descrição
    if (filtro) {
      const termoLowerCase = filtro.toLowerCase();
      resultado = resultado.filter(m => 
        m.descricao.toLowerCase().includes(termoLowerCase)
      );
    }
    
    // Filtro por tipo
    if (tipoFiltro !== 'todos') {
      resultado = resultado.filter(m => m.tipo === tipoFiltro);
    }
    
    // Filtro por categoria
    if (categoriaFiltro) {
      resultado = resultado.filter(m => m.categoria === categoriaFiltro);
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
  }, [movimentacoes, filtro, tipoFiltro, categoriaFiltro, dataInicioFiltro, dataFimFiltro]);
  
  // Extrair categorias únicas
  const categorias = [...new Set(movimentacoes.map(m => m.categoria))];
  
  const handleAbrirCaixa = async () => {
    if (!user) {
      alert('Usuário não identificado');
      return;
    }
    
    if (valorInicial < 0) {
      alert('O valor inicial não pode ser negativo');
      return;
    }
    
    const resultado = await abrirCaixa(user.id, valorInicial, observacao);
    
    if (resultado) {
      alert('Caixa aberto com sucesso!');
      setValorInicial(0);
      setObservacao('');
      setMostrarFormAbertura(false);
    } else {
      alert('Erro ao abrir caixa. Verifique se já não existe um caixa aberto.');
    }
  };
  
  const handleFecharCaixa = async () => {
    if (!user) {
      alert('Usuário não identificado');
      return;
    }
    
    if (valorFinal < 0) {
      alert('O valor final não pode ser negativo');
      return;
    }
    
    const resultado = await fecharCaixa(user.id, valorFinal, observacao);
    
    if (resultado) {
      alert('Caixa fechado com sucesso!');
      setValorFinal(0);
      setObservacao('');
      setMostrarFormFechamento(false);
    } else {
      alert('Erro ao fechar caixa. Verifique se existe um caixa aberto.');
    }
  };
  
  const handleRegistrarMovimentacao = async () => {
    if (!user) {
      alert('Usuário não identificado');
      return;
    }
    
    if (!novaMovimentacao.categoria) {
      alert('Selecione uma categoria');
      return;
    }
    
    if (!novaMovimentacao.descricao) {
      alert('Informe uma descrição');
      return;
    }
    
    if (novaMovimentacao.valor <= 0) {
      alert('O valor deve ser maior que zero');
      return;
    }
    
    const resultado = await registrarMovimentacao({
      ...novaMovimentacao,
      funcionarioId: user.id
    });
    
    if (resultado) {
      alert('Movimentação registrada com sucesso!');
      setNovaMovimentacao({
        tipo: 'entrada',
        categoria: '',
        descricao: '',
        valor: 0,
        formaPagamento: 'dinheiro',
        observacao: ''
      });
      setMostrarFormMovimentacao(false);
      recarregarMovimentacoes();
    } else {
      alert('Erro ao registrar movimentação. Verifique se existe um caixa aberto.');
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
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getNomeFuncionario = (id: number) => {
    const funcionario = funcionarios.find(f => f.id === id);
    return funcionario ? funcionario.nome : 'Funcionário não encontrado';
  };
  
  const getTipoMovimentacao = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return { texto: 'Entrada', classe: 'bg-green-100 text-green-800' };
      case 'saida':
        return { texto: 'Saída', classe: 'bg-red-100 text-red-800' };
      default:
        return { texto: tipo, classe: 'bg-gray-100 text-gray-800' };
    }
  };
  
  // Calcular totais
  const totalEntradas = movimentacoesFiltradas
    .filter(m => m.tipo === 'entrada')
    .reduce((sum, m) => sum + m.valor, 0);
  
  const totalSaidas = movimentacoesFiltradas
    .filter(m => m.tipo === 'saida')
    .reduce((sum, m) => sum + m.valor, 0);
  
  const saldo = totalEntradas - totalSaidas;
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Controle de Caixa</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {!caixaAtual ? (
            <button
              onClick={() => setMostrarFormAbertura(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              disabled={!hasPermission('operador')}
            >
              Abrir Caixa
            </button>
          ) : (
            <>
              <button
                onClick={() => setMostrarFormMovimentacao(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={!hasPermission('operador')}
              >
                Nova Movimentação
              </button>
              
              <button
                onClick={() => setMostrarFormFechamento(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                disabled={!hasPermission('operador')}
              >
                Fechar Caixa
              </button>
            </>
          )}
          
          <button
            onClick={() => navigate('/relatorios/caixa')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Relatórios
          </button>
        </div>
      </div>
      
      {/* Status do Caixa */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Status do Caixa</h2>
        
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
            <p>Carregando status do caixa...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">
            <p>Erro ao carregar status do caixa: {error}</p>
            <button
              onClick={() => {
                recarregarMovimentacoes();
                recarregarFechamentos();
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : caixaAtual ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500">Aberto em</div>
                <div className="text-lg font-medium">{formatarData(caixaAtual.dataAbertura)}</div>
                <div className="text-sm text-gray-500 mt-2">Por</div>
                <div className="text-base">{getNomeFuncionario(caixaAtual.funcionarioAberturaId)}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500">Valor Inicial</div>
                <div className="text-lg font-medium">{formatarMoeda(caixaAtual.valorInicial)}</div>
                <div className="text-sm text-gray-500 mt-2">Status</div>
                <div className="text-base font-medium text-green-600">Aberto</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500">Movimentações</div>
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Entradas</div>
                    <div className="text-base text-green-600">{formatarMoeda(totalEntradas)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Saídas</div>
                    <div className="text-base text-red-600">{formatarMoeda(totalSaidas)}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-2">Saldo Atual</div>
                <div className={`text-lg font-medium ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatarMoeda(caixaAtual.valorInicial + saldo)}
                </div>
              </div>
            </div>
            
            {caixaAtual.observacao && (
              <div className="bg-yellow-50 p-4 rounded-md">
                <div className="text-sm text-gray-500">Observação</div>
                <div className="text-base">{caixaAtual.observacao}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p>Não há caixa aberto no momento.</p>
            <p className="mt-2">Clique em "Abrir Caixa" para iniciar as operações.</p>
          </div>
        )}
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="filtro" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por descrição
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
              Tipo
            </label>
            <select
              id="tipo"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
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
              {categorias.map((categoria, index) => (
                <option key={index} value={categoria}>{categoria}</option>
              ))}
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
              setTipoFiltro('todos');
              setCategoriaFiltro('');
              
              const hoje = new Date();
              const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
              const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
              
              setDataInicioFiltro(inicioHoje.toISOString().split('T')[0]);
              setDataFimFiltro(fimHoje.toISOString().split('T')[0]);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
      
      {/* Resumo */}
      {movimentacoesFiltradas.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Resumo do Período</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">Total de Entradas</div>
              <div className="text-xl font-medium text-green-600">{formatarMoeda(totalEntradas)}</div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">Total de Saídas</div>
              <div className="text-xl font-medium text-red-600">{formatarMoeda(totalSaidas)}</div>
            </div>
            
            <div className={`${saldo >= 0 ? 'bg-blue-50' : 'bg-yellow-50'} p-4 rounded-md`}>
              <div className="text-sm text-gray-500">Saldo</div>
              <div className={`text-xl font-medium ${saldo >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                {formatarMoeda(saldo)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabela de Movimentações */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Movimentações</h2>
        </div>
        
        {isLoading ? (
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
            {(filtro || tipoFiltro !== 'todos' || categoriaFiltro || dataInicioFiltro || dataFimFiltro) && (
              <p className="mt-2">Tente ajustar os filtros para ver mais resultados.</p>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forma de Pagamento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimentacoesFiltradas.map((mov) => {
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
                        {mov.categoria}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {mov.descricao}
                        {mov.observacao && (
                          <div className="text-xs text-gray-500 mt-1">{mov.observacao}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                          {formatarMoeda(mov.valor)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mov.formaPagamento}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getNomeFuncionario(mov.funcionarioId)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal de Abertura de Caixa */}
      {mostrarFormAbertura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Abrir Caixa</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="valorInicial" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Inicial
                </label>
                <input
                  type="number"
                  id="valorInicial"
                  min="0"
                  step="0.01"
                  value={valorInicial}
                  onChange={(e) => setValorInicial(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="observacaoAbertura" className="block text-sm font-medium text-gray-700 mb-1">
                  Observação (opcional)
                </label>
                <textarea
                  id="observacaoAbertura"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Informações adicionais sobre a abertura do caixa..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setMostrarFormAbertura(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAbrirCaixa}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Abrir Caixa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Fechamento de Caixa */}
      {mostrarFormFechamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Fechar Caixa</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="text-sm text-gray-500">Valor Inicial</div>
                <div className="text-base font-medium">{formatarMoeda(caixaAtual?.valorInicial || 0)}</div>
                
                <div className="text-sm text-gray-500 mt-2">Movimentações</div>
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Entradas</div>
                    <div className="text-base text-green-600">{formatarMoeda(totalEntradas)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Saídas</div>
                    <div className="text-base text-red-600">{formatarMoeda(totalSaidas)}</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 mt-2">Saldo Esperado</div>
                <div className="text-base font-medium">{formatarMoeda((caixaAtual?.valorInicial || 0) + totalEntradas - totalSaidas)}</div>
              </div>
              
              <div>
                <label htmlFor="valorFinal" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Final em Caixa
                </label>
                <input
                  type="number"
                  id="valorFinal"
                  min="0"
                  step="0.01"
                  value={valorFinal}
                  onChange={(e) => setValorFinal(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="observacaoFechamento" className="block text-sm font-medium text-gray-700 mb-1">
                  Observação (opcional)
                </label>
                <textarea
                  id="observacaoFechamento"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Informações adicionais sobre o fechamento do caixa..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setMostrarFormFechamento(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFecharCaixa}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Fechar Caixa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Nova Movimentação */}
      {mostrarFormMovimentacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Nova Movimentação</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="tipoMovimentacao" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="tipoMovimentacao"
                      value="entrada"
                      checked={novaMovimentacao.tipo === 'entrada'}
                      onChange={() => setNovaMovimentacao({...novaMovimentacao, tipo: 'entrada'})}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">Entrada</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="tipoMovimentacao"
                      value="saida"
                      checked={novaMovimentacao.tipo === 'saida'}
                      onChange={() => setNovaMovimentacao({...novaMovimentacao, tipo: 'saida'})}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">Saída</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="categoriaMovimentacao" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  id="categoriaMovimentacao"
                  list="categorias"
                  value={novaMovimentacao.categoria}
                  onChange={(e) => setNovaMovimentacao({...novaMovimentacao, categoria: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite ou selecione uma categoria"
                />
                <datalist id="categorias">
                  {categorias.map((categoria, index) => (
                    <option key={index} value={categoria} />
                  ))}
                  {novaMovimentacao.tipo === 'entrada' && (
                    <>
                      <option value="Venda" />
                      <option value="Recebimento" />
                      <option value="Empréstimo" />
                      <option value="Investimento" />
                    </>
                  )}
                  {novaMovimentacao.tipo === 'saida' && (
                    <>
                      <option value="Fornecedor" />
                      <option value="Despesa" />
                      <option value="Salário" />
                      <option value="Imposto" />
                      <option value="Aluguel" />
                      <option value="Energia" />
                      <option value="Água" />
                      <option value="Internet" />
                      <option value="Telefone" />
                    </>
                  )}
                </datalist>
              </div>
              
              <div>
                <label htmlFor="descricaoMovimentacao" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  id="descricaoMovimentacao"
                  value={novaMovimentacao.descricao}
                  onChange={(e) => setNovaMovimentacao({...novaMovimentacao, descricao: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva a movimentação"
                />
              </div>
              
              <div>
                <label htmlFor="valorMovimentacao" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  id="valorMovimentacao"
                  min="0.01"
                  step="0.01"
                  value={novaMovimentacao.valor}
                  onChange={(e) => setNovaMovimentacao({...novaMovimentacao, valor: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {novaMovimentacao.tipo === 'entrada' && (
                <div>
                  <label htmlFor="formaPagamento" className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    id="formaPagamento"
                    value={novaMovimentacao.formaPagamento}
                    onChange={(e) => setNovaMovimentacao({...novaMovimentacao, formaPagamento: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="pix">PIX</option>
                    <option value="boleto">Boleto</option>
                    <option value="transferencia">Transferência Bancária</option>
                  </select>
                </div>
              )}
              
              <div>
                <label htmlFor="observacaoMovimentacao" className="block text-sm font-medium text-gray-700 mb-1">
                  Observação (opcional)
                </label>
                <textarea
                  id="observacaoMovimentacao"
                  value={novaMovimentacao.observacao}
                  onChange={(e) => setNovaMovimentacao({...novaMovimentacao, observacao: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Informações adicionais..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setMostrarFormMovimentacao(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegistrarMovimentacao}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaixaPage;
