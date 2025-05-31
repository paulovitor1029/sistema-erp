import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isManager } from '../middlewares/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Obter todos os clientes de uma empresa
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
    
    // Buscar clientes da empresa
    const clientes = await prisma.cliente.findMany({
      where: { empresaId: Number(empresaId) },
      orderBy: { nome: 'asc' }
    });
    
    return res.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter um cliente específico
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
    
    // Buscar cliente
    const cliente = await prisma.cliente.findFirst({
      where: { 
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    return res.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo cliente
router.post('/:empresaId', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    const { 
      nome, 
      tipo, 
      cpfCnpj, 
      email, 
      telefone, 
      celular, 
      endereco, 
      cidade, 
      estado, 
      cep, 
      observacoes,
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
    
    // Verificar se já existe cliente com o mesmo CPF/CNPJ
    const clienteExistente = await prisma.cliente.findFirst({
      where: {
        cpfCnpj,
        empresaId: Number(empresaId)
      }
    });
    
    if (clienteExistente) {
      return res.status(400).json({ error: 'Já existe um cliente com este CPF/CNPJ' });
    }
    
    // Criar cliente
    const novoCliente = await prisma.cliente.create({
      data: {
        nome,
        tipo,
        cpfCnpj,
        email,
        telefone,
        celular,
        endereco,
        cidade,
        estado,
        cep,
        observacoes,
        ativo: Boolean(ativo),
        valorTotalCompras: 0,
        pontosFidelidade: 0,
        empresaId: Number(empresaId)
      }
    });
    
    return res.status(201).json(novoCliente);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar cliente
router.put('/:empresaId/:id', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    const { 
      nome, 
      tipo, 
      cpfCnpj, 
      email, 
      telefone, 
      celular, 
      endereco, 
      cidade, 
      estado, 
      cep, 
      observacoes,
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
    
    // Verificar se o cliente existe
    const cliente = await prisma.cliente.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Verificar se já existe outro cliente com o mesmo CPF/CNPJ
    if (cpfCnpj && cpfCnpj !== cliente.cpfCnpj) {
      const clienteExistente = await prisma.cliente.findFirst({
        where: {
          cpfCnpj,
          empresaId: Number(empresaId),
          id: { not: Number(id) }
        }
      });
      
      if (clienteExistente) {
        return res.status(400).json({ error: 'Já existe outro cliente com este CPF/CNPJ' });
      }
    }
    
    // Atualizar cliente
    const clienteAtualizado = await prisma.cliente.update({
      where: { id: Number(id) },
      data: {
        nome,
        tipo,
        cpfCnpj,
        email,
        telefone,
        celular,
        endereco,
        cidade,
        estado,
        cep,
        observacoes,
        ativo: ativo !== undefined ? Boolean(ativo) : undefined
      }
    });
    
    return res.json(clienteAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir cliente
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
    
    // Verificar se o cliente existe
    const cliente = await prisma.cliente.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Verificar se há vendas relacionadas
    const vendas = await prisma.venda.findFirst({
      where: { clienteId: Number(id) }
    });
    
    if (vendas) {
      return res.status(400).json({ 
        error: 'Não é possível excluir o cliente pois existem vendas relacionadas' 
      });
    }
    
    // Excluir cliente
    await prisma.cliente.delete({
      where: { id: Number(id) }
    });
    
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
