import { useState, useEffect } from 'react';
import { useUsuarios, Usuario } from '../hooks/useUsuarios';

const UsuariosPage = () => {
  const { 
    usuarios, 
    isLoading, 
    error, 
    adicionarUsuario, 
    atualizarUsuario, 
    alterarStatusUsuario,
    recarregarUsuarios
  } = useUsuarios();

  const [novoUsuario, setNovoUsuario] = useState<Partial<Usuario>>({
    nome: '',
    username: '',
    email: '',
    cargo: '',
    nivel: 'operador',
    ativo: true
  });

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [modoEdicao, setModoEdicao] = useState(false);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<number | null>(null);
  const [filtroNivel, setFiltroNivel] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroBusca, setFiltroBusca] = useState<string>('');

  // Aplicar filtros
  const usuariosFiltrados = usuarios.filter(usuario => {
    // Filtro por nível
    if (filtroNivel && usuario.nivel !== filtroNivel) return false;
    
    // Filtro por status
    if (filtroStatus === 'ativos' && !usuario.ativo) return false;
    if (filtroStatus === 'inativos' && usuario.ativo) return false;
    
    // Filtro por busca (nome, username ou email)
    if (filtroBusca) {
      const termoBusca = filtroBusca.toLowerCase();
      return (
        usuario.nome.toLowerCase().includes(termoBusca) ||
        usuario.username.toLowerCase().includes(termoBusca) ||
        usuario.email.toLowerCase().includes(termoBusca)
      );
    }
    
    return true;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNovoUsuario({
      ...novoUsuario,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!novoUsuario.nome || !novoUsuario.username || !novoUsuario.email || !novoUsuario.cargo) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(novoUsuario.email)) {
      alert('Por favor, informe um email válido');
      return;
    }

    // Validar senha em caso de novo usuário
    if (!modoEdicao) {
      if (!senha) {
        alert('Por favor, informe uma senha');
        return;
      }
      
      if (senha !== confirmarSenha) {
        alert('As senhas não conferem');
        return;
      }
      
      if (senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres');
        return;
      }
    }

    try {
      if (modoEdicao && usuarioEditandoId !== null) {
        // Atualizar usuário existente
        await atualizarUsuario(usuarioEditandoId, novoUsuario);
        alert('Usuário atualizado com sucesso!');
      } else {
        // Adicionar novo usuário
        // Na implementação real, a senha seria enviada e tratada adequadamente
        await adicionarUsuario({
          ...novoUsuario as Omit<Usuario, 'id' | 'dataCadastro' | 'ultimoAcesso'>,
          // A senha seria tratada no backend
        });
        alert('Usuário adicionado com sucesso!');
      }
      
      // Limpar formulário
      resetForm();
      // Recarregar lista de usuários
      recarregarUsuarios();
    } catch (err) {
      alert('Erro ao salvar usuário. Por favor, tente novamente.');
      console.error(err);
    }
  };

  const resetForm = () => {
    setNovoUsuario({
      nome: '',
      username: '',
      email: '',
      cargo: '',
      nivel: 'operador',
      ativo: true
    });
    setSenha('');
    setConfirmarSenha('');
    setModoEdicao(false);
    setUsuarioEditandoId(null);
  };

  const editarUsuario = (id: number) => {
    const usuarioParaEditar = usuarios.find(u => u.id === id);
    if (usuarioParaEditar) {
      setNovoUsuario({
        nome: usuarioParaEditar.nome,
        username: usuarioParaEditar.username,
        email: usuarioParaEditar.email,
        cargo: usuarioParaEditar.cargo,
        nivel: usuarioParaEditar.nivel,
        ativo: usuarioParaEditar.ativo
      });
      setModoEdicao(true);
      setUsuarioEditandoId(id);
    }
  };

  const alterarStatus = async (id: number, novoStatus: boolean) => {
    try {
      await alterarStatusUsuario(id, novoStatus);
      alert(`Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
      recarregarUsuarios();
    } catch (err) {
      alert('Erro ao alterar status do usuário. Por favor, tente novamente.');
      console.error(err);
    }
  };

  const limparFiltros = () => {
    setFiltroNivel('');
    setFiltroStatus('todos');
    setFiltroBusca('');
  };

  const formatarData = (dataString?: string) => {
    if (!dataString) return '-';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-center">Gerenciamento de Funcionários</h1>
      
      {/* Formulário de adição/edição de usuário */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-xl font-semibold">
          {modoEdicao ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium">Nome Completo *</label>
            <input
              type="text"
              name="nome"
              value={novoUsuario.nome}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nome completo"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Nome de Usuário *</label>
            <input
              type="text"
              name="username"
              value={novoUsuario.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nome de usuário para login"
              required
              disabled={modoEdicao} // Não permitir alterar username em edição
            />
            {modoEdicao && (
              <p className="mt-1 text-xs text-gray-500">
                O nome de usuário não pode ser alterado após a criação.
              </p>
            )}
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">E-mail *</label>
            <input
              type="email"
              name="email"
              value={novoUsuario.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="email@exemplo.com"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Cargo *</label>
            <input
              type="text"
              name="cargo"
              value={novoUsuario.cargo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Cargo ou função"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Nível de Acesso *</label>
            <select
              name="nivel"
              value={novoUsuario.nivel}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="admin">Administrador</option>
              <option value="gerente">Gerente</option>
              <option value="operador">Operador</option>
            </select>
          </div>
          
          {!modoEdicao && (
            <>
              <div>
                <label className="block mb-1 text-sm font-medium">Senha *</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Mínimo 6 caracteres"
                  required={!modoEdicao}
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium">Confirmar Senha *</label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Confirme a senha"
                  required={!modoEdicao}
                />
              </div>
            </>
          )}
          
          {modoEdicao && (
            <div>
              <label className="block mb-1 text-sm font-medium">Redefinir Senha</label>
              <button
                type="button"
                className="px-3 py-2 text-sm text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                onClick={() => alert('Funcionalidade de redefinição de senha será implementada em breve.')}
              >
                Enviar Link de Redefinição
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ativo"
              name="ativo"
              checked={novoUsuario.ativo}
              onChange={(e) => setNovoUsuario({...novoUsuario, ativo: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
              Funcionário ativo
            </label>
          </div>
          
          <div className="flex items-end space-x-2 lg:col-span-3">
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {modoEdicao ? 'Atualizar Funcionário' : 'Adicionar Funcionário'}
            </button>
            
            {modoEdicao && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
            )}
            
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Limpar Formulário
            </button>
          </div>
        </form>
      </div>
      
      {/* Filtros */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow-md">
        <h3 className="mb-3 text-lg font-medium">Filtros</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium">Nível de Acesso</label>
            <select
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos os níveis</option>
              <option value="admin">Administrador</option>
              <option value="gerente">Gerente</option>
              <option value="operador">Operador</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Buscar</label>
            <input
              type="text"
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nome, usuário ou email"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={limparFiltros}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
      
      {/* Tabela de usuários */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Nome</th>
              <th className="px-4 py-2 text-left">Usuário</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Cargo</th>
              <th className="px-4 py-2 text-left">Nível</th>
              <th className="px-4 py-2 text-left">Cadastro</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-3 text-center text-gray-500">
                  Carregando funcionários...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-4 py-3 text-center text-red-500">
                  Erro ao carregar funcionários: {error}
                </td>
              </tr>
            ) : usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="border-t border-gray-200">
                  <td className="px-4 py-3">{usuario.nome}</td>
                  <td className="px-4 py-3">{usuario.username}</td>
                  <td className="px-4 py-3">{usuario.email}</td>
                  <td className="px-4 py-3">{usuario.cargo}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs text-white rounded-full ${
                      usuario.nivel === 'admin' ? 'bg-red-500' :
                      usuario.nivel === 'gerente' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}>
                      {usuario.nivel === 'admin' ? 'Administrador' :
                       usuario.nivel === 'gerente' ? 'Gerente' :
                       'Operador'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatarData(usuario.dataCadastro)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs text-white rounded-full ${usuario.ativo ? 'bg-green-500' : 'bg-red-500'}`}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editarUsuario(usuario.id)}
                        className="px-2 py-1 text-xs text-white bg-yellow-500 rounded hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => alterarStatus(usuario.id, !usuario.ativo)}
                        className={`px-2 py-1 text-xs text-white rounded ${usuario.ativo ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                      >
                        {usuario.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-3 text-center text-gray-500">
                  Nenhum funcionário encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Resumo */}
      <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-blue-100 rounded-lg">
          <h3 className="text-lg font-medium">Total de Funcionários</h3>
          <p className="text-2xl font-bold">{usuariosFiltrados.length}</p>
        </div>
        
        <div className="p-4 bg-green-100 rounded-lg">
          <h3 className="text-lg font-medium">Funcionários Ativos</h3>
          <p className="text-2xl font-bold">
            {usuariosFiltrados.filter(u => u.ativo).length}
          </p>
        </div>
        
        <div className="p-4 bg-yellow-100 rounded-lg">
          <h3 className="text-lg font-medium">Administradores</h3>
          <p className="text-2xl font-bold">
            {usuariosFiltrados.filter(u => u.nivel === 'admin').length}
          </p>
        </div>
        
        <div className="p-4 bg-purple-100 rounded-lg">
          <h3 className="text-lg font-medium">Operadores</h3>
          <p className="text-2xl font-bold">
            {usuariosFiltrados.filter(u => u.nivel === 'operador').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsuariosPage;
