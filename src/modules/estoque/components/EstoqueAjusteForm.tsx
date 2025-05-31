import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { useProdutos } from '../../produtos/hooks/useProdutos';

const EstoqueAjusteForm = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { produtos, isLoading: isLoadingProdutos } = useProdutos();
  
  const [formData, setFormData] = useState({
    produtoId: '',
    quantidadeAtual: '',
    quantidadeNova: '',
    motivo: '',
    data: new Date().toISOString().split('T')[0],
    observacao: '',
    responsavel: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'produtoId' && value) {
      const produtoSelecionado = produtos.find(p => p.id.toString() === value);
      if (produtoSelecionado) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          quantidadeAtual: produtoSelecionado.estoqueAtual.toString(),
          quantidadeNova: produtoSelecionado.estoqueAtual.toString()
        }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.produtoId || !formData.quantidadeNova || !formData.motivo) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Em um cenário real, aqui você enviaria os dados para o backend
      
      alert('Ajuste de estoque realizado com sucesso!');
      navigate('/estoque');
    } catch (err) {
      setError('Erro ao realizar ajuste de estoque.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verificar se o usuário tem permissão para acessar esta página
  if (!hasPermission('gerente')) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
        <button
          onClick={() => navigate('/estoque')}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Voltar para Estoque
        </button>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Ajuste de Estoque</h1>
        
        <button
          onClick={() => navigate('/estoque')}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Voltar para Estoque
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Informações do Ajuste</h2>
          <p className="text-sm text-red-600 mt-1">
            Atenção: Os ajustes de estoque devem ser realizados apenas em situações específicas, como inventário ou correção de erros.
          </p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="produtoId" className="block text-sm font-medium text-gray-700 mb-1">
              Produto *
            </label>
            {isLoadingProdutos ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span>Carregando produtos...</span>
              </div>
            ) : (
              <select
                id="produtoId"
                name="produtoId"
                value={formData.produtoId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um produto</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} ({produto.codigo}) - Estoque: {produto.estoqueAtual} {produto.unidadeMedida}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div>
            <label htmlFor="quantidadeAtual" className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade Atual
            </label>
            <input
              type="number"
              id="quantidadeAtual"
              name="quantidadeAtual"
              value={formData.quantidadeAtual}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
              readOnly
            />
          </div>
          
          <div>
            <label htmlFor="quantidadeNova" className="block text-sm font-medium text-gray-700 mb-1">
              Nova Quantidade *
            </label>
            <input
              type="number"
              id="quantidadeNova"
              name="quantidadeNova"
              value={formData.quantidadeNova}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo do Ajuste *
            </label>
            <select
              id="motivo"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione um motivo</option>
              <option value="inventario">Inventário</option>
              <option value="erro_lancamento">Erro de Lançamento</option>
              <option value="perda">Perda/Avaria não registrada</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
              Data *
            </label>
            <input
              type="date"
              id="data"
              name="data"
              value={formData.data}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700 mb-1">
              Responsável *
            </label>
            <input
              type="text"
              id="responsavel"
              name="responsavel"
              value={formData.responsavel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="observacao" className="block text-sm font-medium text-gray-700 mb-1">
              Observação *
            </label>
            <textarea
              id="observacao"
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Descreva detalhadamente o motivo deste ajuste de estoque"
            />
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/estoque')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : 'Confirmar Ajuste'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EstoqueAjusteForm;
