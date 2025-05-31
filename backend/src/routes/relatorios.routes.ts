import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Obter configurações de relatórios
router.get('/:empresaId/config', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Buscar configurações de relatórios do usuário e compartilhados
    const relatorios = await prisma.relatorioConfig.findMany({
      where: {
        empresaId: Number(empresaId),
        OR: [
          { usuarioId: Number(userId) },
          { compartilhado: true }
        ]
      },
      orderBy: { nome: 'asc' }
    });
    
    return res.json(relatorios);
  } catch (error) {
    console.error('Erro ao buscar configurações de relatórios:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Salvar configuração de relatório
router.post('/:empresaId/config', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    const { 
      nome, 
      tipo, 
      descricao, 
      filtros, 
      colunas, 
      ordenacao, 
      agrupamento, 
      formato, 
      tipoGrafico, 
      compartilhado 
    } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Criar configuração de relatório
    const novaConfig = await prisma.relatorioConfig.create({
      data: {
        nome,
        tipo,
        descricao,
        filtros: typeof filtros === 'string' ? filtros : JSON.stringify(filtros),
        colunas: typeof colunas === 'string' ? colunas : JSON.stringify(colunas),
        ordenacao,
        agrupamento,
        formato,
        tipoGrafico,
        compartilhado: Boolean(compartilhado),
        usuarioId: Number(userId),
        empresaId: Number(empresaId)
      }
    });
    
    return res.status(201).json(novaConfig);
  } catch (error) {
    console.error('Erro ao salvar configuração de relatório:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar configuração de relatório
router.put('/:empresaId/config/:id', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    const { 
      nome, 
      descricao, 
      filtros, 
      colunas, 
      ordenacao, 
      agrupamento, 
      formato, 
      tipoGrafico, 
      compartilhado 
    } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true, role: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se a configuração existe
    const config = await prisma.relatorioConfig.findUnique({
      where: { id: Number(id) }
    });
    
    if (!config) {
      return res.status(404).json({ error: 'Configuração de relatório não encontrada' });
    }
    
    // Verificar se o usuário tem permissão para editar
    if (config.usuarioId !== Number(userId) && usuario.role !== 'admin') {
      return res.status(403).json({ error: 'Você não tem permissão para editar esta configuração' });
    }
    
    // Atualizar configuração
    const configAtualizada = await prisma.relatorioConfig.update({
      where: { id: Number(id) },
      data: {
        nome,
        descricao,
        filtros: filtros ? (typeof filtros === 'string' ? filtros : JSON.stringify(filtros)) : undefined,
        colunas: colunas ? (typeof colunas === 'string' ? colunas : JSON.stringify(colunas)) : undefined,
        ordenacao,
        agrupamento,
        formato,
        tipoGrafico,
        compartilhado: compartilhado !== undefined ? Boolean(compartilhado) : undefined
      }
    });
    
    return res.json(configAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar configuração de relatório:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir configuração de relatório
router.delete('/:empresaId/config/:id', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true, role: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se a configuração existe
    const config = await prisma.relatorioConfig.findUnique({
      where: { id: Number(id) }
    });
    
    if (!config) {
      return res.status(404).json({ error: 'Configuração de relatório não encontrada' });
    }
    
    // Verificar se o usuário tem permissão para excluir
    if (config.usuarioId !== Number(userId) && usuario.role !== 'admin') {
      return res.status(403).json({ error: 'Você não tem permissão para excluir esta configuração' });
    }
    
    // Excluir configuração
    await prisma.relatorioConfig.delete({
      where: { id: Number(id) }
    });
    
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir configuração de relatório:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter dados de relatório
router.get('/:empresaId/dados', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { 
      relatorioId, 
      tipo, 
      colunas, 
      ordenacao, 
      agrupamento, 
      formato, 
      filtros 
    } = req.query;
    const userId = req.user?.id;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    let configRelatorio: any = null;
    
    // Se foi informado um ID de relatório, buscar a configuração
    if (relatorioId) {
      configRelatorio = await prisma.relatorioConfig.findFirst({
        where: {
          id: Number(relatorioId),
          empresaId: Number(empresaId),
          OR: [
            { usuarioId: Number(userId) },
            { compartilhado: true }
          ]
        }
      });
      
      if (!configRelatorio) {
        return res.status(404).json({ error: 'Configuração de relatório não encontrada' });
      }
    }
    
    // Definir parâmetros do relatório
    const tipoRelatorio = configRelatorio?.tipo || tipo;
    const colunasRelatorio = configRelatorio?.colunas ? 
      (typeof configRelatorio.colunas === 'string' ? JSON.parse(configRelatorio.colunas) : configRelatorio.colunas) : 
      (colunas ? (typeof colunas === 'string' ? colunas.split(',') : colunas) : []);
    const ordenacaoRelatorio = configRelatorio?.ordenacao || ordenacao;
    const agrupamentoRelatorio = configRelatorio?.agrupamento || agrupamento;
    const formatoRelatorio = configRelatorio?.formato || formato;
    const filtrosRelatorio = configRelatorio?.filtros ? 
      (typeof configRelatorio.filtros === 'string' ? JSON.parse(configRelatorio.filtros) : configRelatorio.filtros) : 
      (filtros ? (typeof filtros === 'string' ? JSON.parse(filtros as string) : filtros) : {});
    
    // Aqui seria implementada a lógica para buscar os dados de acordo com o tipo de relatório
    // Por enquanto, retornamos dados simulados
    
    let dados: any[] = [];
    let colunasDados: string[] = [];
    
    switch (tipoRelatorio) {
      case 'vendas':
        colunasDados = ['id', 'data', 'cliente', 'valor', 'status'];
        // Dados simulados
        break;
      case 'estoque':
        colunasDados = ['id', 'produto', 'quantidade', 'tipo', 'data'];
        // Dados simulados
        break;
      case 'financeiro':
        colunasDados = ['id', 'data', 'tipo', 'categoria', 'valor', 'status'];
        // Dados simulados
        break;
      case 'clientes':
        colunasDados = ['id', 'nome', 'tipo', 'cpfCnpj', 'email', 'telefone', 'valorTotalCompras'];
        // Dados simulados
        break;
      case 'produtos':
        colunasDados = ['id', 'codigo', 'nome', 'categoria', 'precoCusto', 'precoVenda', 'estoqueAtual'];
        // Dados simulados
        break;
      case 'fiscal':
        colunasDados = ['id', 'tipo', 'modelo', 'numero', 'dataEmissao', 'valor', 'status'];
        // Dados simulados
        break;
      default:
        return res.status(400).json({ error: 'Tipo de relatório inválido' });
    }
    
    // Filtrar colunas de acordo com o solicitado
    if (colunasRelatorio.length > 0) {
      colunasDados = colunasDados.filter(col => colunasRelatorio.includes(col));
    }
    
    // Preparar resposta
    const resposta: any = {
      colunas: colunasDados,
      dados: dados
    };
    
    // Se for gráfico, adicionar dados do gráfico
    if (formatoRelatorio === 'grafico') {
      resposta.grafico = {
        labels: [],
        datasets: [
          {
            label: 'Dados',
            data: []
          }
        ]
      };
    }
    
    return res.json(resposta);
  } catch (error) {
    console.error('Erro ao obter dados do relatório:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Exportar relatório
router.get('/:empresaId/exportar', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { 
      formato, 
      relatorioId, 
      tipo, 
      colunas, 
      ordenacao, 
      agrupamento, 
      filtros 
    } = req.query;
    const userId = req.user?.id;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar formato
    if (!formato || !['pdf', 'excel', 'csv'].includes(formato as string)) {
      return res.status(400).json({ error: 'Formato inválido' });
    }
    
    // Aqui seria implementada a lógica para gerar o arquivo de acordo com o formato
    // Por enquanto, retornamos um erro
    
    return res.status(501).json({ error: 'Funcionalidade não implementada' });
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter metadados para construção de relatórios
router.get('/:empresaId/metadados/:tipo', authenticateToken, async (req, res) => {
  try {
    const { empresaId, tipo } = req.params;
    const userId = req.user?.id;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar tipo
    if (!['vendas', 'estoque', 'financeiro', 'clientes', 'produtos', 'fiscal'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }
    
    // Retornar metadados de acordo com o tipo
    const metadados: Record<string, any> = {
      vendas: {
        colunas: [
          { id: 'id', nome: 'ID', tipo: 'numero' },
          { id: 'data', nome: 'Data', tipo: 'data' },
          { id: 'cliente', nome: 'Cliente', tipo: 'texto' },
          { id: 'valor', nome: 'Valor', tipo: 'moeda' },
          { id: 'status', nome: 'Status', tipo: 'texto' }
        ],
        filtros: [
          { id: 'dataInicio', nome: 'Data Início', tipo: 'data' },
          { id: 'dataFim', nome: 'Data Fim', tipo: 'data' },
          { id: 'clienteId', nome: 'Cliente', tipo: 'selecao' },
          { id: 'status', nome: 'Status', tipo: 'selecao' }
        ],
        agrupamentos: [
          { id: 'data', nome: 'Data' },
          { id: 'cliente', nome: 'Cliente' },
          { id: 'status', nome: 'Status' }
        ]
      },
      estoque: {
        colunas: [
          { id: 'id', nome: 'ID', tipo: 'numero' },
          { id: 'produto', nome: 'Produto', tipo: 'texto' },
          { id: 'quantidade', nome: 'Quantidade', tipo: 'numero' },
          { id: 'tipo', nome: 'Tipo', tipo: 'texto' },
          { id: 'data', nome: 'Data', tipo: 'data' }
        ],
        filtros: [
          { id: 'dataInicio', nome: 'Data Início', tipo: 'data' },
          { id: 'dataFim', nome: 'Data Fim', tipo: 'data' },
          { id: 'produtoId', nome: 'Produto', tipo: 'selecao' },
          { id: 'tipo', nome: 'Tipo', tipo: 'selecao' }
        ],
        agrupamentos: [
          { id: 'data', nome: 'Data' },
          { id: 'produto', nome: 'Produto' },
          { id: 'tipo', nome: 'Tipo' }
        ]
      },
      financeiro: {
        colunas: [
          { id: 'id', nome: 'ID', tipo: 'numero' },
          { id: 'data', nome: 'Data', tipo: 'data' },
          { id: 'tipo', nome: 'Tipo', tipo: 'texto' },
          { id: 'categoria', nome: 'Categoria', tipo: 'texto' },
          { id: 'valor', nome: 'Valor', tipo: 'moeda' },
          { id: 'status', nome: 'Status', tipo: 'texto' }
        ],
        filtros: [
          { id: 'dataInicio', nome: 'Data Início', tipo: 'data' },
          { id: 'dataFim', nome: 'Data Fim', tipo: 'data' },
          { id: 'tipo', nome: 'Tipo', tipo: 'selecao' },
          { id: 'categoria', nome: 'Categoria', tipo: 'selecao' },
          { id: 'status', nome: 'Status', tipo: 'selecao' }
        ],
        agrupamentos: [
          { id: 'data', nome: 'Data' },
          { id: 'tipo', nome: 'Tipo' },
          { id: 'categoria', nome: 'Categoria' },
          { id: 'status', nome: 'Status' }
        ]
      },
      clientes: {
        colunas: [
          { id: 'id', nome: 'ID', tipo: 'numero' },
          { id: 'nome', nome: 'Nome', tipo: 'texto' },
          { id: 'tipo', nome: 'Tipo', tipo: 'texto' },
          { id: 'cpfCnpj', nome: 'CPF/CNPJ', tipo: 'texto' },
          { id: 'email', nome: 'Email', tipo: 'texto' },
          { id: 'telefone', nome: 'Telefone', tipo: 'texto' },
          { id: 'valorTotalCompras', nome: 'Total de Compras', tipo: 'moeda' }
        ],
        filtros: [
          { id: 'tipo', nome: 'Tipo', tipo: 'selecao' },
          { id: 'cidade', nome: 'Cidade', tipo: 'texto' },
          { id: 'estado', nome: 'Estado', tipo: 'texto' },
          { id: 'valorMinimo', nome: 'Valor Mínimo', tipo: 'moeda' }
        ],
        agrupamentos: [
          { id: 'tipo', nome: 'Tipo' },
          { id: 'cidade', nome: 'Cidade' },
          { id: 'estado', nome: 'Estado' }
        ]
      },
      produtos: {
        colunas: [
          { id: 'id', nome: 'ID', tipo: 'numero' },
          { id: 'codigo', nome: 'Código', tipo: 'texto' },
          { id: 'nome', nome: 'Nome', tipo: 'texto' },
          { id: 'categoria', nome: 'Categoria', tipo: 'texto' },
          { id: 'precoCusto', nome: 'Preço de Custo', tipo: 'moeda' },
          { id: 'precoVenda', nome: 'Preço de Venda', tipo: 'moeda' },
          { id: 'estoqueAtual', nome: 'Estoque Atual', tipo: 'numero' }
        ],
        filtros: [
          { id: 'categoria', nome: 'Categoria', tipo: 'selecao' },
          { id: 'estoqueMinimo', nome: 'Estoque Mínimo', tipo: 'numero' },
          { id: 'ativo', nome: 'Ativo', tipo: 'boolean' }
        ],
        agrupamentos: [
          { id: 'categoria', nome: 'Categoria' }
        ]
      },
      fiscal: {
        colunas: [
          { id: 'id', nome: 'ID', tipo: 'numero' },
          { id: 'tipo', nome: 'Tipo', tipo: 'texto' },
          { id: 'modelo', nome: 'Modelo', tipo: 'texto' },
          { id: 'numero', nome: 'Número', tipo: 'texto' },
          { id: 'dataEmissao', nome: 'Data Emissão', tipo: 'data' },
          { id: 'valor', nome: 'Valor', tipo: 'moeda' },
          { id: 'status', nome: 'Status', tipo: 'texto' }
        ],
        filtros: [
          { id: 'dataInicio', nome: 'Data Início', tipo: 'data' },
          { id: 'dataFim', nome: 'Data Fim', tipo: 'data' },
          { id: 'tipo', nome: 'Tipo', tipo: 'selecao' },
          { id: 'modelo', nome: 'Modelo', tipo: 'selecao' },
          { id: 'status', nome: 'Status', tipo: 'selecao' }
        ],
        agrupamentos: [
          { id: 'dataEmissao', nome: 'Data Emissão' },
          { id: 'tipo', nome: 'Tipo' },
          { id: 'modelo', nome: 'Modelo' },
          { id: 'status', nome: 'Status' }
        ]
      }
    };
    
    return res.json(metadados[tipo]);
  } catch (error) {
    console.error('Erro ao obter metadados:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
