import { ReactNode, createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  // Estado para controlar se a sidebar está aberta (mobile) ou não
  const [isOpen, setIsOpen] = useState(true);
  
  // Estado para controlar se a sidebar está colapsada (desktop) ou não
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Inicializa o estado da sidebar com base no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false); // Fecha a sidebar em dispositivos móveis
      } else {
        setIsOpen(true); // Mantém a sidebar aberta em desktop
      }
    };

    // Configura o estado inicial
    handleResize();

    // Adiciona listener para redimensionamento
    window.addEventListener('resize', handleResize);
    
    // Limpa o listener quando o componente é desmontado
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, isCollapsed, toggleSidebar, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
