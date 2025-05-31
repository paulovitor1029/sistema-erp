import { useContext } from 'react';
import { createContext, useState, ReactNode, useEffect } from 'react';

// Interface para configurações de módulos
export interface ModulosConfig {
  produtos: boolean;
  servicos: boolean;
  estoque: boolean;
  pdv: boolean;
  promocoes: boolean;
  fiscal: boolean;
  ponto: boolean;
}

// Interface para tipo de negócio
export type TipoNegocio = 'comercio' | 'servico' | 'industria' | 'misto';

// Interface para configurações da empresa
export interface EmpresaConfig {
  nome: string;
  tipoNegocio: TipoNegocio;
  modulos: ModulosConfig;
}

// Interface para o contexto de configuração
interface ConfigContextType {
  config: EmpresaConfig;
  isModuloAtivo: (modulo: keyof ModulosConfig) => boolean;
  setTipoNegocio: (tipo: TipoNegocio) => void;
  ativarModulo: (modulo: keyof ModulosConfig) => void;
  desativarModulo: (modulo: keyof ModulosConfig) => void;
  isLoading: boolean;
}

// Valores padrão para o contexto
const defaultConfig: EmpresaConfig = {
  nome: 'Minha Empresa',
  tipoNegocio: 'comercio',
  modulos: {
    produtos: true,
    servicos: false,
    estoque: true,
    pdv: true,
    promocoes: true,
    fiscal: true,
    ponto: true
  }
};

// Criação do contexto
export const ConfigContext = createContext<ConfigContextType>({
  config: defaultConfig,
  isModuloAtivo: () => false,
  setTipoNegocio: () => {},
  ativarModulo: () => {},
  desativarModulo: () => {},
  isLoading: true
});

// Props para o provedor de contexto
interface ConfigProviderProps {
  children: ReactNode;
}

// Provedor de contexto
export const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const [config, setConfig] = useState<EmpresaConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar configurações do localStorage ou da API
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        // No futuro, isso virá da API
        const configSalva = localStorage.getItem('empresaConfig');
        
        if (configSalva) {
          setConfig(JSON.parse(configSalva));
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarConfiguracoes();
  }, []);

  // Salvar configurações quando mudarem
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('empresaConfig', JSON.stringify(config));
      // No futuro, isso será enviado para a API
    }
  }, [config, isLoading]);

  // Verificar se um módulo está ativo
  const isModuloAtivo = (modulo: keyof ModulosConfig) => {
    return config.modulos[modulo];
  };

  // Definir tipo de negócio
  const setTipoNegocio = (tipo: TipoNegocio) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      tipoNegocio: tipo,
      // Ajustar módulos automaticamente com base no tipo de negócio
      modulos: {
        ...prevConfig.modulos,
        servicos: tipo === 'servico' || tipo === 'misto',
        estoque: tipo === 'comercio' || tipo === 'industria' || tipo === 'misto',
        pdv: tipo === 'comercio' || tipo === 'misto'
      }
    }));
  };

  // Ativar um módulo
  const ativarModulo = (modulo: keyof ModulosConfig) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      modulos: {
        ...prevConfig.modulos,
        [modulo]: true
      }
    }));
  };

  // Desativar um módulo
  const desativarModulo = (modulo: keyof ModulosConfig) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      modulos: {
        ...prevConfig.modulos,
        [modulo]: false
      }
    }));
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        isModuloAtivo,
        setTipoNegocio,
        ativarModulo,
        desativarModulo,
        isLoading
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

// Hook para usar o contexto de configuração
export const useConfig = () => {
  const context = useContext(ConfigContext);
  
  if (!context) {
    throw new Error('useConfig deve ser usado dentro de um ConfigProvider');
  }
  
  return context;
};
