import { useState, useEffect } from 'react';

export interface RegistroPonto {
  id: number;
  funcionarioId: number;
  data: string;
  entrada: string;
  saida?: string;
  horasTrabalhadas?: number;
  observacao?: string;
}

export const usePonto = () => {
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistros = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Inicializa com array vazio em vez de dados mockados
      setRegistros([]);
    } catch (err) {
      setError('Erro ao carregar registros de ponto');
    } finally {
      setIsLoading(false);
    }
  };

  const registrarEntrada = async (funcionarioId: number, observacao?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const agora = new Date();
      const dataHoje = agora.toISOString().split('T')[0];
      const horaAgora = agora.toTimeString().split(' ')[0];
      
      // Verificar se já existe registro de entrada para hoje
      const registroExistente = registros.find(r => 
        r.funcionarioId === funcionarioId && 
        r.data === dataHoje && 
        !r.saida
      );
      
      if (registroExistente) {
        setError('Já existe um registro de entrada para hoje sem saída');
        return null;
      }
      
      const novoRegistro: RegistroPonto = {
        id: Math.max(...registros.map(r => r.id), 0) + 1,
        funcionarioId,
        data: dataHoje,
        entrada: horaAgora,
        observacao
      };
      
      setRegistros([...registros, novoRegistro]);
      return novoRegistro;
    } catch (err) {
      setError('Erro ao registrar entrada');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const registrarSaida = async (funcionarioId: number, observacao?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const agora = new Date();
      const dataHoje = agora.toISOString().split('T')[0];
      const horaAgora = agora.toTimeString().split(' ')[0];
      
      // Buscar registro de entrada sem saída
      const registroEntrada = registros.find(r => 
        r.funcionarioId === funcionarioId && 
        r.data === dataHoje && 
        !r.saida
      );
      
      if (!registroEntrada) {
        setError('Não há registro de entrada sem saída para hoje');
        return null;
      }
      
      // Calcular horas trabalhadas
      const entradaHora = new Date(`${dataHoje}T${registroEntrada.entrada}`);
      const saidaHora = new Date(`${dataHoje}T${horaAgora}`);
      const diferencaMs = saidaHora.getTime() - entradaHora.getTime();
      const horasTrabalhadas = diferencaMs / (1000 * 60 * 60);
      
      // Atualizar registro
      const registrosAtualizados = registros.map(r => {
        if (r.id === registroEntrada.id) {
          return {
            ...r,
            saida: horaAgora,
            horasTrabalhadas,
            observacao: observacao || r.observacao
          };
        }
        return r;
      });
      
      setRegistros(registrosAtualizados);
      
      return registrosAtualizados.find(r => r.id === registroEntrada.id) || null;
    } catch (err) {
      setError('Erro ao registrar saída');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const editarRegistro = async (id: number, dados: Partial<RegistroPonto>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Se estiver atualizando entrada e saída, recalcular horas trabalhadas
      let horasTrabalhadas = dados.horasTrabalhadas;
      
      if (dados.entrada || dados.saida) {
        const registro = registros.find(r => r.id === id);
        
        if (registro) {
          const entrada = dados.entrada || registro.entrada;
          const saida = dados.saida || registro.saida;
          
          if (saida) {
            const entradaHora = new Date(`${registro.data}T${entrada}`);
            const saidaHora = new Date(`${registro.data}T${saida}`);
            const diferencaMs = saidaHora.getTime() - entradaHora.getTime();
            horasTrabalhadas = diferencaMs / (1000 * 60 * 60);
          }
        }
      }
      
      const registrosAtualizados = registros.map(r => {
        if (r.id === id) {
          return {
            ...r,
            ...dados,
            horasTrabalhadas: horasTrabalhadas !== undefined ? horasTrabalhadas : r.horasTrabalhadas
          };
        }
        return r;
      });
      
      setRegistros(registrosAtualizados);
      
      return true;
    } catch (err) {
      setError('Erro ao editar registro');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const excluirRegistro = async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRegistros(registros.filter(r => r.id !== id));
      
      return true;
    } catch (err) {
      setError('Erro ao excluir registro');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getRegistrosPorFuncionario = (funcionarioId: number) => {
    return registros.filter(r => r.funcionarioId === funcionarioId);
  };

  const getRegistrosPorPeriodo = (dataInicio: string, dataFim: string) => {
    return registros.filter(r => 
      r.data >= dataInicio && 
      r.data <= dataFim
    );
  };

  const getHorasTrabalhadasPorPeriodo = (funcionarioId: number, dataInicio: string, dataFim: string) => {
    const registrosFiltrados = registros.filter(r => 
      r.funcionarioId === funcionarioId && 
      r.data >= dataInicio && 
      r.data <= dataFim &&
      r.horasTrabalhadas !== undefined
    );
    
    return registrosFiltrados.reduce((total, r) => total + (r.horasTrabalhadas || 0), 0);
  };

  useEffect(() => {
    fetchRegistros();
  }, []);

  return {
    registros,
    isLoading,
    error,
    registrarEntrada,
    registrarSaida,
    editarRegistro,
    excluirRegistro,
    getRegistrosPorFuncionario,
    getRegistrosPorPeriodo,
    getHorasTrabalhadasPorPeriodo,
    recarregarRegistros: fetchRegistros
  };
};
