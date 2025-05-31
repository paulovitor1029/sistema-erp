import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './modules/auth/context/AuthContext';
import LoginPage from './modules/auth/components/LoginPage';
import Sidebar from './modules/layout/components/Sidebar';

// Importação dos componentes de página
import EstoquePage from './modules/estoque/components/EstoquePage';
import ProdutosPage from './modules/produtos/components/ProdutosPage';
import ProdutoForm from './modules/produtos/components/ProdutoForm';
import ProdutoDetalhes from './modules/produtos/components/ProdutoDetalhes';
import PromocoesPage from './modules/promocoes/components/PromocoesPage';
import PDVPage from './modules/pdv/components/PDVPage';
import FuncionariosPage from './modules/usuarios/components/FuncionariosPage';
import PontoPage from './modules/ponto/components/PontoPage';
import ClientesPage from './modules/clientes/components/ClientesPage';
import CaixaPage from './modules/caixa/components/CaixaPage';
import RelatoriosPage from './modules/relatorios/components/RelatoriosPage';
import ConfiguracoesPage from './modules/configuracoes/components/ConfiguracoesPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Verificar tamanho da tela para responsividade
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Função para alternar a visibilidade da sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Componente de layout principal que inclui a sidebar
  const Layout = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen && !isMobile ? 'ml-64' : 'ml-0'}`}>
          <div className="sticky top-0 z-10 bg-white shadow-md p-4 flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-800">Sistema ERP</h1>
          </div>
          <main className="p-4">
            {children}
          </main>
        </div>
      </div>
    );
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
          
          <Route path="/" element={<Layout><EstoquePage /></Layout>} />
          <Route path="/estoque" element={<Layout><EstoquePage /></Layout>} />
          
          <Route path="/produtos" element={<Layout><ProdutosPage /></Layout>} />
          <Route path="/produtos/novo" element={<Layout><ProdutoForm /></Layout>} />
          <Route path="/produtos/:id" element={<Layout><ProdutoDetalhes /></Layout>} />
          <Route path="/produtos/editar/:id" element={<Layout><ProdutoForm /></Layout>} />
          
          <Route path="/promocoes" element={<Layout><PromocoesPage /></Layout>} />
          
          <Route path="/pdv" element={<Layout><PDVPage /></Layout>} />
          
          <Route path="/funcionarios" element={<Layout><FuncionariosPage /></Layout>} />
          <Route path="/ponto" element={<Layout><PontoPage /></Layout>} />
          
          <Route path="/clientes" element={<Layout><ClientesPage /></Layout>} />
          <Route path="/clientes/novo" element={<Layout><ClientesPage /></Layout>} />
          <Route path="/clientes/:id" element={<Layout><ClientesPage /></Layout>} />
          <Route path="/clientes/editar/:id" element={<Layout><ClientesPage /></Layout>} />
          
          <Route path="/caixa" element={<Layout><CaixaPage /></Layout>} />
          
          <Route path="/relatorios" element={<Layout><RelatoriosPage /></Layout>} />
          <Route path="/relatorios/:tipo" element={<Layout><RelatoriosPage /></Layout>} />
          
          <Route path="/configuracoes" element={<Layout><ConfiguracoesPage /></Layout>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
