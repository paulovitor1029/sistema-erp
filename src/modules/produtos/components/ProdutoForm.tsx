import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProdutos, Produto } from '../hooks/useProdutos';

const ProdutoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const { produtos, adicionarProduto, atualizarProduto, getProdutoPorId, isLoading, error } = useProdutos();
  
  const [formData, setFormData] = useState<Omit<Produto, 'id'>>({
    codigo: '',
    nome: '',
    categoria: '',
    precoCusto: 0,
    precoVenda: 0,
    unidadeMedida: 'un',
    estoqueMinimo: 0,
    estoqueAtual: 0,
    ativo: true,
    observacoes: ''
  });
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [showCategoriaInput, setShowCategoriaInput] = useState(false);
  
  // Carregar produto para edição
  useEffect(() => {
    if (isEditMode && id) {
      const produtoId = parseInt(id);
      const produto = getProdutoPorId(produtoId);
      
      if (produto) {
        const { id: _, ...produtoData } = produto;
        setFormData(produtoData);
        
        if (produto.imagem) {
          setPreviewImage(produto.imagem);
        }
      }
    }
  }, [isEditMode, id, getProdutoPorId]);
  
  // Extrair categorias únicas dos produtos
  useEffect(() => {
    if (produtos.length > 0) {
      const categoriasUnicas = [...new Set(produtos.map(p => p.categoria))];
      setCategorias(categoriasUnicas);
    }
  }, [produtos]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number' || name === 'precoCusto' || name === 'precoVenda' || name === 'estoqueMinimo' || name === 'estoqueAtual') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseFloat(value)
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Limpar erro do campo quando ele for alterado
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData({
          ...formData,
          imagem: result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData({
      ...formData,
      imagem: undefined
    });
  };
  
  const handleAddCategoria = () => {
    if (novaCategoria.trim() && !categorias.includes(novaCategoria)) {
      setCategorias([...categorias, novaCategoria]);
      setFormData({
        ...formData,
        categoria: novaCategoria
      });
      setNovaCategoria('');
      setShowCategoriaInput(false);
    }
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.codigo) {
      errors.codigo = 'O código do produto é obrigatório';
    }
    
    if (!formData.nome) {
      errors.nome = 'O nome do produto é obrigatório';
    }
    
    if (!formData.categoria) {
      errors.categoria = 'A categoria é obrigatória';
    }
    
    if (formData.precoCusto < 0) {
      errors.precoCusto = 'O preço de custo não pode ser negativo';
    }
    
    if (formData.precoVenda <= 0) {
      errors.precoVenda = 'O preço de venda deve ser maior que zero';
    }
    
    if (formData.estoqueMinimo < 0) {
      errors.estoqueMinimo = 'O estoque mínimo não pode ser negativo';
    }
    
    if (formData.estoqueAtual < 0) {
      errors.estoqueAtual = 'O estoque atual não pode ser negativo';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (isEditMode && id) {
        await atualizarProduto(parseInt(id), formData);
        alert('Produto atualizado com sucesso!');
      } else {
        await adicionarProduto(formData);
        alert('Produto adicionado com sucesso!');
      }
      
      navigate('/produtos');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Ocorreu um erro ao salvar o produto. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Editar Produto' : 'Novo Produto'}
        </h1>
        
        <button
          onClick={() => navigate('/produtos')}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Voltar
        </button>
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p>Carregando...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">
          <p>Erro ao carregar dados: {error}</p>
          <button
            onClick={() => navigate('/produtos')}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna da esquerda */}
            <div className="space-y-6">
              <div>
                <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Barras *
                </label>
                <input
                  type="text"
                  id="codigo"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${formErrors.codigo ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Ex: 7891234567890"
                />
                {formErrors.codigo && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.codigo}</p>
                )}
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
                  className={`w-full px-3 py-2 border ${formErrors.nome ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Ex: Notebook Dell Inspiron"
                />
                {formErrors.nome && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                {showCategoriaInput ? (
                  <div className="flex">
                    <input
                      type="text"
                      value={novaCategoria}
                      onChange={(e) => setNovaCategoria(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nova categoria"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategoria}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                    >
                      Adicionar
                    </button>
                  </div>
                ) : (
                  <div className="flex">
                    <select
                      id="categoria"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${formErrors.categoria ? 'border-red-500' : 'border-gray-300'} rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCategoriaInput(true)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
                    >
                      Nova
                    </button>
                  </div>
                )}
                {formErrors.categoria && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.categoria}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                    className={`w-full px-3 py-2 border ${formErrors.precoCusto ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.precoCusto && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.precoCusto}</p>
                  )}
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
                    className={`w-full px-3 py-2 border ${formErrors.precoVenda ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.precoVenda && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.precoVenda}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                  >
                    <option value="un">Unidade (un)</option>
                    <option value="kg">Quilograma (kg)</option>
                    <option value="g">Grama (g)</option>
                    <option value="l">Litro (l)</option>
                    <option value="ml">Mililitro (ml)</option>
                    <option value="m">Metro (m)</option>
                    <option value="cm">Centímetro (cm)</option>
                    <option value="cx">Caixa (cx)</option>
                    <option value="pct">Pacote (pct)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="validade" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Validade
                  </label>
                  <input
                    type="date"
                    id="validade"
                    name="validade"
                    value={formData.validade || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                    className={`w-full px-3 py-2 border ${formErrors.estoqueMinimo ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.estoqueMinimo && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.estoqueMinimo}</p>
                  )}
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
                    className={`w-full px-3 py-2 border ${formErrors.estoqueAtual ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.estoqueAtual && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.estoqueAtual}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Coluna da direita */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem do Produto
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  {previewImage ? (
                    <div className="text-center">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="mt-2 px-3 py-1 text-sm text-red-600 hover:text-red-800"
                      >
                        Remover imagem
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="imagem"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Carregar imagem</span>
                          <input
                            id="imagem"
                            name="imagem"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF até 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  rows={5}
                  value={formData.observacoes || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Informações adicionais sobre o produto..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ativo"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                  Produto ativo
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/produtos')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isSaving ? 'Salvando...' : isEditMode ? 'Atualizar Produto' : 'Cadastrar Produto'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProdutoForm;
