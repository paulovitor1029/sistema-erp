import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';

const ProdutoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasPermission } = useAuth();
  const isEditMode = !!id;
  
  // Estados para o formulário
  const [formData, setFormData] = useState({
    codigo: '',
    codigoBarras: '',
    nome: '',
    descricao: '',
    categoria: '',
    unidadeMedida: 'un',
    precoCusto: 0,
    precoVenda: 0,
    margemLucro: 0,
    estoqueMinimo: 0,
    estoqueAtual: 0,
    validade: '',
    fornecedor: '',
    observacoes: '',
    ativo: true,
    imagem: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  
  // Categorias disponíveis (simulado)
  const categorias = [
    'Alimentos',
    'Bebidas',
    'Limpeza',
    'Eletrônicos',
    'Vestuário',
    'Papelaria'
  ];
  
  // Unidades de medida disponíveis
  const unidadesMedida = [
    { valor: 'un', label: 'Unidade' },
    { valor: 'kg', label: 'Quilograma' },
    { valor: 'g', label: 'Grama' },
    { valor: 'l', label: 'Litro' },
    { valor: 'ml', label: 'Mililitro' },
    { valor: 'cx', label: 'Caixa' },
    { valor: 'pct', label: 'Pacote' }
  ];
  
  // Carregar dados do produto se estiver em modo de edição
  useState(() => {
    if (isEditMode) {
      setIsLoading(true);
      
      // Simulando carregamento de dados
      setTimeout(() => {
        // Dados mockados para exemplo
        const produtoMock = {
          codigo: 'PROD001',
          codigoBarras: '7891234567890',
          nome: 'Produto de Exemplo',
          descricao: 'Descrição detalhada do produto de exemplo',
          categoria: 'Alimentos',
          unidadeMedida: 'un',
          precoCusto: 10.50,
          precoVenda: 19.90,
          margemLucro: 89.52,
          estoqueMinimo: 5,
          estoqueAtual: 15,
          validade: '2025-12-31',
          fornecedor: 'Fornecedor Exemplo',
          observacoes: 'Observações sobre o produto',
          ativo: true,
          imagem: 'https://via.placeholder.com/150'
        };
        
        setFormData(produtoMock);
        setImagemPreview(produtoMock.imagem);
        setIsLoading(false);
      }, 500);
    }
  }, [isEditMode, id]);
  
  // Calcular margem de lucro quando preço de custo ou venda mudar
  const calcularMargemLucro = (custo: number, venda: number) => {
    if (custo <= 0) return 0;
    return ((venda - custo) / custo) * 100;
  };
  
  // Atualizar preço de venda quando margem mudar
  const calcularPrecoVenda = (custo: number, margem: number) => {
    return custo * (1 + margem / 100);
  };
  
  // Manipuladores de eventos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    if (name === 'precoCusto') {
      const precoCusto = parseFloat(value) || 0;
      const margemLucro = calcularMargemLucro(precoCusto, formData.precoVenda);
      setFormData(prev => ({ ...prev, precoCusto, margemLucro }));
      return;
    }
    
    if (name === 'precoVenda') {
      const precoVenda = parseFloat(value) || 0;
      const margemLucro = calcularMargemLucro(formData.precoCusto, precoVenda);
      setFormData(prev => ({ ...prev, precoVenda, margemLucro }));
      return;
    }
    
    if (name === 'margemLucro') {
      const margemLucro = parseFloat(value) || 0;
      const precoVenda = calcularPrecoVenda(formData.precoCusto, margemLucro);
      setFormData(prev => ({ ...prev, margemLucro, precoVenda }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Criar URL para preview da imagem
    const imageUrl = URL.createObjectURL(file);
    setImagemPreview(imageUrl);
    
    // Em um cenário real, aqui você faria upload da imagem para um servidor
    // e salvaria a URL retornada no formData
    setFormData(prev => ({ ...prev, imagem: imageUrl }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo || !formData.nome || !formData.categoria) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Em um cenário real, aqui você enviaria os dados para o backend
      
      alert(`Produto ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`);
      navigate('/produtos');
    } catch (err) {
      setError(`Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} produto.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && isEditMode) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="ml-2">Carregando dados do produto...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">
          {isEditMode ? 'Editar Produto' : 'Novo Produto'}
        </h1>
        
        <button
          onClick={() => navigate('/produtos')}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Voltar para Produtos
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Informações Básicas</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
              Código Interno *
            </label>
            <input
              type="text"
              id="codigo"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="codigoBarras" className="block text-sm font-medium text-gray-700 mb-1">
              Código de Barras
            </label>
            <input
              type="text"
              id="codigoBarras"
              name="codigoBarras"
              value={formData.codigoBarras}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Produto *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria *
            </label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((categoria, index) => (
                <option key={index} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="unidadeMedida" className="block text-sm font-medium text-gray-700 mb-1">
              Unidade de Medida *
            </label>
            <select
              id="unidadeMedida"
              name="unidadeMedida"
              value={formData.unidadeMedida}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {unidadesMedida.map((unidade, index) => (
                <option key={index} value={unidade.valor}>{unidade.label} ({unidade.valor})</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="p-6 border-t border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Preços e Estoque</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="precoCusto" className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Custo (R$) *
              </label>
              <input
                type="number"
                id="precoCusto"
                name="precoCusto"
                value={formData.precoCusto}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="precoVenda" className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Venda (R$) *
              </label>
              <input
                type="number"
                id="precoVenda"
                name="precoVenda"
                value={formData.precoVenda}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="margemLucro" className="block text-sm font-medium text-gray-700 mb-1">
                Margem de Lucro (%)
              </label>
              <input
                type="number"
                id="margemLucro"
                name="margemLucro"
                value={formData.margemLucro.toFixed(2)}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            
            <div>
              <label htmlFor="estoqueMinimo" className="block text-sm font-medium text-gray-700 mb-1">
                Estoque Mínimo *
              </label>
              <input
                type="number"
                id="estoqueMinimo"
                name="estoqueMinimo"
                value={formData.estoqueMinimo}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="estoqueAtual" className="block text-sm font-medium text-gray-700 mb-1">
                Estoque Atual *
              </label>
              <input
                type="number"
                id="estoqueAtual"
                name="estoqueAtual"
                value={formData.estoqueAtual}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="validade" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Validade
              </label>
              <input
                type="date"
                id="validade"
                name="validade"
                value={formData.validade}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Informações Adicionais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fornecedor" className="block text-sm font-medium text-gray-700 mb-1">
                Fornecedor
              </label>
              <input
                type="text"
                id="fornecedor"
                name="fornecedor"
                value={formData.fornecedor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativo"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                Produto Ativo
              </label>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Imagem do Produto</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="imagem" className="block text-sm font-medium text-gray-700 mb-1">
                Selecionar Imagem
              </label>
              <input
                type="file"
                id="imagem"
                name="imagem"
                onChange={handleImagemChange}
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 2MB.
              </p>
            </div>
            
            <div>
              {imagemPreview ? (
                <div className="mt-2">
                  <p className="block text-sm font-medium text-gray-700 mb-1">Preview:</p>
                  <img 
                    src={imagemPreview} 
                    alt="Preview" 
                    className="h-32 w-32 object-cover rounded-md border border-gray-300"
                  />
                </div>
              ) : (
                <div className="mt-2">
                  <p className="block text-sm font-medium text-gray-700 mb-1">Preview:</p>
                  <div className="h-32 w-32 bg-gray-100 flex items-center justify-center rounded-md border border-gray-300">
                    <span className="text-gray-400">Sem imagem</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/produtos')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isLoading || !hasPermission('operador')}
          >
            {isLoading ? 'Salvando...' : isEditMode ? 'Atualizar Produto' : 'Cadastrar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProdutoForm;
