import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFuncionarios, Funcionario } from '../hooks/useFuncionarios';
import { useAuth } from '../../auth/context/AuthContext';

const FuncionariosPage = () => {
  const navigate = useNavigate();
  const { funcionarios, isLoading, error, alterarStatusFuncionario, excluirFuncionario, recarregarFuncionarios } = useFuncionarios();
  const { hasPermission } = useAuth();
  
  const [filtro, setFiltro] = useState('');
  const [cargoFiltro, setCargoFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState<Funcionario[]>([]);
  const [cargos, setCargos] = useState<string[]>([]);
  
  // Extrair cargos únicos dos funcionários
  useEffect(() => {
    if (funcionarios.length > 0) {
      const cargosUnicos = [...new Set(funcionarios.map(f => f.cargo))];
      setCargos(cargosUnicos);
    }
  }, [funcionarios]);
  
  // Aplicar filtros
  useEffect(() => {
    let resultado = [...funcionarios];
    
    // Filtro por texto (nome, CPF ou email)
    if (filtro) {
      const termoLowerCase = filtro.toLowerCase();
      resultado = resultado.filter(f => 
        f.nome.toLowerCase().includes(termoLowerCase) || 
        f.cpf.includes(termoLowerCase) ||
        f.email.toLowerCase().includes(termoLowerCase)
      );
    }
    
    // Filtro por cargo
    if (cargoFiltro) {
      resultado = resultado.filter(f => f.cargo === cargoFiltro);
    }
    
    // Filtro por status
    if (statusFiltro !== 'todos') {
      const ativo = statusFiltro === 'ativos';
      resultado = resultado.filter(f => f.ativo === ativo);
    }
    
    setFuncionariosFiltrados(resultado);
  }, [funcionarios, filtro, cargoFiltro, statusFiltro]);
  
  const handleAlterarStatus = async (id: number, novoStatus: boolean) => {
    if (!hasPermission('gerente')) {
      alert('Você não tem permissão para alterar o status de funcionários.');
      return;
    }
    
    const resultado = await alterarStatusFuncionario(id, novoStatus);
    if (resultado) {
      recarregarFuncionarios();
    }
  };
  
  const handleExcluirFuncionario = async (id: number) => {
    if (!hasPermission('admin')) {
      alert('Você não tem permissão para excluir funcionários.');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.')) {
      const resultado = await excluirFuncionario(id);
      if (resultado) {
        recarregarFuncionarios();
      }
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
    return data.toLocaleDateString('pt-BR');
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Gerenciamento de Funcionários</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate('/funcionarios/novo')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={!hasPermission('gerente')}
          >
            Novo Funcionário
          </button>
          
          <button
            onClick={() => navigate('/ponto')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Controle de Ponto
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="filtro" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nome, CPF ou email
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
            <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <select
              id="cargo"
              value={cargoFiltro}
              onChange={(e) => setCargoFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os cargos</option>
              {cargos.map((cargo, index) => (
                <option key={index} value={cargo}>{cargo}</option>
              ))}
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
              setCargoFiltro('');
              setStatusFiltro('todos');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
      
      {/* Tabela de Funcionários */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p>Carregando funcionários...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>Erro ao carregar funcionários: {error}</p>
            <button
              onClick={recarregarFuncionarios}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : funcionariosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhum funcionário encontrado.</p>
            {(filtro || cargoFiltro || statusFiltro !== 'todos') && (
              <p className="mt-2">Tente ajustar os filtros ou adicione um novo funcionário.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funcionário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admissão
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
                {funcionariosFiltrados.map((funcionario) => (
                  <tr key={funcionario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {funcionario.foto ? (
                          <img 
                            src={funcionario.foto} 
                            alt={funcionario.nome} 
                            className="h-10 w-10 rounded-full mr-3 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <span className="text-gray-500 font-medium">
                              {funcionario.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{funcionario.nome}</div>
                          <div className="text-sm text-gray-500">CPF: {funcionario.cpf}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{funcionario.email}</div>
                      <div className="text-sm text-gray-500">{funcionario.telefone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-sm text-gray-900">{funcionario.cargo}</div>
                      <div className="text-sm text-gray-500">
                        Nível: {funcionario.nivelAcesso === 'admin' ? 'Administrador' : 
                               funcionario.nivelAcesso === 'gerente' ? 'Gerente' : 'Operador'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarMoeda(funcionario.salario)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(funcionario.dataAdmissao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        funcionario.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {funcionario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/funcionarios/${funcionario.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => navigate(`/funcionarios/editar/${funcionario.id}`)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                          disabled={!hasPermission('gerente')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleAlterarStatus(funcionario.id, !funcionario.ativo)}
                          className={`${funcionario.ativo ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'}`}
                          title={funcionario.ativo ? 'Desativar' : 'Ativar'}
                          disabled={!hasPermission('gerente')}
                        >
                          {funcionario.ativo ? (
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
                          onClick={() => handleExcluirFuncionario(funcionario.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                          disabled={!hasPermission('admin')}
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

export default FuncionariosPage;
