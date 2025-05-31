import { useState, useEffect } from 'react';
import { Venda } from '../../pdv/hooks/usePDV';
import { Produto } from '../../produtos/hooks/useProdutos';
import { Cliente } from '../../clientes/hooks/useClientes';
import { Usuario } from '../../usuarios/hooks/useUsuarios';

export interface RelatorioVendas {
  periodo: string;
  totalVendas: number;
  totalItens: number;
  ticketMedio: number;
  vendasPorFormaPagamento: {
    formaPagamento: string;
    valor: number;
    percentual: number;
  }[];
  vendasPorUsuario: {
    usuarioId: number;
    nomeUsuario: string;
    totalVendas: number;
    percentual: number;
  }[];
  vendasPorCategoria: {
    categoria: string;
    totalVendas: number;
    percentual: number;
  }[];
  vendasPorHora: {
    hora: number;
    totalVendas: number;
    percentual: number;
  }[];
}

export interface RelatorioEstoque {
  totalProdutos: number;
  valorTotalEstoque: number;
  produtosAbaixoMinimo: number;
  movimentacoesPorTipo: {
    tipo: string;
    quantidade: number;
    valor: number;
  }[];
  categoriasMaisMovimentadas: {
    categoria: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }[];
}

export interface RelatorioClientes {
  totalClientes: number;
  clientesAtivos: number;
  novosPeriodo: number;
  clientesPorFidelidade: {
    nivel: string;
    quantidade: number;
    percentual: number;
  }[];
  maioresCompradores: {
    clienteId: number;
    nomeCliente: string;
    totalCompras: number;
    ultimaCompra: string;
  }[];
}

export interface RelatorioProdutos {
  maisVendidos: {
    produtoId: number;
    nomeProduto: string;
    quantidade: number;
    valorTotal: number;
  }[];
  menosVendidos: {
    produtoId: number;
    nomeProduto: string;
    quantidade: number;
    valorTotal: number;
  }[];
  maioresLucros: {
    produtoId: number;
    nomeProduto: string;
    quantidade: number;
    custoTotal: number;
    vendaTotal: number;
    lucro: number;
    margemLucro: number;
  }[];
}

export interface RelatorioComparativo {
  periodoAtual: string;
  periodoAnterior: string;
  vendasAtual: number;
  vendasAnterior: number;
  variacaoVendas: number;
  itensAtual: number;
  itensAnterior: number;
  variacaoItens: number;
  ticketMedioAtual: number;
  ticketMedioAnterior: number;
  variacaoTicket: number;
  comparativoCategorias: {
    categoria: string;
    valorAtual: number;
    valorAnterior: number;
    variacao: number;
  }[];
}

// Mock de dados para relatórios
const mockRelatorioVendas: RelatorioVendas = {
  periodo: "01/05/2025 a 31/05/2025",
  totalVendas: 45750.90,
  totalItens: 387,
  ticketMedio: 118.22,
  vendasPorFormaPagamento: [
    { formaPagamento: "Cartão de Crédito", valor: 25750.50, percentual: 56.3 },
    { formaPagamento: "Dinheiro", valor: 8500.20, percentual: 18.6 },
    { formaPagamento: "PIX", valor: 7200.10, percentual: 15.7 },
    { formaPagamento: "Cartão de Débito", valor: 4300.10, percentual: 9.4 }
  ],
  vendasPorUsuario: [
    { usuarioId: 1, nomeUsuario: "João Silva", totalVendas: 18300.40, percentual: 40 },
    { usuarioId: 2, nomeUsuario: "Maria Oliveira", totalVendas: 15200.30, percentual: 33.2 },
    { usuarioId: 3, nomeUsuario: "Carlos Santos", totalVendas: 12250.20, percentual: 26.8 }
  ],
  vendasPorCategoria: [
    { categoria: "Eletrônicos", totalVendas: 28450.50, percentual: 62.2 },
    { categoria: "Periféricos", totalVendas: 17300.40, percentual: 37.8 }
  ],
  vendasPorHora: [
    { hora: 8, totalVendas: 2300.10, percentual: 5 },
    { hora: 9, totalVendas: 3100.20, percentual: 6.8 },
    { hora: 10, totalVendas: 4200.30, percentual: 9.2 },
    { hora: 11, totalVendas: 5100.40, percentual: 11.1 },
    { hora: 12, totalVendas: 3200.50, percentual: 7 },
    { hora: 13, totalVendas: 2800.60, percentual: 6.1 },
    { hora: 14, totalVendas: 4500.70, percentual: 9.8 },
    { hora: 15, totalVendas: 5200.80, percentual: 11.4 },
    { hora: 16, totalVendas: 6100.90, percentual: 13.3 },
    { hora: 17, totalVendas: 5800.10, percentual: 12.7 },
    { hora: 18, totalVendas: 3450.30, percentual: 7.5 }
  ]
};

