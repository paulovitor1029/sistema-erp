import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isManager } from '../middlewares/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Obter todos os serviços de uma empresa
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
    
    // Buscar serviços da empresa
    const servicos = await prisma.servico.findMany({
      where: { empresaId: Number(empresaId) },
      orderBy: { nome: 'asc' }
    });
    
    return res.json(servicos);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter um serviço específico
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
    
    // Buscar serviço
    const servico = await prisma.servico.findFirst({
      where: { 
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    return res.json(servico);
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo serviço
router.post('/:empresaId', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    const { 
      codigo, 
      nome, 
      descricao, 
      categoria, 
      precoBase, 
      precoPorHora, 
      tempoEstimado,
      ativo
    } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true, role: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se já existe serviço com o mesmo código
    const servicoExistente = await prisma.servico.findFirst({
      where: {
        codigo,
        empresaId: Number(empresaId)
      }
    });
    
    if (servicoExistente) {
      return res.status(400).json({ error: 'Já existe um serviço com este código' });
    }
    
    // Criar serviço
    const novoServico = await prisma.servico.create({
      data: {
        codigo,
        nome,
        descricao,
        categoria,
        precoBase: Number(precoBase),
        precoPorHora: Boolean(precoPorHora),
        tempoEstimado: tempoEstimado ? Number(tempoEstimado) : null,
        ativo: Boolean(ativo),
        empresaId: Number(empresaId)
      }
    });
    
    return res.status(201).json(novoServico);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar serviço
router.put('/:empresaId/:id', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    const { 
      codigo, 
      nome, 
      descricao, 
      categoria, 
      precoBase, 
      precoPorHora, 
      tempoEstimado,
      ativo
    } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true, role: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se o serviço existe
    const servico = await prisma.servico.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    // Verificar se já existe outro serviço com o mesmo código
    if (codigo && codigo !== servico.codigo) {
      const servicoExistente = await prisma.servico.findFirst({
        where: {
          codigo,
          empresaId: Number(empresaId),
          id: { not: Number(id) }
        }
      });
      
      if (servicoExistente) {
        return res.status(400).json({ error: 'Já existe outro serviço com este código' });
      }
    }
    
    // Atualizar serviço
    const servicoAtualizado = await prisma.servico.update({
      where: { id: Number(id) },
      data: {
        codigo,
        nome,
        descricao,
        categoria,
        precoBase: precoBase !== undefined ? Number(precoBase) : undefined,
        precoPorHora: precoPorHora !== undefined ? Boolean(precoPorHora) : undefined,
        tempoEstimado: tempoEstimado !== undefined ? Number(tempoEstimado) : null,
        ativo: ativo !== undefined ? Boolean(ativo) : undefined
      }
    });
    
    return res.json(servicoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir serviço
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
    
    // Verificar se o serviço existe
    const servico = await prisma.servico.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    // Verificar se há vendas relacionadas
    const vendas = await prisma.itemVenda.findFirst({
      where: { servicoId: Number(id) }
    });
    
    if (vendas) {
      return res.status(400).json({ 
        error: 'Não é possível excluir o serviço pois existem vendas relacionadas' 
      });
    }
    
    // Excluir serviço
    await prisma.servico.delete({
      where: { id: Number(id) }
    });
    
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
