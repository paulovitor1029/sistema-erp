import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { useProdutos } from '../../produtos/hooks/useProdutos';

const EstoqueSaidaForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const { produtos, isLoading: isLoadingProdutos } = useProdutos();
  
  // Extrair produtoId da query string, se existir
  const queryParams = new URLSearchParams(location.search);
  const produtoIdParam = queryParams.get('produtoId');
  
  const [formData, setFormData] = useState({
    produtoId: produtoIdParam || '',
    quantidade: '',
    motivo: 'venda', // venda, perda, devolucao, outro
    destinatario: '',
    data: new Date().toISOString().split('T')[0],
    observacao: '',
    responsavel: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.produtoId || !formData.quantidade) {
      alert('Por favor, selecione um produto e informe a quantidade.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Em um cenário real, aqui você enviaria os dados para o backend
      
      alert('Saída de estoque registrada com sucesso!');
      navigate('/estoque');
    } catch (err) {
      setError('Erro ao registrar saída de estoque.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Registrar Saída de Estoque</h1>
        
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
          <h2 className="text-xl font-semibold">Informações da Saída</h2>
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
            <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade *
            </label>
            <input
              type="number"
              id="quantidade"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo da Saída *
            </label>
            <select
              id="motivo"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="venda">Venda</option>
              <option value="perda">Perda/Avaria</option>
              <option value="devolucao">Devolução ao Fornecedor</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="destinatario" className="block text-sm font-medium text-gray-700 mb-1">
              Destinatário/Cliente
            </label>
            <input
              type="text"
              id="destinatario"
              name="destinatario"
              value={formData.destinatario}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              Observação
            </label>
            <textarea
              id="observacao"
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            disabled={isLoading || !hasPermission('operador')}
          >
            {isLoading ? 'Registrando...' : 'Registrar Saída'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EstoqueSaidaForm;
