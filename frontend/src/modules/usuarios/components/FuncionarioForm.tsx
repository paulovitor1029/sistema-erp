import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFuncionarios } from '../hooks/useFuncionarios';
import { useAuth } from '../../auth/context/AuthContext';

interface FuncionarioFormProps {
  modo?: 'novo' | 'edicao';
}

const FuncionarioForm = ({ modo = 'novo' }: FuncionarioFormProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const { funcionarios, adicionarFuncionario, atualizarFuncionario, buscarFuncionarioPorId } = useFuncionarios();
  
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cargo, setCargo] = useState('');
  const [nivelAcesso, setNivelAcesso] = useState('operador');
  const [salario, setSalario] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [foto, setFoto] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Carregar dados do funcionário para edição
  useEffect(() => {
    if (modo === 'edicao' && id) {
      const funcionarioId = parseInt(id);
      const funcionario = buscarFuncionarioPorId(funcionarioId);
      
      if (funcionario) {
        setNome(funcionario.nome);
        setCpf(funcionario.cpf);
        setEmail(funcionario.email);
        setTelefone(funcionario.telefone || '');
        setCargo(funcionario.cargo);
        setNivelAcesso(funcionario.nivelAcesso);
        setSalario(funcionario.salario.toString());
        setDataAdmissao(funcionario.dataAdmissao);
        setAtivo(funcionario.ativo);
        setFoto(funcionario.foto || '');
      } else {
        setError('Funcionário não encontrado');
      }
    }
  }, [modo, id, buscarFuncionarioPorId]);
  
  // Verificar permissões
  useEffect(() => {
    if (!hasPermission('gerente')) {
      navigate('/funcionarios');
    }
  }, [hasPermission, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !cpf || !email || !cargo || !salario || !dataAdmissao) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const funcionarioData = {
        nome,
        cpf,
        email,
        telefone,
        cargo,
        nivelAcesso,
        salario: parseFloat(salario),
        dataAdmissao,
        ativo,
        foto
      };
      
      let resultado;
      
      if (modo === 'novo') {
        resultado = await adicionarFuncionario(funcionarioData);
      } else if (id) {
        resultado = await atualizarFuncionario(parseInt(id), funcionarioData);
      }
      
      if (resultado) {
        navigate('/funcionarios');
      } else {
        setError('Erro ao salvar funcionário');
      }
    } catch (err) {
      setError('Erro ao processar a solicitação');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatarCPF = (value: string) => {
    // Remove caracteres não numéricos
    const cpfNumerico = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const cpfLimitado = cpfNumerico.slice(0, 11);
    
    // Formata o CPF (000.000.000-00)
    if (cpfLimitado.length <= 3) {
      return cpfLimitado;
    } else if (cpfLimitado.length <= 6) {
      return `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(3)}`;
    } else if (cpfLimitado.length <= 9) {
      return `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(3, 6)}.${cpfLimitado.slice(6)}`;
    } else {
      return `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(3, 6)}.${cpfLimitado.slice(6, 9)}-${cpfLimitado.slice(9)}`;
    }
  };
  
  const formatarTelefone = (value: string) => {
    // Remove caracteres não numéricos
    const telNumerico = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (com DDD)
    const telLimitado = telNumerico.slice(0, 11);
    
    // Formata o telefone ((00) 00000-0000)
    if (telLimitado.length <= 2) {
      return telLimitado;
    } else if (telLimitado.length <= 6) {
      return `(${telLimitado.slice(0, 2)}) ${telLimitado.slice(2)}`;
    } else {
      return `(${telLimitado.slice(0, 2)}) ${telLimitado.slice(2, 7)}-${telLimitado.slice(7)}`;
    }
  };
  
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">
          {modo === 'novo' ? 'Novo Funcionário' : 'Editar Funcionário'}
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate('/funcionarios')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Pessoais */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Informações Pessoais</h2>
              
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                  CPF *
                </label>
                <input
                  type="text"
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(formatarCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="foto" className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Foto (opcional)
                </label>
                <input
                  type="text"
                  id="foto"
                  value={foto}
                  onChange={(e) => setFoto(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Informações Profissionais */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Informações Profissionais</h2>
              
              <div>
                <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo *
                </label>
                <input
                  type="text"
                  id="cargo"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="nivelAcesso" className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de Acesso *
                </label>
                <select
                  id="nivelAcesso"
                  value={nivelAcesso}
                  onChange={(e) => setNivelAcesso(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="operador">Operador</option>
                  <option value="gerente">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="salario" className="block text-sm font-medium text-gray-700 mb-1">
                  Salário (R$) *
                </label>
                <input
                  type="number"
                  id="salario"
                  value={salario}
                  onChange={(e) => setSalario(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="dataAdmissao" className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Admissão *
                </label>
                <input
                  type="date"
                  id="dataAdmissao"
                  value={dataAdmissao}
                  onChange={(e) => setDataAdmissao(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                  Funcionário Ativo
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/funcionarios')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors mr-2"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                'Salvar Funcionário'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FuncionarioForm;
