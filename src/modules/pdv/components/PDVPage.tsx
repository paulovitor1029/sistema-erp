import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePDV } from '../hooks/usePDV';
import { useProdutos } from '../../produtos/hooks/useProdutos';
import { usePromocoes } from '../../promocoes/hooks/usePromocoes';
import { useAuth } from '../../auth/context/AuthContext';

const PDVPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    vendaAtual, 
    iniciarVenda, 
    adicionarItem, 
    removerItem, 
    atualizarQuantidadeItem,
    aplicarDescontoGeral,
    finalizarVenda,
    cancelarVenda,
    isLoading, 
    error 
  } = usePDV();
  const { produtos } = useProdutos();
  const { getPromocoesAtivas } = usePromocoes();
  
  const [codigoProduto, setCodigoProduto] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [busca, setBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const [descontoGeral, setDescontoGeral] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [observacao, setObservacao] = useState('');
  const [mostrarFinalizacao, setMostrarFinalizacao] = useState(false);
  const [valorRecebido, setValorRecebido] = useState(0);
  
  // Iniciar venda ao carregar a página
  useEffect(() => {
    if (!vendaAtual && user) {
      iniciarVenda(user.id);
    }
  }, [vendaAtual, user, iniciarVenda]);
  
  // Buscar produtos
  useEffect(() => {
    if (busca.trim()) {
      const resultados = produtos.filter(p => 
        p.ativo && (
          p.nome.toLowerCase().includes(busca.toLowerCase()) ||
          p.codigo.toLowerCase().includes(busca.toLowerCase())
        )
      );
      setResultadosBusca(resultados);
    } else {
      setResultadosBusca([]);
    }
  }, [busca, produtos]);
  
  // Buscar produto por código
  const buscarProdutoPorCodigo = () => {
    if (!codigoProduto.trim()) return;
    
    const produto = produtos.find(p => 
      p.codigo === codigoProduto.trim() && p.ativo
    );
    
    if (produto) {
      setProdutoSelecionado(produto);
      setCodigoProduto('');
    } else {
      alert('Produto não encontrado ou inativo');
    }
  };
  
  // Adicionar produto à venda
  const adicionarProduto = async (produto: any) => {
    if (!vendaAtual) return;
    
    // Verificar se há promoções ativas para o produto
    const promocoesAtivas = getPromocoesAtivas();
    const promocoesProduto = promocoesAtivas.filter(p => 
      p.produtoId === produto.id || 
      (p.categoriaId && p.categoriaId === produto.categoria)
    );
    
    let precoFinal = produto.precoVenda;
    let descontoProduto = 0;
    let promocaoId;
    
    // Aplicar promoção (se houver)
    if (promocoesProduto.length > 0) {
      // Pegar a promoção com maior desconto
      const melhorPromocao = promocoesProduto.reduce((melhor, atual) => {
        if (atual.tipoDesconto === 'percentual') {
          const descontoAtual = produto.precoVenda * (atual.valorDesconto / 100);
          const descontoMelhor = melhor 
            ? (melhor.tipoDesconto === 'percentual' 
                ? produto.precoVenda * (melhor.valorDesconto / 100) 
                : melhor.valorDesconto)
            : 0;
          
          return descontoAtual > descontoMelhor ? atual : melhor;
        } else {
          return atual.valorDesconto > (melhor ? melhor.valorDesconto : 0) ? atual : melhor;
        }
      }, null);
      
      if (melhorPromocao) {
        promocaoId = melhorPromocao.id;
        
        if (melhorPromocao.tipoDesconto === 'percentual') {
          descontoProduto = produto.precoVenda * (melhorPromocao.valorDesconto / 100);
        } else {
          descontoProduto = melhorPromocao.valorDesconto;
        }
        
        precoFinal = produto.precoVenda - descontoProduto;
      }
    }
    
    const resultado = await adicionarItem(
      produto.id,
      quantidade,
      produto.precoVenda,
      descontoProduto,
      promocaoId
    );
    
    if (resultado) {
      setProdutoSelecionado(null);
      setQuantidade(1);
    } else {
      alert('Erro ao adicionar produto');
    }
  };
  
  // Selecionar produto da busca
  const selecionarProduto = (produto: any) => {
    setProdutoSelecionado(produto);
    setBusca('');
    setMostrarBusca(false);
  };
  
  // Aplicar desconto geral
  const handleAplicarDescontoGeral = async () => {
    if (!vendaAtual) return;
    
    if (descontoGeral < 0 || descontoGeral > vendaAtual.subtotal) {
      alert('Valor de desconto inválido');
      return;
    }
    
    const resultado = await aplicarDescontoGeral(descontoGeral);
    
    if (!resultado) {
      alert('Erro ao aplicar desconto');
    }
  };
  
  // Finalizar venda
  const handleFinalizarVenda = async () => {
    if (!vendaAtual) return;
    
    if (vendaAtual.itens.length === 0) {
      alert('Adicione pelo menos um produto para finalizar a venda');
      return;
    }
    
    if (!formaPagamento) {
      alert('Selecione uma forma de pagamento');
      return;
    }
    
    // Validar valor recebido para pagamento em dinheiro
    if (formaPagamento === 'dinheiro' && valorRecebido < vendaAtual.total) {
      alert('O valor recebido deve ser maior ou igual ao valor total');
      return;
    }
    
    const resultado = await finalizarVenda(formaPagamento, observacao);
    
    if (resultado) {
      alert('Venda finalizada com sucesso!');
      setMostrarFinalizacao(false);
      setDescontoGeral(0);
      setFormaPagamento('dinheiro');
      setObservacao('');
      setValorRecebido(0);
      
      // Redirecionar para a página de vendas ou imprimir comprovante
      navigate('/vendas');
    } else {
      alert('Erro ao finalizar venda');
    }
  };
  
  // Cancelar venda
  const handleCancelarVenda = async () => {
    if (!vendaAtual) return;
    
    if (window.confirm('Tem certeza que deseja cancelar esta venda?')) {
      const motivo = prompt('Informe o motivo do cancelamento (opcional):');
      
      const resultado = await cancelarVenda(motivo || undefined);
      
      if (resultado) {
        alert('Venda cancelada com sucesso!');
        navigate('/vendas');
      } else {
        alert('Erro ao cancelar venda');
      }
    }
  };
  
  // Formatar valor monetário
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  // Calcular troco
  const calcularTroco = () => {
    if (!vendaAtual) return 0;
    
    return Math.max(0, valorRecebido - vendaAtual.total);
  };
  
  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p>Carregando PDV...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="p-8 text-center text-red-600">
          <p>Erro ao carregar PDV: {error}</p>
          <button
            onClick={() => navigate('/vendas')}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Voltar para Vendas
          </button>
        </div>
      </div>
    );
  }
  
  if (!vendaAtual) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="p-8 text-center">
          <p>Iniciando nova venda...</p>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mt-2"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Coluna da esquerda - Produtos */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Adicionar Produtos</h2>
            
            {/* Busca por código de barras */}
            <div className="flex mb-4">
              <input
                type="text"
                value={codigoProduto}
                onChange={(e) => setCodigoProduto(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && buscarProdutoPorCodigo()}
                placeholder="Código de barras"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={buscarProdutoPorCodigo}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
              >
                Buscar
              </button>
            </div>
            
            {/* Busca por nome */}
            <div className="relative mb-4">
              <input
                type="text"
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setMostrarBusca(true);
                }}
                onFocus={() => setMostrarBusca(true)}
                placeholder="Buscar produto por nome"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {mostrarBusca && resultadosBusca.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {resultadosBusca.map((produto) => (
                    <div
                      key={produto.id}
                      onClick={() => selecionarProduto(produto)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="font-medium">{produto.nome}</div>
                      <div className="text-sm text-gray-500">
                        {produto.codigo} - {formatarMoeda(produto.precoVenda)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Produto selecionado */}
            {produtoSelecionado && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{produtoSelecionado.nome}</h3>
                  <span className="text-lg font-semibold">{formatarMoeda(produtoSelecionado.precoVenda)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-l-md hover:bg-gray-300"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantidade}
                      onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-3 py-1 border-t border-b border-gray-300 text-center focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantidade(quantidade + 1)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setProdutoSelecionado(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => adicionarProduto(produtoSelecionado)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Lista de itens */}
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qtd
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço Unit.
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Desconto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendaAtual.itens.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        Nenhum produto adicionado
                      </td>
                    </tr>
                  ) : (
                    vendaAtual.itens.map((item) => {
                      const produto = produtos.find(p => p.id === item.produtoId);
                      
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {produto ? produto.nome : 'Produto não encontrado'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {produto ? produto.codigo : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <button
                                onClick={() => atualizarQuantidadeItem(item.id, item.quantidade - 1)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <span className="mx-2 text-sm text-gray-700">{item.quantidade}</span>
                              <button
                                onClick={() => atualizarQuantidadeItem(item.id, item.quantidade + 1)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatarMoeda(item.precoUnitario)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.desconto > 0 ? (
                              <span className="text-green-600">
                                -{formatarMoeda(item.desconto)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatarMoeda(item.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => removerItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Remover"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Coluna da direita - Resumo e Pagamento */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Resumo da Venda</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatarMoeda(vendaAtual.subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Desconto:</span>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={descontoGeral}
                    onChange={(e) => setDescontoGeral(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-l-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAplicarDescontoGeral}
                    className="px-2 py-1 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-blue-600">{formatarMoeda(vendaAtual.total)}</span>
                </div>
              </div>
              
              <div className="pt-4 space-y-4">
                <button
                  onClick={() => setMostrarFinalizacao(true)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  disabled={vendaAtual.itens.length === 0}
                >
                  Finalizar Venda
                </button>
                
                <button
                  onClick={handleCancelarVenda}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Cancelar Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Finalização */}
      {mostrarFinalizacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Finalizar Venda</h2>
            
            <div className="space-y-4">
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
                  <option value="transferencia">Transferência Bancária</option>
                </select>
              </div>
              
              {formaPagamento === 'dinheiro' && (
                <div>
                  <label htmlFor="valorRecebido" className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Recebido
                  </label>
                  <input
                    type="number"
                    id="valorRecebido"
                    min={vendaAtual.total}
                    step="0.01"
                    value={valorRecebido}
                    onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <div className="mt-2 flex justify-between text-sm">
                    <span>Troco:</span>
                    <span className="font-medium">{formatarMoeda(calcularTroco())}</span>
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="observacao" className="block text-sm font-medium text-gray-700 mb-1">
                  Observação (opcional)
                </label>
                <textarea
                  id="observacao"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Informações adicionais sobre a venda..."
                />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total a Pagar:</span>
                  <span className="text-xl font-bold text-blue-600">{formatarMoeda(vendaAtual.total)}</span>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setMostrarFinalizacao(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleFinalizarVenda}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Confirmar Pagamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDVPage;