const mockRelatorioEstoque: RelatorioEstoque = {
  totalProdutos: 85,
  valorTotalEstoque: 125750.80,
  produtosAbaixoMinimo: 12,
  movimentacoesPorTipo: [
    { tipo: "Compra", quantidade: 250, valor: 35200.50 },
    { tipo: "Venda", quantidade: 387, valor: 45750.90 },
    { tipo: "Perda", quantidade: 15, valor: 1250.30 },
    { tipo: "Devolução", quantidade: 8, valor: 950.20 }
  ],
  categoriasMaisMovimentadas: [
    { categoria: "Eletrônicos", entradas: 120, saidas: 230, saldo: -110 },
    { categoria: "Periféricos", entradas: 130, saidas: 157, saldo: -27 },
    { categoria: "Acessórios", entradas: 80, saidas: 65, saldo: 15 }
  ]
};

const mockRelatorioClientes: RelatorioClientes = {
  totalClientes: 350,
  clientesAtivos: 215,
  novosPeriodo: 28,
  clientesPorFidelidade: [
    { nivel: "Bronze", quantidade: 120, percentual: 34.3 },
    { nivel: "Prata", quantidade: 85, percentual: 24.3 },
    { nivel: "Ouro", quantidade: 65, percentual: 18.6 },
    { nivel: "Diamante", quantidade: 45, percentual: 12.9 },
    { nivel: "Sem Fidelidade", quantidade: 35, percentual: 10 }
  ],
  maioresCompradores: [
    { clienteId: 1, nomeCliente: "Empresa ABC Ltda", totalCompras: 12500.50, ultimaCompra: "28/05/2025" },
    { clienteId: 2, nomeCliente: "João Pereira", totalCompras: 8750.30, ultimaCompra: "25/05/2025" },
    { clienteId: 3, nomeCliente: "Maria Silva", totalCompras: 7200.20, ultimaCompra: "30/05/2025" },
    { clienteId: 4, nomeCliente: "Carlos Oliveira", totalCompras: 6500.10, ultimaCompra: "22/05/2025" },
    { clienteId: 5, nomeCliente: "Ana Santos", totalCompras: 5800.90, ultimaCompra: "29/05/2025" }
  ]
};

const mockRelatorioProdutos: RelatorioProdutos = {
  maisVendidos: [
    { produtoId: 1, nomeProduto: "Notebook Dell", quantidade: 25, valorTotal: 87500.00 },
    { produtoId: 4, nomeProduto: "Monitor 24\"", quantidade: 18, valorTotal: 16198.20 },
    { produtoId: 3, nomeProduto: "Teclado mecânico", quantidade: 15, valorTotal: 3750.00 },
    { produtoId: 2, nomeProduto: "Mouse sem fio", quantidade: 30, valorTotal: 2697.00 },
    { produtoId: 5, nomeProduto: "Headset Gamer", quantidade: 12, valorTotal: 2398.80 }
  ],
  menosVendidos: [
    { produtoId: 8, nomeProduto: "Adaptador HDMI", quantidade: 3, valorTotal: 89.70 },
    { produtoId: 9, nomeProduto: "Mousepad", quantidade: 5, valorTotal: 149.50 },
    { produtoId: 10, nomeProduto: "Cabo USB-C", quantidade: 7, valorTotal: 209.30 },
    { produtoId: 7, nomeProduto: "Webcam HD", quantidade: 8, valorTotal: 1199.20 },
    { produtoId: 6, nomeProduto: "SSD 500GB", quantidade: 10, valorTotal: 1999.00 }
  ],
  maioresLucros: [
    { produtoId: 1, nomeProduto: "Notebook Dell", quantidade: 25, custoTotal: 70000.00, vendaTotal: 87500.00, lucro: 17500.00, margemLucro: 20 },
    { produtoId: 4, nomeProduto: "Monitor 24\"", quantidade: 18, custoTotal: 10800.00, vendaTotal: 16198.20, lucro: 5398.20, margemLucro: 33.3 },
    { produtoId: 5, nomeProduto: "Headset Gamer", quantidade: 12, custoTotal: 1440.00, vendaTotal: 2398.80, lucro: 958.80, margemLucro: 40 },
    { produtoId: 3, nomeProduto: "Teclado mecânico", quantidade: 15, custoTotal: 2250.00, vendaTotal: 3750.00, lucro: 1500.00, margemLucro: 40 },
    { produtoId: 2, nomeProduto: "Mouse sem fio", quantidade: 30, custoTotal: 1350.00, vendaTotal: 2697.00, lucro: 1347.00, margemLucro: 49.9 }
  ]
};

