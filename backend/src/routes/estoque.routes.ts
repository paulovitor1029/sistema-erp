import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isManager } from '../middlewares/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Obter todas as movimentações de estoque de uma empresa
router.get('/:empresaId/movimentacoes', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { produtoId, tipo, dataInicio, dataFim } = req.query;
    const userId = req.user?.id;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Construir filtro
    const filtro: any = {
      empresaId: Number(empresaId)
    };
    
    if (produtoId) {
      filtro.produtoId = Number(produtoId);
    }
    
    if (tipo) {
      filtro.tipo = tipo;
    }
    
    if (dataInicio || dataFim) {
      filtro.data = {};
      
      if (dataInicio) {
        filtro.data.gte = new Date(dataInicio as string);
      }
      
      if (dataFim) {
        filtro.data.lte = new Date(dataFim as string);
      }
    }
    
    // Buscar movimentações
    const movimentacoes = await prisma.movimentacaoEstoque.findMany({
      where: filtro,
      include: {
        produto: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: { data: 'desc' }
    });
    
    return res.json(movimentacoes);
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registrar entrada de estoque
router.post('/:empresaId/entrada', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    const { produtoId, quantidade, observacao } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true, role: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se o produto existe
    const produto = await prisma.produto.findFirst({
      where: {
        id: Number(produtoId),
        empresaId: Number(empresaId)
      }
    });
    
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Criar movimentação
    const movimentacao = await prisma.movimentacaoEstoque.create({
      data: {
        tipo: 'entrada',
        quantidade: Number(quantidade),
        observacao,
        produtoId: Number(produtoId),
        usuarioId: Number(userId),
        empresaId: Number(empresaId)
      },
      include: {
        produto: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
    
    // Atualizar estoque do produto
    await prisma.produto.update({
      where: { id: Number(produtoId) },
      data: {
        estoqueAtual: produto.estoqueAtual + Number(quantidade)
      }
    });
    
    return res.status(201).json(movimentacao);
  } catch (error) {
    console.error('Erro ao registrar entrada:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registrar saída de estoque
router.post('/:empresaId/saida', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    const { produtoId, quantidade, observacao } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true, role: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se o produto existe
    const produto = await prisma.produto.findFirst({
      where: {
        id: Number(produtoId),
        empresaId: Number(empresaId)
      }
    });
    
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Verificar se há estoque suficiente
    if (produto.estoqueAtual < Number(quantidade)) {
      return res.status(400).json({ error: 'Estoque insuficiente' });
    }
    
    // Criar movimentação
    const movimentacao = await prisma.movimentacaoEstoque.create({
      data: {
        tipo: 'saida',
        quantidade: Number(quantidade),
        observacao,
        produtoId: Number(produtoId),
        usuarioId: Number(userId),
        empresaId: Number(empresaId)
      },
      include: {
        produto: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
    
    // Atualizar estoque do produto
    await prisma.produto.update({
      where: { id: Number(produtoId) },
      data: {
        estoqueAtual: produto.estoqueAtual - Number(quantidade)
      }
    });
    
    return res.status(201).json(movimentacao);
  } catch (error) {
    console.error('Erro ao registrar saída:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registrar ajuste de estoque
router.post('/:empresaId/ajuste', authenticateToken, isManager, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    const { produtoId, quantidade, observacao } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se o produto existe
    const produto = await prisma.produto.findFirst({
      where: {
        id: Number(produtoId),
        empresaId: Number(empresaId)
      }
    });
    
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Calcular diferença para o ajuste
    const diferenca = Number(quantidade) - produto.estoqueAtual;
    
    // Criar movimentação
    const movimentacao = await prisma.movimentacaoEstoque.create({
      data: {
        tipo: 'ajuste',
        quantidade: diferenca,
        observacao: observacao || `Ajuste de estoque de ${produto.estoqueAtual} para ${quantidade}`,
        produtoId: Number(produtoId),
        usuarioId: Number(userId),
        empresaId: Number(empresaId)
      },
      include: {
        produto: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
    
    // Atualizar estoque do produto
    await prisma.produto.update({
      where: { id: Number(produtoId) },
      data: {
        estoqueAtual: Number(quantidade)
      }
    });
    
    return res.status(201).json(movimentacao);
  } catch (error) {
    console.error('Erro ao registrar ajuste:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter saldo atual de um produto
router.get('/:empresaId/saldo/:produtoId', authenticateToken, async (req, res) => {
  try {
    const { empresaId, produtoId } = req.params;
    const userId = req.user?.id;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Buscar produto
    const produto = await prisma.produto.findFirst({
      where: {
        id: Number(produtoId),
        empresaId: Number(empresaId)
      }
    });
    
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    return res.json({
      produtoId: produto.id,
      nome: produto.nome,
      codigo: produto.codigo,
      saldo: produto.estoqueAtual,
      estoqueMinimo: produto.estoqueMinimo,
      unidadeMedida: produto.unidadeMedida
    });
  } catch (error) {
    console.error('Erro ao obter saldo:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter produtos com estoque baixo
router.get('/:empresaId/baixo', authenticateToken, async (req, res) => {
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
    
    // Buscar produtos com estoque abaixo do mínimo
    const produtos = await prisma.produto.findMany({
      where: {
        empresaId: Number(empresaId),
        estoqueAtual: { lt: prisma.produto.fields.estoqueMinimo }
      },
      orderBy: [
        {
          estoqueAtual: 'asc'
        },
        {
          nome: 'asc'
        }
      ]
    });
    
    return res.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos com estoque baixo:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
