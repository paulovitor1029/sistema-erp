import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaixa } from '../hooks/useCaixa';
import { useProdutos } from '../../produtos/hooks/useProdutos';
import { useClientes } from '../../clientes/hooks/useClientes';
import { useAuth } from '../../auth/context/AuthContext';

const CaixaPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { movimentacoes, saldoAtual, registrarMovimentacao, fecharCaixa, abrirCaixa, caixaAberto } = useCaixa();
  const { produtos } = useProdutos();
  const { clientes } = useClientes();
  
  // Estados para movimentação
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState<number | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState('1');
  
  // Estados para abertura/fechamento de caixa
  const [valorInicial, setValorInicial] = useState('');
  const [valorFinal, setValorFinal] = useState('');
  const [observacao, setObservacao] = useState('');
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAbrirCaixaModal, setShowAbrirCaixaModal] = useState(false);
  const [showFecharCaixaModal, setShowFecharCaixaModal] = useState(false);
  
  // Filtros para movimentações
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [movimentacoesFiltradas, setMovimentacoesFiltradas] = useState(movimentacoes);
  
  // Definir data inicial e final do dia atual para filtro
  useEffect(() => {
    const hoje = new Date();
    const dataHoje = hoje.toISOString().split('T')[0];
    
    setDataInicio(dataHoje);
    setDataFim(dataHoje);
  }, []);
  
  // Aplicar filtros
  useEffect(() => {
    let resultado = [...movimentacoes];
    
    // Filtro por data de início
    if (dataInicio) {
      resultado = resultado.filter(m => m.data >= dataInicio);
    }
    
    // Filtro por data de fim
    if (dataFim) {
      resultado = resultado.filter(m => m.data <= dataFim);
    }
    
    // Filtro por tipo
    if (tipoFiltro !== 'todos') {
      resultado = resultado.filter(m => m.tipo === tipoFiltro);
    }
    
    // Ordenar por data e hora (mais recente primeiro)
    resultado.sort((a, b) => {
      const dataA = new Date(`${a.data}T${a.hora}`).getTime();
      const dataB = new Date(`${b.data}T${b.hora}`).getTime();
      return dataB - dataA;
    });
    
    setMovimentacoesFiltradas(resultado);
  }, [movimentacoes, dataInicio, dataFim, tipoFiltro]);
  
  // Buscar produto por código de barras
  useEffect(() => {
    if (codigoBarras.length >= 8) {
      const produto = produtos.find(p => p.codigoBarras === codigoBarras);
      if (produto) {
        setProdutoSelecionado(produto.id);
        setDescricao(`Venda - ${produto.nome}`);
        setValor(produto.precoVenda.toString());
        setCodigoBarras('');
      }
    }
  }, [codigoBarras, produtos]);
  
  // Atualizar descrição e valor quando produto é selecionado
  useEffect(() => {
    if (produtoSelecionado) {
      const produto = produtos.find(p => p.id === produtoSelecionado);
      if (produto) {
        setDescricao(`Venda - ${produto.nome}`);
        const total = produto.precoVenda * parseInt(quantidade || '1');
        setValor(total.toString());
      }
    }
  }, [produtoSelecionado, quantidade, produtos]);
  
  const handleRegistrarMovimentacao = async () => {
    if (!descricao || !valor) {
      setError('Preencha a descrição e o valor');
      return;
    }
    
    if (!caixaAberto) {
      setError('O caixa precisa estar aberto para registrar movimentações');
      setShowAbrirCaixaModal(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const valorNumerico = parseFloat(valor);
      
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        setError('Valor inválido');
        setIsLoading(false);
        return;
      }
      
      const movimentacaoData = {
        tipo,
        descricao,
        valor: valorNumerico,
        formaPagamento,
        data: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().split(' ')[0],
        produtoId: produtoSelecionado,
        clienteId: clienteSelecionado,
        quantidade: parseInt(quantidade || '1')
      };
      
      const resultado = await registrarMovimentacao(movimentacaoData);
      
      if (resultado) {
        setSuccess('Movimentação registrada com sucesso!');
        // Limpar formulário
        setDescricao('');
        setValor('');
        setProdutoSelecionado(null);
        setClienteSelecionado(null);
        setQuantidade('1');
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError('Erro ao registrar movimentação');
      }
    } catch (err) {
      setError('Erro ao processar a solicitação');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAbrirCaixa = async () => {
    if (!valorInicial) {
      setError('Informe o valor inicial do caixa');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const valorInicialNumerico = parseFloat(valorInicial);
      
      if (isNaN(valorInicialNumerico) || valorInicialNumerico < 0) {
        setError('Valor inicial inválido');
        setIsLoading(false);
        return;
      }
      
      const resultado = await abrirCaixa({
        valorInicial: valorInicialNumerico,
        data: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().split(' ')[0],
        observacao
      });
      
      if (resultado) {
        setSuccess('Caixa aberto com sucesso!');
        setShowAbrirCaixaModal(false);
        setValorInicial('');
        setObservacao('');
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError('Erro ao abrir caixa');
      }
    } catch (err) {
      setError('Erro ao processar a solicitação');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFecharCaixa = async () => {
    if (!valorFinal) {
      setError('Informe o valor final do caixa');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const valorFinalNumerico = parseFloat(valorFinal);
      
      if (isNaN(valorFinalNumerico) || valorFinalNumerico < 0) {
        setError('Valor final inválido');
        setIsLoading(false);
        return;
      }
      
      const resultado = await fecharCaixa({
        valorFinal: valorFinalNumerico,
        data: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().split(' ')[0],
        observacao
      });
      
      if (resultado) {
        setSuccess('Caixa fechado com sucesso!');
        setShowFecharCaixaModal(false);
        setValorFinal('');
        setObservacao('');
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError('Erro ao fechar caixa');
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
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Controle de Caixa</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {caixaAberto ? (
            <button
              onClick={() => setShowFecharCaixaModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              disabled={!hasPermission('operador')}
            >
              Fechar Caixa
            </button>
          ) : (
            <button
              onClick={() => setShowAbrirCaixaModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              disabled={!hasPermission('operador')}
            >
              Abrir Caixa
            </button>
          )}
          
          <button
            onClick={() => navigate('/relatorios/caixa')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Relatórios
          </button>
        </div>
      </div>
      
      {/* Status do Caixa */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Status do Caixa</h2>
            <p className="text-sm text-gray-500">
              {caixaAberto ? 'Caixa aberto' : 'Caixa fechado'}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="text-sm text-gray-500">Saldo Atual</div>
            <div className="text-2xl font-bold text-blue-600">{formatarMoeda(saldoAtual)}</div>
          </div>
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
      
      {/* Formulário de Movimentação */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Registrar Movimentação</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimentação
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="entrada"
                    checked={tipo === 'entrada'}
                    onChange={() => setTipo('entrada')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Entrada</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="saida"
                    checked={tipo === 'saida'}
                    onChange={() => setTipo('saida')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Saída</span>
                </label>
              </div>
            </div>
            
            <div>
              <label htmlFor="codigoBarras" className="block text-sm font-medium text-gray-700 mb-1">
                Código de Barras (para vendas)
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
              <label htmlFor="produto" className="block text-sm font-medium text-gray-700 mb-1">
                Produto
              </label>
              <select
                id="produto"
                value={produtoSelecionado || ''}
                onChange={(e) => setProdutoSelecionado(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um produto</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} - {formatarMoeda(produto.precoVenda)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                id="quantidade"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <input
                type="text"
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Venda de produto, Pagamento de fornecedor"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                id="valor"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
              <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
                Cliente (opcional)
              </label>
              <select
                id="cliente"
                value={clienteSelecionado || ''}
                onChange={(e) => setClienteSelecionado(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleRegistrarMovimentacao}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isLoading || !caixaAberto}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>Registrando...</span>
              </div>
            ) : (
              'Registrar Movimentação'
            )}
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          
          <div>
            <label htmlFor="tipoFiltro" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="tipoFiltro"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Tabela de Movimentações */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Movimentações</h2>
        </div>
        
        {movimentacoesFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhuma movimentação encontrada para o período selecionado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forma de Pagamento
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimentacoesFiltradas.map((movimentacao) => (
                  <tr key={movimentacao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(movimentacao.data).toLocaleDateString('pt-BR')} {movimentacao.hora}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {movimentacao.descricao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        movimentacao.tipo === 'entrada' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movimentacao.formaPagamento === 'dinheiro' && 'Dinheiro'}
                      {movimentacao.formaPagamento === 'cartao_credito' && 'Cartão de Crédito'}
                      {movimentacao.formaPagamento === 'cartao_debito' && 'Cartão de Débito'}
                      {movimentacao.formaPagamento === 'pix' && 'PIX'}
                      {movimentacao.formaPagamento === 'boleto' && 'Boleto'}
                      {movimentacao.formaPagamento === 'transferencia' && 'Transferência'}
                      {movimentacao.formaPagamento === 'outro' && 'Outro'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span className={movimentacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                        {formatarMoeda(movimentacao.valor)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal de Abertura de Caixa */}
      {showAbrirCaixaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Abrir Caixa</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="valorInicial" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Inicial (R$)
                </label>
                <input
                  type="number"
                  id="valorInicial"
                  value={valorInicial}
                  onChange={(e) => setValorInicial(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowAbrirCaixaModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleAbrirCaixa}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Abrindo...</span>
                  </div>
                ) : (
                  'Abrir Caixa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Fechamento de Caixa */}
      {showFecharCaixaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Fechar Caixa</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="valorFinal" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Final (R$)
                </label>
                <input
                  type="number"
                  id="valorFinal"
                  value={valorFinal}
                  onChange={(e) => setValorFinal(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowFecharCaixaModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleFecharCaixa}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Fechando...</span>
                  </div>
                ) : (
                  'Fechar Caixa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaixaPage;