const mockRelatorioComparativo: RelatorioComparativo = {
  periodoAtual: "Maio/2025",
  periodoAnterior: "Abril/2025",
  vendasAtual: 45750.90,
  vendasAnterior: 38500.50,
  variacaoVendas: 18.8,
  itensAtual: 387,
  itensAnterior: 325,
  variacaoItens: 19.1,
  ticketMedioAtual: 118.22,
  ticketMedioAnterior: 115.50,
  variacaoTicket: 2.4,
  comparativoCategorias: [
    { categoria: "Eletrônicos", valorAtual: 28450.50, valorAnterior: 22300.30, variacao: 27.6 },
    { categoria: "Periféricos", valorAtual: 17300.40, valorAnterior: 16200.20, variacao: 6.8 }
  ]
};

export const useRelatorios = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [relatorioVendas, setRelatorioVendas] = useState<RelatorioVendas | null>(null);
  const [relatorioEstoque, setRelatorioEstoque] = useState<RelatorioEstoque | null>(null);
  const [relatorioClientes, setRelatorioClientes] = useState<RelatorioClientes | null>(null);
  const [relatorioProdutos, setRelatorioProdutos] = useState<RelatorioProdutos | null>(null);
  const [relatorioComparativo, setRelatorioComparativo] = useState<RelatorioComparativo | null>(null);
  
  const gerarRelatorioVendas = async (dataInicio: string, dataFim: string, usuarioId?: number, clienteId?: number, categoria?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Em uma implementação real, os parâmetros seriam usados para filtrar os dados
      setRelatorioVendas(mockRelatorioVendas);
      return mockRelatorioVendas;
    } catch (err) {
      setError('Erro ao gerar relatório de vendas');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const gerarRelatorioEstoque = async (dataInicio: string, dataFim: string, categoria?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Em uma implementação real, os parâmetros seriam usados para filtrar os dados
      setRelatorioEstoque(mockRelatorioEstoque);
      return mockRelatorioEstoque;
    } catch (err) {
      setError('Erro ao gerar relatório de estoque');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const gerarRelatorioClientes = async (dataInicio: string, dataFim: string, nivelFidelidade?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Em uma implementação real, os parâmetros seriam usados para filtrar os dados
      setRelatorioClientes(mockRelatorioClientes);
      return mockRelatorioClientes;
    } catch (err) {
      setError('Erro ao gerar relatório de clientes');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const gerarRelatorioProdutos = async (dataInicio: string, dataFim: string, categoria?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Em uma implementação real, os parâmetros seriam usados para filtrar os dados
      setRelatorioProdutos(mockRelatorioProdutos);
      return mockRelatorioProdutos;
    } catch (err) {
      setError('Erro ao gerar relatório de produtos');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const gerarRelatorioComparativo = async (periodoAtual: { inicio: string; fim: string }, periodoAnterior: { inicio: string; fim: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Em uma implementação real, os parâmetros seriam usados para filtrar os dados
      setRelatorioComparativo(mockRelatorioComparativo);
      return mockRelatorioComparativo;
    } catch (err) {
      setError('Erro ao gerar relatório comparativo');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const exportarRelatorioCSV = async (tipo: string, dados: any) => {
    try {
      // Em uma implementação real, isso converteria os dados para CSV
      // e retornaria um blob ou URL para download
      
      console.log(`Exportando relatório ${tipo} para CSV`);
      return true;
    } catch (err) {
      setError('Erro ao exportar relatório para CSV');
      return false;
    }
  };
  
  const exportarRelatorioPDF = async (tipo: string, dados: any) => {
    try {
      // Em uma implementação real, isso converteria os dados para PDF
      // e retornaria um blob ou URL para download
      
      console.log(`Exportando relatório ${tipo} para PDF`);
      return true;
    } catch (err) {
      setError('Erro ao exportar relatório para PDF');
      return false;
    }
  };
  
  return {
    isLoading,
    error,
    relatorioVendas,
    relatorioEstoque,
    relatorioClientes,
    relatorioProdutos,
    relatorioComparativo,
    gerarRelatorioVendas,
    gerarRelatorioEstoque,
    gerarRelatorioClientes,
    gerarRelatorioProdutos,
    gerarRelatorioComparativo,
    exportarRelatorioCSV,
    exportarRelatorioPDF
  };
};
