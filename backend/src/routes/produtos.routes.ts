import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isManager } from '../middlewares/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Obter todos os produtos de uma empresa
router.get('/:empresaId', authenticateToken, async (req, res) => {
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
    
    // Buscar produtos da empresa
    const produtos = await prisma.produto.findMany({
      where: { empresaId: Number(empresaId) },
      orderBy: { nome: 'asc' }
    });
    
    return res.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter um produto específico
router.get('/:empresaId/:id', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
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
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    return res.json(produto);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo produto
router.post('/:empresaId', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    const { 
      codigo, 
      nome, 
      descricao, 
      categoria, 
      precoCusto, 
      precoVenda, 
      estoqueMinimo, 
      estoqueAtual,
      unidadeMedida,
      ativo,
      imagem,
      produtoFinal
    } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true, role: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se já existe produto com o mesmo código
    const produtoExistente = await prisma.produto.findFirst({
      where: {
        codigo,
        empresaId: Number(empresaId)
      }
    });
    
    if (produtoExistente) {
      return res.status(400).json({ error: 'Já existe um produto com este código' });
    }
    
    // Criar produto
    const novoProduto = await prisma.produto.create({
      data: {
        codigo,
        nome,
        descricao,
        categoria,
        precoCusto: Number(precoCusto),
        precoVenda: Number(precoVenda),
        estoqueMinimo: Number(estoqueMinimo),
        estoqueAtual: Number(estoqueAtual),
        unidadeMedida,
        ativo: Boolean(ativo),
        imagem,
        produtoFinal: Boolean(produtoFinal),
        empresaId: Number(empresaId)
      }
    });
    
    return res.status(201).json(novoProduto);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar produto
router.put('/:empresaId/:id', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    const { 
      codigo, 
      nome, 
      descricao, 
      categoria, 
      precoCusto, 
      precoVenda, 
      estoqueMinimo,
      unidadeMedida,
      ativo,
      imagem,
      produtoFinal
    } = req.body;
    
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
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Verificar se já existe outro produto com o mesmo código
    if (codigo && codigo !== produto.codigo) {
      const produtoExistente = await prisma.produto.findFirst({
        where: {
          codigo,
          empresaId: Number(empresaId),
          id: { not: Number(id) }
        }
      });
      
      if (produtoExistente) {
        return res.status(400).json({ error: 'Já existe outro produto com este código' });
      }
    }
    
    // Atualizar produto
    const produtoAtualizado = await prisma.produto.update({
      where: { id: Number(id) },
      data: {
        codigo,
        nome,
        descricao,
        categoria,
        precoCusto: precoCusto !== undefined ? Number(precoCusto) : undefined,
        precoVenda: precoVenda !== undefined ? Number(precoVenda) : undefined,
        estoqueMinimo: estoqueMinimo !== undefined ? Number(estoqueMinimo) : undefined,
        unidadeMedida,
        ativo: ativo !== undefined ? Boolean(ativo) : undefined,
        imagem,
        produtoFinal: produtoFinal !== undefined ? Boolean(produtoFinal) : undefined
      }
    });
    
    return res.json(produtoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir produto
router.delete('/:empresaId/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    
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
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Verificar se há movimentações de estoque relacionadas
    const movimentacoes = await prisma.movimentacaoEstoque.findFirst({
      where: { produtoId: Number(id) }
    });
    
    if (movimentacoes) {
      return res.status(400).json({ 
        error: 'Não é possível excluir o produto pois existem movimentações de estoque relacionadas' 
      });
    }
    
    // Verificar se há vendas relacionadas
    const vendas = await prisma.itemVenda.findFirst({
      where: { produtoId: Number(id) }
    });
    
    if (vendas) {
      return res.status(400).json({ 
        error: 'Não é possível excluir o produto pois existem vendas relacionadas' 
      });
    }
    
    // Excluir produto
    await prisma.produto.delete({
      where: { id: Number(id) }
    });
    
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter componentes de um produto (BOM)
router.get('/:empresaId/:id/componentes', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Buscar componentes do produto
    const componentes = await prisma.componenteProduto.findMany({
      where: { produtoFinalId: Number(id) },
      include: { insumo: true }
    });
    
    return res.json(componentes);
  } catch (error) {
    console.error('Erro ao buscar componentes:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar componente a um produto (BOM)
router.post('/:empresaId/:id/componentes', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    const { insumoId, quantidade } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true, role: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se o produto final existe
    const produtoFinal = await prisma.produto.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!produtoFinal) {
      return res.status(404).json({ error: 'Produto final não encontrado' });
    }
    
    // Verificar se o insumo existe
    const insumo = await prisma.produto.findFirst({
      where: {
        id: Number(insumoId),
        empresaId: Number(empresaId)
      }
    });
    
    if (!insumo) {
      return res.status(404).json({ error: 'Insumo não encontrado' });
    }
    
    // Verificar se já existe este componente
    const componenteExistente = await prisma.componenteProduto.findFirst({
      where: {
        produtoFinalId: Number(id),
        insumoId: Number(insumoId)
      }
    });
    
    if (componenteExistente) {
      return res.status(400).json({ error: 'Este insumo já é um componente deste produto' });
    }
    
    // Criar componente
    const novoComponente = await prisma.componenteProduto.create({
      data: {
        produtoFinalId: Number(id),
        insumoId: Number(insumoId),
        quantidade: Number(quantidade)
      },
      include: { insumo: true }
    });
    
    return res.status(201).json(novoComponente);
  } catch (error) {
    console.error('Erro ao adicionar componente:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Remover componente de um produto (BOM)
router.delete('/componentes/:componenteId', authenticateToken, async (req, res) => {
  try {
    const { componenteId } = req.params;
    const userId = req.user?.id;
    
    // Buscar componente
    const componente = await prisma.componenteProduto.findUnique({
      where: { id: Number(componenteId) },
      include: { produtoFinal: true }
    });
    
    if (!componente) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }
    
    // Verificar se o usuário pertence à empresa do produto
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true, role: true }
    });
    
    if (!usuario || usuario.empresaId !== componente.produtoFinal.empresaId) {
      return res.status(403).json({ error: 'Acesso não autorizado a este componente' });
    }
    
    // Excluir componente
    await prisma.componenteProduto.delete({
      where: { id: Number(componenteId) }
    });
    
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover componente:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
