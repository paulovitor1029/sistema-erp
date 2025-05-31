import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './modules/auth/context/AuthContext';
import LoginPage from './modules/auth/components/LoginPage';
import DashboardPage from './modules/dashboard/components/DashboardPage';
import ProdutosPage from './modules/produtos/components/ProdutosPage';
import ProdutoForm from './modules/produtos/components/ProdutoForm';
import CategoriaForm from './modules/produtos/components/CategoriaForm';
import EstoquePage from './modules/estoque/components/EstoquePage';
import EstoqueEntradaForm from './modules/estoque/components/EstoqueEntradaForm';
import EstoqueSaidaForm from './modules/estoque/components/EstoqueSaidaForm';
import EstoqueAjusteForm from './modules/estoque/components/EstoqueAjusteForm';
import ClientesPage from './modules/clientes/components/ClientesPage';
import ClienteForm from './modules/clientes/components/ClienteForm';
import FuncionariosPage from './modules/usuarios/components/FuncionariosPage';
import FuncionarioForm from './modules/usuarios/components/FuncionarioForm';
import PontoPage from './modules/ponto/components/PontoPage';
import CaixaPage from './modules/caixa/components/CaixaPage';
import PromocoesPage from './modules/promocoes/components/PromocoesPage';
import FiscalPage from './modules/fiscal/components/FiscalPage';
import RelatoriosPage from './modules/relatorios/components/RelatoriosPage';
import ConfiguracoesPage from './modules/configuracoes/components/ConfiguracoesPage';
import PDVPage from './modules/pdv/components/PDVPage';
import { SidebarProvider } from './modules/layout/hooks/useSidebar';
import Sidebar from './modules/layout/components/Sidebar';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  
  // Fechar sidebar em dispositivos móveis quando a rota muda
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Componente de layout que inclui a sidebar
  const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="flex h-screen bg-gray-100">
        <SidebarProvider>
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          
          <div className="flex-1 overflow-auto">
            <div className="sticky top-0 z-10 bg-white shadow-sm">
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div className="text-lg font-semibold">Sistema ERP</div>
                
                <div className="w-6"></div> {/* Espaço para manter o título centralizado */}
              </div>
            </div>
            
            <main className="pb-8">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </div>
    );
  };
  
  // Componente de rota protegida que verifica autenticação usando o contexto
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return <Layout>{children}</Layout>;
  };
  
  // Componente para redirecionar usuários já autenticados para a página inicial
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
  };
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          
          {/* Rotas de Produtos */}
          <Route path="/produtos" element={<ProtectedRoute><ProdutosPage /></ProtectedRoute>} />
          <Route path="/produtos/novo" element={<ProtectedRoute><ProdutoForm /></ProtectedRoute>} />
          <Route path="/produtos/editar/:id" element={<ProtectedRoute><ProdutoForm modo="edicao" /></ProtectedRoute>} />
          <Route path="/produtos/categorias" element={<ProtectedRoute><CategoriaForm /></ProtectedRoute>} />
          
          {/* Rotas de Estoque */}
          <Route path="/estoque" element={<ProtectedRoute><EstoquePage /></ProtectedRoute>} />
          <Route path="/estoque/entrada" element={<ProtectedRoute><EstoqueEntradaForm /></ProtectedRoute>} />
          <Route path="/estoque/saida" element={<ProtectedRoute><EstoqueSaidaForm /></ProtectedRoute>} />
          <Route path="/estoque/ajuste" element={<ProtectedRoute><EstoqueAjusteForm /></ProtectedRoute>} />
          
          {/* Rotas de Clientes */}
          <Route path="/clientes" element={<ProtectedRoute><ClientesPage /></ProtectedRoute>} />
          <Route path="/clientes/novo" element={<ProtectedRoute><ClienteForm /></ProtectedRoute>} />
          <Route path="/clientes/editar/:id" element={<ProtectedRoute><ClienteForm modo="edicao" /></ProtectedRoute>} />
          
          {/* Rotas de Funcionários */}
          <Route path="/funcionarios" element={<ProtectedRoute><FuncionariosPage /></ProtectedRoute>} />
          <Route path="/funcionarios/novo" element={<ProtectedRoute><FuncionarioForm /></ProtectedRoute>} />
          <Route path="/funcionarios/editar/:id" element={<ProtectedRoute><FuncionarioForm modo="edicao" /></ProtectedRoute>} />
          
          {/* Rotas de Ponto */}
          <Route path="/ponto" element={<ProtectedRoute><PontoPage /></ProtectedRoute>} />
          
          {/* Rotas de Caixa */}
          <Route path="/caixa" element={<ProtectedRoute><CaixaPage /></ProtectedRoute>} />
          
          {/* Rotas de PDV */}
          <Route path="/pdv" element={<ProtectedRoute><PDVPage /></ProtectedRoute>} />
          
          {/* Rotas de Promoções */}
          <Route path="/promocoes" element={<ProtectedRoute><PromocoesPage /></ProtectedRoute>} />
          
          {/* Rotas de Emissão Fiscal */}
          <Route path="/fiscal" element={<ProtectedRoute><FiscalPage /></ProtectedRoute>} />
          
          {/* Rotas de Relatórios */}
          <Route path="/relatorios" element={<ProtectedRoute><RelatoriosPage /></ProtectedRoute>} />
          <Route path="/relatorios/:tipo" element={<ProtectedRoute><RelatoriosPage /></ProtectedRoute>} />
          
          {/* Rotas de Configurações */}
          <Route path="/configuracoes" element={<ProtectedRoute><ConfiguracoesPage /></ProtectedRoute>} />
          <Route path="/configuracoes/:secao" element={<ProtectedRoute><ConfiguracoesPage /></ProtectedRoute>} />
          
          {/* Rota de fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
