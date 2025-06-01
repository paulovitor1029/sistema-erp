import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isManager } from '../middlewares/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Obter todas as vendas de uma empresa
router.get('/:empresaId/vendas', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { status, dataInicio, dataFim, clienteId } = req.query;
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
    
    if (status) {
      filtro.status = status;
    }
    
    if (clienteId) {
      filtro.clienteId = Number(clienteId);
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
    
    // Buscar vendas
    const vendas = await prisma.venda.findMany({
      where: filtro,
      include: {
        cliente: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        itens: {
          include: {
            produto: true,
            servico: true
          }
        }
      },
      orderBy: { data: 'desc' }
    });
    
    return res.json(vendas);
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar nova venda
router.post('/:empresaId/iniciar', authenticateToken, async (req, res) => {
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
    
    // Verificar se já existe uma venda aberta para este usuário
    const vendaAberta = await prisma.venda.findFirst({
      where: {
        empresaId: Number(empresaId),
        usuarioId: Number(userId),
        status: 'aberta'
      }
    });
    
    if (vendaAberta) {
      return res.status(400).json({ 
        error: 'Já existe uma venda aberta para este usuário',
        vendaId: vendaAberta.id
      });
    }
    
    // Criar nova venda
    const novaVenda = await prisma.venda.create({
      data: {
        data: new Date(),
        subtotal: 0,
        desconto: 0,
        total: 0,
        formaPagamento: '',
        status: 'aberta',
        usuarioId: Number(userId),
        empresaId: Number(empresaId)
      },
      include: {
        itens: true
      }
    });
    
    return res.status(201).json(novaVenda);
  } catch (error) {
    console.error('Erro ao iniciar venda:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter venda específica
router.get('/:empresaId/venda/:id', authenticateToken, async (req, res) => {
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
    
    // Buscar venda
    const venda = await prisma.venda.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId)
      },
      include: {
        cliente: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        itens: {
          include: {
            produto: true,
            servico: true,
            promocao: true
          }
        }
      }
    });
    
    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    return res.json(venda);
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar item à venda
router.post('/:empresaId/venda/:id/item', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    const { produtoId, servicoId, quantidade, precoUnitario, desconto, promocaoId } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se a venda existe e está aberta
    const venda = await prisma.venda.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId),
        status: 'aberta'
      },
      include: {
        itens: true
      }
    });
    
    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada ou não está aberta' });
    }
    
    // Verificar se produto ou serviço foi informado
    if (!produtoId && !servicoId) {
      return res.status(400).json({ error: 'Produto ou serviço deve ser informado' });
    }
    
    // Verificar se produto existe
    if (produtoId) {
      const produto = await prisma.produto.findFirst({
        where: {
          id: Number(produtoId),
          empresaId: Number(empresaId),
          ativo: true
        }
      });
      
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado ou inativo' });
      }
      
      // Verificar estoque
      if (produto.estoqueAtual < Number(quantidade)) {
        return res.status(400).json({ error: 'Estoque insuficiente' });
      }
    }
    
    // Verificar se serviço existe
    if (servicoId) {
      const servico = await prisma.servico.findFirst({
        where: {
          id: Number(servicoId),
          empresaId: Number(empresaId),
          ativo: true
        }
      });
      
      if (!servico) {
        return res.status(404).json({ error: 'Serviço não encontrado ou inativo' });
      }
    }
    
    // Verificar se promoção existe
    if (promocaoId) {
      const promocao = await prisma.promocao.findFirst({
        where: {
          id: Number(promocaoId),
          empresaId: Number(empresaId),
          ativo: true,
          dataInicio: { lte: new Date() },
          dataFim: { gte: new Date() }
        }
      });
      
      if (!promocao) {
        return res.status(404).json({ error: 'Promoção não encontrada, inativa ou fora do período' });
      }
    }
    
    // Calcular total do item
    const totalItem = (Number(precoUnitario) * Number(quantidade)) - Number(desconto || 0);
    
    // Adicionar item
    const novoItem = await prisma.itemVenda.create({
      data: {
        quantidade: Number(quantidade),
        precoUnitario: Number(precoUnitario),
        desconto: Number(desconto || 0),
        total: totalItem,
        produtoId: produtoId ? Number(produtoId) : undefined,
        servicoId: servicoId ? Number(servicoId) : undefined,
        promocaoId: promocaoId ? Number(promocaoId) : undefined,
        vendaId: Number(id)
      },
      include: {
        produto: true,
        servico: true,
        promocao: true
      }
    });
    
    // Atualizar totais da venda
    const itens = [...venda.itens, novoItem];
    const subtotal = itens.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);
    const descontoItens = itens.reduce((sum, item) => sum + item.desconto, 0);
    const vendaTotal = subtotal - descontoItens - venda.desconto;
    
    const vendaAtualizada = await prisma.venda.update({
      where: { id: Number(id) },
      data: {
        subtotal,
        total: vendaTotal
      },
      include: {
        itens: {
          include: {
            produto: true,
            servico: true,
            promocao: true
          }
        }
      }
    });
    
    // Se for produto, atualizar estoque
    if (produtoId) {
      await prisma.produto.update({
        where: { id: Number(produtoId) },
        data: {
          estoqueAtual: {
            decrement: Number(quantidade)
          }
        }
      });
      
      // Registrar movimentação de estoque
      await prisma.movimentacaoEstoque.create({
        data: {
          tipo: 'saida',
          quantidade: Number(quantidade),
          observacao: `Venda #${id}`,
          produtoId: Number(produtoId),
          usuarioId: Number(userId),
          empresaId: Number(empresaId)
        }
      });
    }
    
    return res.status(201).json({
      item: novoItem,
      venda: vendaAtualizada
    });
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Remover item da venda
router.delete('/:empresaId/venda/:id/item/:itemId', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id, itemId } = req.params;
    const userId = req.user?.id;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se a venda existe e está aberta
    const venda = await prisma.venda.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId),
        status: 'aberta'
      }
    });
    
    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada ou não está aberta' });
    }
    
    // Buscar item
    const item = await prisma.itemVenda.findUnique({
      where: { id: Number(itemId) }
    });
    
    if (!item || item.vendaId !== Number(id)) {
      return res.status(404).json({ error: 'Item não encontrado nesta venda' });
    }
    
    // Se for produto, restaurar estoque
    if (item.produtoId) {
      await prisma.produto.update({
        where: { id: item.produtoId },
        data: {
          estoqueAtual: {
            increment: item.quantidade
          }
        }
      });
      
      // Registrar movimentação de estoque
      await prisma.movimentacaoEstoque.create({
        data: {
          tipo: 'entrada',
          quantidade: item.quantidade,
          observacao: `Cancelamento de item da venda #${id}`,
          produtoId: item.produtoId,
          usuarioId: Number(userId),
          empresaId: Number(empresaId)
        }
      });
    }
    
    // Remover item
    await prisma.itemVenda.delete({
      where: { id: Number(itemId) }
    });
    
    // Atualizar totais da venda
    const itensRestantes = await prisma.itemVenda.findMany({
      where: { vendaId: Number(id) }
    });
    
    const subtotal = itensRestantes.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);
    const descontoItens = itensRestantes.reduce((sum, item) => sum + item.desconto, 0);
    const vendaTotal = subtotal - descontoItens - venda.desconto;
    
    await prisma.venda.update({
      where: { id: Number(id) },
      data: {
        subtotal,
        total: vendaTotal
      }
    });
    
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover item:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar quantidade de um item
router.put('/:empresaId/venda/:id/item/:itemId', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id, itemId } = req.params;
    const userId = req.user?.id;
    const { quantidade } = req.body;
    
    if (Number(quantidade) <= 0) {
      return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
    }
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se a venda existe e está aberta
    const venda = await prisma.venda.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId),
        status: 'aberta'
      }
    });
    
    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada ou não está aberta' });
    }
    
    // Buscar item
    const item = await prisma.itemVenda.findUnique({
      where: { id: Number(itemId) }
    });
    
    if (!item || item.vendaId !== Number(id)) {
      return res.status(404).json({ error: 'Item não encontrado nesta venda' });
    }
    
    // Se for produto, verificar estoque
    if (item.produtoId) {
      const produto = await prisma.produto.findUnique({
        where: { id: item.produtoId }
      });
      
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      const diferencaQuantidade = Number(quantidade) - item.quantidade;
      
      if (diferencaQuantidade > 0 && produto.estoqueAtual < diferencaQuantidade) {
        return res.status(400).json({ error: 'Estoque insuficiente' });
      }
      
      // Atualizar estoque
      await prisma.produto.update({
        where: { id: item.produtoId },
        data: {
          estoqueAtual: {
            decrement: diferencaQuantidade
          }
        }
      });
      
      // Registrar movimentação de estoque
      if (diferencaQuantidade !== 0) {
        await prisma.movimentacaoEstoque.create({
          data: {
            tipo: diferencaQuantidade > 0 ? 'saida' : 'entrada',
            quantidade: Math.abs(diferencaQuantidade),
            observacao: `Ajuste de quantidade na venda #${id}`,
            produtoId: item.produtoId,
            usuarioId: Number(userId),
            empresaId: Number(empresaId)
          }
        });
      }
    }
    
    // Calcular novo total do item
    const itemTotal = (item.precoUnitario * Number(quantidade)) - item.desconto;
    
    // Atualizar item
    await prisma.itemVenda.update({
      where: { id: Number(itemId) },
      data: {
        quantidade: Number(quantidade),
        total: itemTotal
      }
    });
    
    // Atualizar totais da venda
    const itens = await prisma.itemVenda.findMany({
      where: { vendaId: Number(id) }
    });
    
    const subtotal = itens.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);
    const descontoItens = itens.reduce((sum, item) => sum + item.desconto, 0);
    const vendaTotal = subtotal - descontoItens - venda.desconto;
    
    await prisma.venda.update({
      where: { id: Number(id) },
      data: {
        subtotal,
        total: vendaTotal
      }
    });
    
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao atualizar quantidade:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Aplicar desconto geral na venda
router.put('/:empresaId/venda/:id/desconto', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    const { desconto } = req.body;
    
    if (Number(desconto) < 0) {
      return res.status(400).json({ error: 'Desconto não pode ser negativo' });
    }
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true, role: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se a venda existe e está aberta
    const venda = await prisma.venda.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId),
        status: 'aberta'
      },
      include: {
        itens: true
      }
    });
    
    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada ou não está aberta' });
    }
    
    // Verificar limite de desconto conforme perfil
    const limiteDesconto = usuario.role === 'admin' ? 100 : 
                          usuario.role === 'manager' ? 30 : 10;
    
    const subtotal = venda.subtotal;
    const percentualDesconto = (Number(desconto) / subtotal) * 100;
    
    if (percentualDesconto > limiteDesconto) {
      return res.status(403).json({ 
        error: `Seu perfil permite desconto máximo de ${limiteDesconto}%` 
      });
    }
    
    // Calcular novo total
    const descontoItens = venda.itens.reduce((sum, item) => sum + item.desconto, 0);
    const vendaTotal = subtotal - descontoItens - Number(desconto);
    
    // Atualizar venda
    const vendaAtualizada = await prisma.venda.update({
      where: { id: Number(id) },
      data: {
        desconto: Number(desconto),
        total: vendaTotal
      },
      include: {
        itens: true,
        cliente: true
      }
    });
    
    return res.json(vendaAtualizada);
  } catch (error) {
    console.error('Erro ao aplicar desconto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Finalizar venda
router.put('/:empresaId/venda/:id/finalizar', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    const { clienteId, formaPagamento, observacao } = req.body;
    
    if (!formaPagamento) {
      return res.status(400).json({ error: 'Forma de pagamento é obrigatória' });
    }
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se a venda existe e está aberta
    const venda = await prisma.venda.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId),
        status: 'aberta'
      },
      include: {
        itens: true
      }
    });
    
    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada ou não está aberta' });
    }
    
    if (venda.itens.length === 0) {
      return res.status(400).json({ error: 'Venda não possui itens' });
    }
    
    // Verificar se cliente existe
    if (clienteId) {
      const cliente = await prisma.cliente.findFirst({
        where: {
          id: Number(clienteId),
          empresaId: Number(empresaId)
        }
      });
      
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
    }
    
    // Finalizar venda
    const vendaFinalizada = await prisma.venda.update({
      where: { id: Number(id) },
      data: {
        clienteId: clienteId ? Number(clienteId) : undefined,
        formaPagamento,
        observacao,
        status: 'finalizada',
        dataFinalizacao: new Date()
      },
      include: {
        itens: {
          include: {
            produto: true,
            servico: true
          }
        },
        cliente: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
    
    // Registrar movimentação financeira
    await prisma.movimentacaoFinanceira.create({
      data: {
        tipo: 'receita',
        valor: vendaFinalizada.total,
        data: new Date(),
        descricao: `Venda #${id}`,
        formaPagamento,
        status: 'confirmado',
        vendaId: Number(id),
        usuarioId: Number(userId),
        empresaId: Number(empresaId)
      }
    });
    
    return res.json(vendaFinalizada);
  } catch (error) {
    console.error('Erro ao finalizar venda:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cancelar venda
router.put('/:empresaId/venda/:id/cancelar', authenticateToken, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    const { motivo } = req.body;
    
    if (!motivo) {
      return res.status(400).json({ error: 'Motivo do cancelamento é obrigatório' });
    }
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true, role: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Apenas admin e gerentes podem cancelar vendas finalizadas
    const venda = await prisma.venda.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId)
      },
      include: {
        itens: {
          include: {
            produto: true
          }
        }
      }
    });
    
    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    if (venda.status === 'finalizada' && usuario.role !== 'admin' && usuario.role !== 'manager') {
      return res.status(403).json({ error: 'Apenas administradores e gerentes podem cancelar vendas finalizadas' });
    }
    
    // Restaurar estoque dos produtos
    for (const item of venda.itens) {
      if (item.produtoId) {
        await prisma.produto.update({
          where: { id: item.produtoId },
          data: {
            estoqueAtual: {
              increment: item.quantidade
            }
          }
        });
        
        // Registrar movimentação de estoque
        await prisma.movimentacaoEstoque.create({
          data: {
            tipo: 'entrada',
            quantidade: item.quantidade,
            observacao: `Cancelamento da venda #${id}`,
            produtoId: item.produtoId,
            usuarioId: Number(userId),
            empresaId: Number(empresaId)
          }
        });
      }
    }
    
    // Cancelar venda
    const vendaCancelada = await prisma.venda.update({
      where: { id: Number(id) },
      data: {
        status: 'cancelada',
        observacao: `Cancelada: ${motivo}`,
        dataCancelamento: new Date()
      }
    });
    
    // Se havia movimentação financeira, cancelar
    const movimentacao = await prisma.movimentacaoFinanceira.findFirst({
      where: {
        vendaId: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (movimentacao) {
      await prisma.movimentacaoFinanceira.update({
        where: { id: movimentacao.id },
        data: {
          status: 'cancelado',
          observacao: `Cancelada: ${motivo}`
        }
      });
    }
    
    return res.json(vendaCancelada);
  } catch (error) {
    console.error('Erro ao cancelar venda:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
