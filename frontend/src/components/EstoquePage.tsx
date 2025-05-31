import { useState, useEffect } from 'react';

interface ProdutoEstoque {
  id: number;
  nome: string;
  quantidade: number;
  preco: number;
  categoria: string;
}

const EstoquePage = () => {
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([
    { id: 1, nome: 'Notebook Dell', quantidade: 15, preco: 3500, categoria: 'Eletrônicos' },
    { id: 2, nome: 'Mouse sem fio', quantidade: 30, preco: 89.90, categoria: 'Periféricos' },
    { id: 3, nome: 'Teclado mecânico', quantidade: 20, preco: 250, categoria: 'Periféricos' },
    { id: 4, nome: 'Monitor 24"', quantidade: 10, preco: 950, categoria: 'Eletrônicos' },
    { id: 5, nome: 'Cadeira gamer', quantidade: 5, preco: 1200, categoria: 'Móveis' },
  ]);

  const [novoProduto, setNovoProduto] = useState<Omit<ProdutoEstoque, 'id'>>({
    nome: '',
    quantidade: 0,
    preco: 0,
    categoria: '',
  });

  const [modoEdicao, setModoEdicao] = useState(false);
  const [produtoEditandoId, setProdutoEditandoId] = useState<number | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');

  const categorias = [...new Set(produtos.map(produto => produto.categoria))];

  const produtosFiltrados = filtroCategoria 
    ? produtos.filter(produto => produto.categoria === filtroCategoria)
    : produtos;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNovoProduto({
      ...novoProduto,
      [name]: name === 'quantidade' || name === 'preco' ? parseFloat(value) : value,
    });
  };

  const adicionarProduto = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novoProduto.nome || novoProduto.quantidade <= 0 || novoProduto.preco <= 0 || !novoProduto.categoria) {
      alert('Por favor, preencha todos os campos corretamente');
      return;
    }

    if (modoEdicao && produtoEditandoId !== null) {
      // Atualizar produto existente
      setProdutos(produtos.map(produto => 
        produto.id === produtoEditandoId 
          ? { ...novoProduto, id: produtoEditandoId } 
          : produto
      ));
      setModoEdicao(false);
      setProdutoEditandoId(null);
    } else {
      // Adicionar novo produto
      const novoId = Math.max(...produtos.map(p => p.id), 0) + 1;
      setProdutos([...produtos, { ...novoProduto, id: novoId }]);
    }

    // Limpar formulário
    setNovoProduto({
      nome: '',
      quantidade: 0,
      preco: 0,
      categoria: '',
    });
  };

  const editarProduto = (id: number) => {
    const produtoParaEditar = produtos.find(p => p.id === id);
    if (produtoParaEditar) {
      setNovoProduto({
        nome: produtoParaEditar.nome,
        quantidade: produtoParaEditar.quantidade,
        preco: produtoParaEditar.preco,
        categoria: produtoParaEditar.categoria,
      });
      setModoEdicao(true);
      setProdutoEditandoId(id);
    }
  };

  const removerProduto = (id: number) => {
    if (window.confirm('Tem certeza que deseja remover este produto?')) {
      setProdutos(produtos.filter(produto => produto.id !== id));
    }
  };

  const cancelarEdicao = () => {
    setModoEdicao(false);
    setProdutoEditandoId(null);
    setNovoProduto({
      nome: '',
      quantidade: 0,
      preco: 0,
      categoria: '',
    });
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-center">Sistema de Estoque</h1>
      
      {/* Formulário de adição/edição de produto */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-xl font-semibold">
          {modoEdicao ? 'Editar Produto' : 'Adicionar Novo Produto'}
        </h2>
        
        <form onSubmit={adicionarProduto} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block mb-1 text-sm font-medium">Nome</label>
            <input
              type="text"
              name="nome"
              value={novoProduto.nome}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nome do produto"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Quantidade</label>
            <input
              type="number"
              name="quantidade"
              value={novoProduto.quantidade}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Preço (R$)</label>
            <input
              type="number"
              name="preco"
              value={novoProduto.preco}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Categoria</label>
            <input
              type="text"
              name="categoria"
              value={novoProduto.categoria}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Categoria"
              list="categorias-list"
            />
            <datalist id="categorias-list">
              {categorias.map((cat, index) => (
                <option key={index} value={cat} />
              ))}
            </datalist>
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {modoEdicao ? 'Atualizar' : 'Adicionar'}
            </button>
            
            {modoEdicao && (
              <button
                type="button"
                onClick={cancelarEdicao}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Filtro por categoria */}
      <div className="flex items-center mb-4 space-x-2">
        <label className="font-medium">Filtrar por categoria:</label>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((categoria, index) => (
            <option key={index} value={categoria}>{categoria}</option>
          ))}
        </select>
      </div>
      
      {/* Tabela de produtos */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Nome</th>
              <th className="px-4 py-2 text-left">Quantidade</th>
              <th className="px-4 py-2 text-left">Preço (R$)</th>
              <th className="px-4 py-2 text-left">Categoria</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.length > 0 ? (
              produtosFiltrados.map((produto) => (
                <tr key={produto.id} className="border-t border-gray-200">
                  <td className="px-4 py-3">{produto.id}</td>
                  <td className="px-4 py-3">{produto.nome}</td>
                  <td className="px-4 py-3">{produto.quantidade}</td>
                  <td className="px-4 py-3">{produto.preco.toFixed(2)}</td>
                  <td className="px-4 py-3">{produto.categoria}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editarProduto(produto.id)}
                        className="px-2 py-1 text-xs text-white bg-yellow-500 rounded hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => removerProduto(produto.id)}
                        className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                  Nenhum produto encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Resumo do estoque */}
      <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-blue-100 rounded-lg">
          <h3 className="text-lg font-medium">Total de Produtos</h3>
          <p className="text-2xl font-bold">{produtosFiltrados.length}</p>
        </div>
        
        <div className="p-4 bg-green-100 rounded-lg">
          <h3 className="text-lg font-medium">Quantidade Total</h3>
          <p className="text-2xl font-bold">
            {produtosFiltrados.reduce((sum, produto) => sum + produto.quantidade, 0)}
          </p>
        </div>
        
        <div className="p-4 bg-yellow-100 rounded-lg">
          <h3 className="text-lg font-medium">Valor Total (R$)</h3>
          <p className="text-2xl font-bold">
            {produtosFiltrados
              .reduce((sum, produto) => sum + produto.quantidade * produto.preco, 0)
              .toFixed(2)}
          </p>
        </div>
        
        <div className="p-4 bg-purple-100 rounded-lg">
          <h3 className="text-lg font-medium">Categorias</h3>
          <p className="text-2xl font-bold">{categorias.length}</p>
        </div>
      </div>
    </div>
  );
};

export default EstoquePage;
