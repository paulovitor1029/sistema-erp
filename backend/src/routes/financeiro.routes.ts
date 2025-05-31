import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isManager } from '../middlewares/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Obter todas as contas bancárias de uma empresa
router.get('/:empresaId/contas', authenticateToken, async (req, res) => {
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
    
    // Buscar contas da empresa
    const contas = await prisma.contaBancaria.findMany({
      where: { empresaId: Number(empresaId) },
      orderBy: { nome: 'asc' }
    });
    
    return res.json(contas);
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter todas as movimentações financeiras de uma empresa
router.get('/:empresaId/movimentacoes', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { tipo, status, dataInicio, dataFim, contaId } = req.query;
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
    
    if (tipo) {
      filtro.tipo = tipo;
    }
    
    if (status) {
      filtro.status = status;
    }
    
    if (contaId) {
      filtro.contaId = Number(contaId);
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
    const movimentacoes = await prisma.movimentacaoFinanceira.findMany({
      where: filtro,
      include: {
        conta: true,
        venda: true,
        fornecedor: true,
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

// Adicionar conta bancária
router.post('/:empresaId/contas', authenticateToken, isManager, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    const { nome, tipo, banco, agencia, conta, saldoInicial, ativo } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Criar conta bancária
    const novaConta = await prisma.contaBancaria.create({
      data: {
        nome,
        tipo,
        banco,
        agencia,
        conta,
        saldoInicial: Number(saldoInicial),
        saldoAtual: Number(saldoInicial),
        ativo: Boolean(ativo),
        empresaId: Number(empresaId)
      }
    });
    
    return res.status(201).json(novaConta);
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar conta bancária
router.put('/:empresaId/contas/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    const { nome, tipo, banco, agencia, conta, ativo } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se a conta existe
    const contaExistente = await prisma.contaBancaria.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!contaExistente) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    
    // Atualizar conta
    const contaAtualizada = await prisma.contaBancaria.update({
      where: { id: Number(id) },
      data: {
        nome,
        tipo,
        banco,
        agencia,
        conta,
        ativo: ativo !== undefined ? Boolean(ativo) : undefined
      }
    });
    
    return res.json(contaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir conta bancária
router.delete('/:empresaId/contas/:id', authenticateToken, isManager, async (req, res) => {
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
    
    // Verificar se a conta existe
    const conta = await prisma.contaBancaria.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!conta) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    
    // Verificar se há movimentações relacionadas
    const movimentacoes = await prisma.movimentacaoFinanceira.findFirst({
      where: { contaId: Number(id) }
    });
    
    if (movimentacoes) {
      return res.status(400).json({ 
        error: 'Não é possível excluir a conta pois existem movimentações relacionadas' 
      });
    }
    
    // Excluir conta
    await prisma.contaBancaria.delete({
      where: { id: Number(id) }
    });
    
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registrar receita
router.post('/:empresaId/receitas', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    const { 
      contaId, 
      valor, 
      categoria, 
      descricao, 
      data, 
      dataPagamento, 
      formaPagamento, 
      observacao, 
      comprovante, 
      vendaId 
    } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se a conta existe
    const conta = await prisma.contaBancaria.findFirst({
      where: {
        id: Number(contaId),
        empresaId: Number(empresaId),
        ativo: true
      }
    });
    
    if (!conta) {
      return res.status(404).json({ error: 'Conta não encontrada ou inativa' });
    }
    
    // Criar movimentação
    const novaReceita = await prisma.movimentacaoFinanceira.create({
      data: {
        tipo: 'receita',
        categoria,
        valor: Number(valor),
        data: new Date(data),
        dataPagamento: dataPagamento ? new Date(dataPagamento) : undefined,
        status: dataPagamento ? 'pago' : 'pendente',
        formaPagamento,
        descricao,
        observacao,
        comprovante,
        contaId: Number(contaId),
        vendaId: vendaId ? Number(vendaId) : undefined,
        usuarioId: Number(userId),
        empresaId: Number(empresaId)
      },
      include: {
        conta: true,
        venda: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
    
    // Se já foi paga, atualizar saldo da conta
    if (dataPagamento) {
      await prisma.contaBancaria.update({
        where: { id: Number(contaId) },
        data: {
          saldoAtual: {
            increment: Number(valor)
          }
        }
      });
    }
    
    return res.status(201).json(novaReceita);
  } catch (error) {
    console.error('Erro ao registrar receita:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registrar despesa
router.post('/:empresaId/despesas', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    const { 
      contaId, 
      valor, 
      categoria, 
      descricao, 
      data, 
      dataVencimento, 
      dataPagamento, 
      formaPagamento, 
      observacao, 
      comprovante, 
      fornecedorId 
    } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se a conta existe
    const conta = await prisma.contaBancaria.findFirst({
      where: {
        id: Number(contaId),
        empresaId: Number(empresaId),
        ativo: true
      }
    });
    
    if (!conta) {
      return res.status(404).json({ error: 'Conta não encontrada ou inativa' });
    }
    
    // Se já foi paga, verificar se há saldo suficiente
    if (dataPagamento && conta.saldoAtual < Number(valor)) {
      return res.status(400).json({ error: 'Saldo insuficiente na conta' });
    }
    
    // Criar movimentação
    const novaDespesa = await prisma.movimentacaoFinanceira.create({
      data: {
        tipo: 'despesa',
        categoria,
        valor: Number(valor),
        data: new Date(data),
        dataVencimento: dataVencimento ? new Date(dataVencimento) : undefined,
        dataPagamento: dataPagamento ? new Date(dataPagamento) : undefined,
        status: dataPagamento ? 'pago' : 'pendente',
        formaPagamento,
        descricao,
        observacao,
        comprovante,
        contaId: Number(contaId),
        fornecedorId: fornecedorId ? Number(fornecedorId) : undefined,
        usuarioId: Number(userId),
        empresaId: Number(empresaId)
      },
      include: {
        conta: true,
        fornecedor: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
    
    // Se já foi paga, atualizar saldo da conta
    if (dataPagamento) {
      await prisma.contaBancaria.update({
        where: { id: Number(contaId) },
        data: {
          saldoAtual: {
            decrement: Number(valor)
          }
        }
      });
    }
    
    return res.status(201).json(novaDespesa);
  } catch (error) {
    console.error('Erro ao registrar despesa:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registrar transferência entre contas
router.post('/:empresaId/transferencias', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    const { contaOrigemId, contaDestinoId, valor, data, descricao, observacao } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se as contas existem
    const contaOrigem = await prisma.contaBancaria.findFirst({
      where: {
        id: Number(contaOrigemId),
        empresaId: Number(empresaId),
        ativo: true
      }
    });
    
    if (!contaOrigem) {
      return res.status(404).json({ error: 'Conta de origem não encontrada ou inativa' });
    }
    
    const contaDestino = await prisma.contaBancaria.findFirst({
      where: {
        id: Number(contaDestinoId),
        empresaId: Number(empresaId),
        ativo: true
      }
    });
    
    if (!contaDestino) {
      return res.status(404).json({ error: 'Conta de destino não encontrada ou inativa' });
    }
    
    // Verificar se há saldo suficiente
    if (contaOrigem.saldoAtual < Number(valor)) {
      return res.status(400).json({ error: 'Saldo insuficiente na conta de origem' });
    }
    
    // Criar movimentação de saída
    const transferencia = await prisma.movimentacaoFinanceira.create({
      data: {
        tipo: 'transferencia',
        categoria: 'Transferência entre contas',
        valor: Number(valor),
        data: new Date(data),
        dataPagamento: new Date(data),
        status: 'pago',
        descricao,
        observacao,
        contaId: Number(contaOrigemId),
        usuarioId: Number(userId),
        empresaId: Number(empresaId)
      },
      include: {
        conta: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
    
    // Atualizar saldos das contas
    await prisma.contaBancaria.update({
      where: { id: Number(contaOrigemId) },
      data: {
        saldoAtual: {
          decrement: Number(valor)
        }
      }
    });
    
    await prisma.contaBancaria.update({
      where: { id: Number(contaDestinoId) },
      data: {
        saldoAtual: {
          increment: Number(valor)
        }
      }
    });
    
    return res.status(201).json(transferencia);
  } catch (error) {
    console.error('Erro ao registrar transferência:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Confirmar pagamento de uma movimentação pendente
router.put('/:empresaId/movimentacoes/:id/pagar', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    const { dataPagamento, formaPagamento, comprovante } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se a movimentação existe
    const movimentacao = await prisma.movimentacaoFinanceira.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId),
        status: 'pendente'
      },
      include: {
        conta: true
      }
    });
    
    if (!movimentacao) {
      return res.status(404).json({ error: 'Movimentação não encontrada ou não está pendente' });
    }
    
    // Se for despesa, verificar se há saldo suficiente
    if (movimentacao.tipo === 'despesa' && movimentacao.conta.saldoAtual < movimentacao.valor) {
      return res.status(400).json({ error: 'Saldo insuficiente na conta' });
    }
    
    // Atualizar movimentação
    const movimentacaoAtualizada = await prisma.movimentacaoFinanceira.update({
      where: { id: Number(id) },
      data: {
        dataPagamento: new Date(dataPagamento),
        formaPagamento,
        comprovante,
        status: 'pago'
      }
    });
    
    // Atualizar saldo da conta
    if (movimentacao.tipo === 'receita') {
      await prisma.contaBancaria.update({
        where: { id: movimentacao.contaId },
        data: {
          saldoAtual: {
            increment: movimentacao.valor
          }
        }
      });
    } else if (movimentacao.tipo === 'despesa') {
      await prisma.contaBancaria.update({
        where: { id: movimentacao.contaId },
        data: {
          saldoAtual: {
            decrement: movimentacao.valor
          }
        }
      });
    }
    
    return res.json(movimentacaoAtualizada);
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cancelar uma movimentação
router.put('/:empresaId/movimentacoes/:id/cancelar', authenticateToken, isManager, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    const { motivo } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se a movimentação existe
    const movimentacao = await prisma.movimentacaoFinanceira.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!movimentacao) {
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }
    
    // Se a movimentação já foi paga, restaurar o saldo da conta
    if (movimentacao.status === 'pago') {
      if (movimentacao.tipo === 'receita') {
        await prisma.contaBancaria.update({
          where: { id: movimentacao.contaId },
          data: {
            saldoAtual: {
              decrement: movimentacao.valor
            }
          }
        });
      } else if (movimentacao.tipo === 'despesa') {
        await prisma.contaBancaria.update({
          where: { id: movimentacao.contaId },
          data: {
            saldoAtual: {
              increment: movimentacao.valor
            }
          }
        });
      }
    }
    
    // Atualizar movimentação
    const movimentacaoAtualizada = await prisma.movimentacaoFinanceira.update({
      where: { id: Number(id) },
      data: {
        status: 'cancelado',
        observacao: motivo ? `${movimentacao.observacao || ''} | Cancelado: ${motivo}` : movimentacao.observacao
      }
    });
    
    return res.json(movimentacaoAtualizada);
  } catch (error) {
    console.error('Erro ao cancelar movimentação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
