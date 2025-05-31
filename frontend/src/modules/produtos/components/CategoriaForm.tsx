import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';

interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  ativa: boolean;
}

const CategoriaForm = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para nova categoria
  const [novaCategoria, setNovaCategoria] = useState<Omit<Categoria, 'id'>>({
    nome: '',
    descricao: '',
    ativa: true
  });
  
  // Estado para edição de categoria
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  
  // Carregar categorias (simulado)
  useEffect(() => {
    const carregarCategorias = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Dados mockados para demonstração
        const categoriasMock: Categoria[] = [
          { id: 1, nome: 'Alimentos', descricao: 'Produtos alimentícios', ativa: true },
          { id: 2, nome: 'Bebidas', descricao: 'Bebidas em geral', ativa: true },
          { id: 3, nome: 'Limpeza', descricao: 'Produtos de limpeza', ativa: true },
          { id: 4, nome: 'Eletrônicos', descricao: 'Produtos eletrônicos', ativa: false }
        ];
        
        setCategorias(categoriasMock);
      } catch (err) {
        setError('Erro ao carregar categorias');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarCategorias();
  }, []);
  
  const handleAdicionarCategoria = async () => {
    if (!novaCategoria.nome) {
      alert('O nome da categoria é obrigatório');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulando a adição de uma nova categoria
      const novoId = Math.max(0, ...categorias.map(c => c.id)) + 1;
      const novaCategoriaCriada: Categoria = {
        id: novoId,
        ...novaCategoria
      };
      
      setCategorias([...categorias, novaCategoriaCriada]);
      
      // Limpar o formulário
      setNovaCategoria({
        nome: '',
        descricao: '',
        ativa: true
      });
      
      alert('Categoria adicionada com sucesso!');
    } catch (err) {
      setError('Erro ao adicionar categoria');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAtualizarCategoria = async () => {
    if (!categoriaEditando) return;
    
    if (!categoriaEditando.nome) {
      alert('O nome da categoria é obrigatório');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Atualizar a categoria na lista
      const categoriasAtualizadas = categorias.map(c => 
        c.id === categoriaEditando.id ? categoriaEditando : c
      );
      
      setCategorias(categoriasAtualizadas);
      setCategoriaEditando(null);
      
      alert('Categoria atualizada com sucesso!');
    } catch (err) {
      setError('Erro ao atualizar categoria');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExcluirCategoria = async (id: number) => {
    if (!hasPermission('gerente')) {
      alert('Você não tem permissão para excluir categorias');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.')) {
      setIsLoading(true);
      
      try {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Remover a categoria da lista
        const categoriasAtualizadas = categorias.filter(c => c.id !== id);
        setCategorias(categoriasAtualizadas);
        
        alert('Categoria excluída com sucesso!');
      } catch (err) {
        setError('Erro ao excluir categoria');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Gerenciamento de Categorias</h1>
        
        <button
          onClick={() => navigate('/produtos')}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Voltar para Produtos
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="categoriaNome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              id="categoriaNome"
              value={categoriaEditando ? categoriaEditando.nome : novaCategoria.nome}
              onChange={(e) => categoriaEditando 
                ? setCategoriaEditando({...categoriaEditando, nome: e.target.value})
                : setNovaCategoria({...novaCategoria, nome: e.target.value})
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="categoriaDescricao" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              id="categoriaDescricao"
              value={categoriaEditando ? categoriaEditando.descricao || '' : novaCategoria.descricao || ''}
              onChange={(e) => categoriaEditando 
                ? setCategoriaEditando({...categoriaEditando, descricao: e.target.value})
                : setNovaCategoria({...novaCategoria, descricao: e.target.value})
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="categoriaAtiva"
              checked={categoriaEditando ? categoriaEditando.ativa : novaCategoria.ativa}
              onChange={(e) => categoriaEditando 
                ? setCategoriaEditando({...categoriaEditando, ativa: e.target.checked})
                : setNovaCategoria({...novaCategoria, ativa: e.target.checked})
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="categoriaAtiva" className="ml-2 block text-sm text-gray-900">
              Categoria Ativa
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          {categoriaEditando && (
            <button
              onClick={() => setCategoriaEditando(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
          )}
          
          <button
            onClick={categoriaEditando ? handleAtualizarCategoria : handleAdicionarCategoria}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isLoading || !hasPermission('operador')}
          >
            {isLoading ? 'Processando...' : categoriaEditando ? 'Atualizar Categoria' : 'Adicionar Categoria'}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Lista de Categorias</h2>
        </div>
        
        {isLoading && !categorias.length ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p>Carregando categorias...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>{error}</p>
          </div>
        ) : categorias.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhuma categoria cadastrada.</p>
            <p className="mt-2">Adicione uma nova categoria usando o formulário acima.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categorias.map((categoria) => (
                  <tr key={categoria.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {categoria.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {categoria.descricao || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        categoria.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {categoria.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setCategoriaEditando(categoria)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                          disabled={!hasPermission('operador')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleExcluirCategoria(categoria.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                          disabled={!hasPermission('gerente')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriaForm;
