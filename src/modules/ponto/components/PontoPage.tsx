import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePonto, RegistroPonto } from '../hooks/usePonto';
import { useFuncionarios } from '../../usuarios/hooks/useFuncionarios';
import { useAuth } from '../../auth/context/AuthContext';

const PontoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { registros, isLoading, error, registrarEntrada, registrarSaida, editarRegistro, excluirRegistro, recarregarRegistros } = usePonto();
  const { funcionarios, isLoading: isLoadingFuncionarios } = useFuncionarios();
  const { hasPermission } = useAuth();
  
  const [funcionarioId, setFuncionarioId] = useState<number | null>(user?.id || null);
  const [observacao, setObservacao] = useState('');
  const [dataInicioFiltro, setDataInicioFiltro] = useState('');
  const [dataFimFiltro, setDataFimFiltro] = useState('');
  const [funcionarioFiltro, setFuncionarioFiltro] = useState<number | null>(null);
  const [registrosFiltrados, setRegistrosFiltrados] = useState<RegistroPonto[]>([]);
  const [modoAdmin, setModoAdmin] = useState(false);
  
  // Definir data inicial e final do mês atual para filtro
  useEffect(() => {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    setDataInicioFiltro(primeiroDiaMes.toISOString().split('T')[0]);
    setDataFimFiltro(ultimoDiaMes.toISOString().split('T')[0]);
  }, []);
  
  // Verificar se o usuário tem permissão de admin/gerente
  useEffect(() => {
    if (user && hasPermission('gerente')) {
      setModoAdmin(true);
    } else {
      setModoAdmin(false);
      setFuncionarioFiltro(user?.id || null);
    }
  }, [user, hasPermission]);
  
  // Aplicar filtros
  useEffect(() => {
    let resultado = [...registros];
    
    // Filtro por funcionário
    if (funcionarioFiltro) {
      resultado = resultado.filter(r => r.funcionarioId === funcionarioFiltro);
    }
    
    // Filtro por data de início
    if (dataInicioFiltro) {
      resultado = resultado.filter(r => r.data >= dataInicioFiltro);
    }
    
    // Filtro por data de fim
    if (dataFimFiltro) {
      resultado = resultado.filter(r => r.data <= dataFimFiltro);
    }
    
    // Ordenar por data (mais recente primeiro)
    resultado.sort((a, b) => {
      const dataComparison = new Date(b.data).getTime() - new Date(a.data).getTime();
      if (dataComparison !== 0) return dataComparison;
      
      // Se a data for a mesma, ordenar pela hora de entrada
      return b.entrada.localeCompare(a.entrada);
    });
    
    setRegistrosFiltrados(resultado);
  }, [registros, funcionarioFiltro, dataInicioFiltro, dataFimFiltro]);
  
  const handleRegistrarEntrada = async () => {
    if (!funcionarioId) {
      alert('Selecione um funcionário');
      return;
    }
    
    const resultado = await registrarEntrada(funcionarioId, observacao);
    
    if (resultado) {
      alert('Entrada registrada com sucesso!');
      setObservacao('');
      recarregarRegistros();
    } else {
      alert('Erro ao registrar entrada. Verifique se já não existe um registro de entrada sem saída para hoje.');
    }
  };
  
  const handleRegistrarSaida = async () => {
    if (!funcionarioId) {
      alert('Selecione um funcionário');
      return;
    }
    
    const resultado = await registrarSaida(funcionarioId, observacao);
    
    if (resultado) {
      alert('Saída registrada com sucesso!');
      setObservacao('');
      recarregarRegistros();
    } else {
      alert('Erro ao registrar saída. Verifique se existe um registro de entrada sem saída para hoje.');
    }
  };
  
  const handleExcluirRegistro = async (id: number) => {
    if (!hasPermission('gerente')) {
      alert('Você não tem permissão para excluir registros de ponto.');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.')) {
      const resultado = await excluirRegistro(id);
      
      if (resultado) {
        alert('Registro excluído com sucesso!');
        recarregarRegistros();
      } else {
        alert('Erro ao excluir registro.');
      }
    }
  };
  
  const getNomeFuncionario = (id: number) => {
    const funcionario = funcionarios.find(f => f.id === id);
    return funcionario ? funcionario.nome : 'Funcionário não encontrado';
  };
  
  const formatarHora = (hora: string) => {
    return hora.substring(0, 5); // Retorna apenas HH:MM
  };
  
  const formatarHorasTrabalhadas = (horas: number | undefined) => {
    if (horas === undefined) return '-';
    
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);
    
    return `${horasInteiras}h${minutos > 0 ? ` ${minutos}min` : ''}`;
  };
  
  const calcularTotalHoras = (registros: RegistroPonto[]) => {
    const total = registros.reduce((sum, registro) => {
      return sum + (registro.horasTrabalhadas || 0);
    }, 0);
    
    return formatarHorasTrabalhadas(total);
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Controle de Ponto</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate('/funcionarios')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Voltar para Funcionários
          </button>
        </div>
      </div>
      
      {/* Registro de Ponto */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Registrar Ponto</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="funcionario" className="block text-sm font-medium text-gray-700 mb-1">
              Funcionário
            </label>
            <select
              id="funcionario"
              value={funcionarioId || ''}
              onChange={(e) => setFuncionarioId(e.target.value ? parseInt(e.target.value) : null)}
              disabled={!modoAdmin && user?.id !== undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um funcionário</option>
              {funcionarios.map((funcionario) => (
                <option 
                  key={funcionario.id} 
                  value={funcionario.id}
                  disabled={!funcionario.ativo}
                >
                  {funcionario.nome} {!funcionario.ativo && '(Inativo)'}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="observacao" className="block text-sm font-medium text-gray-700 mb-1">
              Observação (opcional)
            </label>
            <input
              type="text"
              id="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Atraso devido a trânsito"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={handleRegistrarEntrada}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              disabled={!funcionarioId}
            >
              Registrar Entrada
            </button>
            
            <button
              onClick={handleRegistrarSaida}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              disabled={!funcionarioId}
            >
              Registrar Saída
            </button>
          </div>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modoAdmin && (
            <div>
              <label htmlFor="funcionarioFiltro" className="block text-sm font-medium text-gray-700 mb-1">
                Funcionário
              </label>
              <select
                id="funcionarioFiltro"
                value={funcionarioFiltro || ''}
                onChange={(e) => setFuncionarioFiltro(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os funcionários</option>
                {funcionarios.map((funcionario) => (
                  <option key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              id="dataInicio"
              value={dataInicioFiltro}
              onChange={(e) => setDataInicioFiltro(e.target.value)}
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
              value={dataFimFiltro}
              onChange={(e) => setDataFimFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Resumo */}
      {registrosFiltrados.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Resumo do Período</h2>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total de registros: {registrosFiltrados.length}</p>
              <p className="text-sm font-medium">
                Total de horas trabalhadas: {calcularTotalHoras(registrosFiltrados)}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabela de Registros */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Histórico de Registros</h2>
        </div>
        
        {isLoading || isLoadingFuncionarios ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p>Carregando registros...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>Erro ao carregar registros: {error}</p>
            <button
              onClick={recarregarRegistros}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : registrosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhum registro encontrado para o período selecionado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  {modoAdmin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Funcionário
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrada
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saída
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas Trabalhadas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observação
                  </th>
                  {hasPermission('gerente') && (
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrosFiltrados.map((registro) => (
                  <tr key={registro.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registro.data).toLocaleDateString('pt-BR')}
                    </td>
                    {modoAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getNomeFuncionario(registro.funcionarioId)}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarHora(registro.entrada)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registro.saida ? formatarHora(registro.saida) : (
                        <span className="text-yellow-600">Em andamento</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarHorasTrabalhadas(registro.horasTrabalhadas)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {registro.observacao || '-'}
                    </td>
                    {hasPermission('gerente') && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleExcluirRegistro(registro.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    )}
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

export default PontoPage;
