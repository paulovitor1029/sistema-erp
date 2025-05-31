import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientes, Cliente } from '../hooks/useClientes';
import { useAuth } from '../../auth/context/AuthContext';

const ClientesPage = () => {
  const navigate = useNavigate();
  const { clientes, isLoading, error, alterarStatusCliente, excluirCliente, recarregarClientes } = useClientes();
  const { hasPermission } = useAuth();
  
  const [filtro, setFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  
  // Aplicar filtros
  useEffect(() => {
    let resultado = [...clientes];
    
    // Filtro por texto (nome, CPF/CNPJ ou email)
    if (filtro) {
      const termoLowerCase = filtro.toLowerCase();
      resultado = resultado.filter(c => 
        c.nome.toLowerCase().includes(termoLowerCase) || 
        c.cpfCnpj.includes(termoLowerCase) ||
        c.email.toLowerCase().includes(termoLowerCase)
      );
    }
    
    // Filtro por tipo
    if (tipoFiltro !== 'todos') {
      resultado = resultado.filter(c => c.tipo === tipoFiltro);
    }
    
    // Filtro por status
    if (statusFiltro !== 'todos') {
      const ativo = statusFiltro === 'ativos';
      resultado = resultado.filter(c => c.ativo === ativo);
    }
    
    // Ordenar por nome
    resultado.sort((a, b) => a.nome.localeCompare(b.nome));
    
    setClientesFiltrados(resultado);
  }, [clientes, filtro, tipoFiltro, statusFiltro]);
  
  const handleAlterarStatus = async (id: number, novoStatus: boolean) => {
    if (!hasPermission('operador')) {
      alert('Você não tem permissão para alterar o status de clientes.');
      return;
    }
    
    const resultado = await alterarStatusCliente(id, novoStatus);
    if (resultado) {
      recarregarClientes();
    }
  };
  
  const handleExcluirCliente = async (id: number) => {
    if (!hasPermission('gerente')) {
      alert('Você não tem permissão para excluir clientes.');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      const resultado = await excluirCliente(id);
      if (resultado) {
        recarregarClientes();
      }
    }
  };
  
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  const formatarData = (dataString?: string) => {
    if (!dataString) return 'Nunca';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  const formatarCpfCnpj = (cpfCnpj: string) => {
    if (cpfCnpj.length === 11) {
      // CPF: 000.000.000-00
      return cpfCnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cpfCnpj.length === 14) {
      // CNPJ: 00.000.000/0000-00
      return cpfCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cpfCnpj;
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Gerenciamento de Clientes</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate('/clientes/novo')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={!hasPermission('operador')}
          >
            Novo Cliente
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="filtro" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nome, CPF/CNPJ ou email
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
              <option value="fisica">Pessoa Física</option>
              <option value="juridica">Pessoa Jurídica</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setFiltro('');
              setTipoFiltro('todos');
              setStatusFiltro('todos');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
      
      {/* Tabela de Clientes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p>Carregando clientes...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>Erro ao carregar clientes: {error}</p>
            <button
              onClick={recarregarClientes}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : clientes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhum cliente cadastrado no sistema.</p>
            <button
              onClick={() => navigate('/clientes/novo')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={!hasPermission('operador')}
            >
              Cadastrar Primeiro Cliente
            </button>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhum cliente encontrado com os filtros atuais.</p>
            <p className="mt-2">Tente ajustar os filtros para ver mais resultados.</p>
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
                    Contato
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                      <div className="text-sm text-gray-500">
                        {cliente.tipo === 'fisica' ? 'CPF: ' : 'CNPJ: '}
                        {formatarCpfCnpj(cliente.cpfCnpj)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cliente.email}</div>
                      <div className="text-sm text-gray-500">{cliente.telefone}</div>
                      {cliente.celular && (
                        <div className="text-sm text-gray-500">{cliente.celular}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(cliente.dataUltimaCompra)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarMoeda(cliente.valorTotalCompras)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.pontosFidelidade} pts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cliente.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {cliente.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/clientes/${cliente.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                          disabled={!hasPermission('operador')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleAlterarStatus(cliente.id, !cliente.ativo)}
                          className={`${cliente.ativo ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'}`}
                          title={cliente.ativo ? 'Desativar' : 'Ativar'}
                          disabled={!hasPermission('operador')}
                        >
                          {cliente.ativo ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleExcluirCliente(cliente.id)}
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

export default ClientesPage;
