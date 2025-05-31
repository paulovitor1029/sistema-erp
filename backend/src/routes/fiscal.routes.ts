import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isManager } from '../middlewares/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Obter configuração fiscal da empresa
router.get('/:empresaId/configuracao', authenticateToken, async (req, res) => {
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
    
    // Buscar configuração fiscal
    const configuracao = await prisma.configuracaoFiscal.findFirst({
      where: { empresaId: Number(empresaId) }
    });
    
    if (!configuracao) {
      return res.status(404).json({ error: 'Configuração fiscal não encontrada' });
    }
    
    // Remover dados sensíveis
    const { senhaCertificado, ...configSemSenha } = configuracao;
    
    return res.json(configSemSenha);
  } catch (error) {
    console.error('Erro ao buscar configuração fiscal:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Salvar configuração fiscal
router.post('/:empresaId/configuracao', authenticateToken, isManager, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    const { 
      razaoSocial, 
      nomeFantasia, 
      cnpj, 
      inscricaoEstadual, 
      inscricaoMunicipal, 
      regimeTributario, 
      ambiente, 
      certificadoDigital, 
      senhaCertificado, 
      validadeCertificado, 
      serieNFe, 
      serieNFCe, 
      proximoNumeroNFe, 
      proximoNumeroNFCe, 
      proximoNumeroNFSe, 
      csc, 
      idCsc, 
      tokenIBPT, 
      ativo 
    } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se já existe configuração
    const configuracaoExistente = await prisma.configuracaoFiscal.findFirst({
      where: { empresaId: Number(empresaId) }
    });
    
    let configuracao;
    
    if (configuracaoExistente) {
      // Atualizar configuração existente
      configuracao = await prisma.configuracaoFiscal.update({
        where: { id: configuracaoExistente.id },
        data: {
          razaoSocial,
          nomeFantasia,
          cnpj,
          inscricaoEstadual,
          inscricaoMunicipal,
          regimeTributario,
          ambiente,
          certificadoDigital,
          senhaCertificado,
          validadeCertificado,
          serieNFe,
          serieNFCe,
          proximoNumeroNFe: Number(proximoNumeroNFe),
          proximoNumeroNFCe: Number(proximoNumeroNFCe),
          proximoNumeroNFSe: Number(proximoNumeroNFSe),
          csc,
          idCsc,
          tokenIBPT,
          ativo: Boolean(ativo)
        }
      });
    } else {
      // Criar nova configuração
      configuracao = await prisma.configuracaoFiscal.create({
        data: {
          razaoSocial,
          nomeFantasia,
          cnpj,
          inscricaoEstadual,
          inscricaoMunicipal,
          regimeTributario,
          ambiente,
          certificadoDigital,
          senhaCertificado,
          validadeCertificado,
          serieNFe,
          serieNFCe,
          proximoNumeroNFe: Number(proximoNumeroNFe),
          proximoNumeroNFCe: Number(proximoNumeroNFCe),
          proximoNumeroNFSe: Number(proximoNumeroNFSe),
          csc,
          idCsc,
          tokenIBPT,
          ativo: Boolean(ativo),
          empresaId: Number(empresaId)
        }
      });
    }
    
    // Remover dados sensíveis
    const { senhaCertificado: senha, ...configSemSenha } = configuracao;
    
    return res.status(configuracaoExistente ? 200 : 201).json(configSemSenha);
  } catch (error) {
    console.error('Erro ao salvar configuração fiscal:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter todas as notas fiscais de uma empresa
router.get('/:empresaId/notas', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { tipo, modelo, status, dataInicio, dataFim, clienteId, fornecedorId } = req.query;
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
    
    if (modelo) {
      filtro.modelo = modelo;
    }
    
    if (status) {
      filtro.status = status;
    }
    
    if (clienteId) {
      filtro.clienteId = Number(clienteId);
    }
    
    if (fornecedorId) {
      filtro.fornecedorId = Number(fornecedorId);
    }
    
    if (dataInicio || dataFim) {
      filtro.dataEmissao = {};
      
      if (dataInicio) {
        filtro.dataEmissao.gte = new Date(dataInicio as string);
      }
      
      if (dataFim) {
        filtro.dataEmissao.lte = new Date(dataFim as string);
      }
    }
    
    // Buscar notas fiscais
    const notas = await prisma.notaFiscal.findMany({
      where: filtro,
      include: {
        cliente: true,
        fornecedor: true,
        venda: true
      },
      orderBy: { dataEmissao: 'desc' }
    });
    
    return res.json(notas);
  } catch (error) {
    console.error('Erro ao buscar notas fiscais:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Emitir nota fiscal de venda
router.post('/:empresaId/emitir/venda/:vendaId', authenticateToken, async (req, res) => {
  try {
    const { empresaId, vendaId } = req.params;
    const userId = req.user?.id;
    const { observacao } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se a venda existe e está finalizada
    const venda = await prisma.venda.findFirst({
      where: {
        id: Number(vendaId),
        empresaId: Number(empresaId),
        status: 'finalizada'
      },
      include: {
        cliente: true,
        itens: {
          include: {
            produto: true,
            servico: true
          }
        }
      }
    });
    
    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada ou não está finalizada' });
    }
    
    // Verificar se já existe nota fiscal para esta venda
    const notaExistente = await prisma.notaFiscal.findFirst({
      where: {
        vendaId: Number(vendaId),
        status: { not: 'cancelada' }
      }
    });
    
    if (notaExistente) {
      return res.status(400).json({ error: 'Já existe uma nota fiscal emitida para esta venda' });
    }
    
    // Verificar se há configuração fiscal
    const configuracao = await prisma.configuracaoFiscal.findFirst({
      where: {
        empresaId: Number(empresaId),
        ativo: true
      }
    });
    
    if (!configuracao) {
      return res.status(400).json({ error: 'Configuração fiscal não encontrada ou inativa' });
    }
    
    // Determinar modelo da nota
    let modelo = 'nfe';
    let serie = configuracao.serieNFe;
    let proximoNumero = configuracao.proximoNumeroNFe;
    
    // Criar nota fiscal
    const novaNota = await prisma.notaFiscal.create({
      data: {
        tipo: 'saida',
        modelo,
        numero: proximoNumero.toString().padStart(9, '0'),
        serie,
        dataEmissao: new Date(),
        valor: venda.total,
        status: 'rascunho',
        observacao,
        vendaId: Number(vendaId),
        clienteId: venda.clienteId,
        usuarioId: Number(userId),
        empresaId: Number(empresaId)
      },
      include: {
        cliente: true,
        venda: true
      }
    });
    
    // Atualizar próximo número na configuração
    await prisma.configuracaoFiscal.update({
      where: { id: configuracao.id },
      data: {
        proximoNumeroNFe: {
          increment: 1
        }
      }
    });
    
    // Aqui seria implementada a integração com o serviço de emissão de NF-e
    // Por enquanto, apenas simulamos a emissão
    
    return res.status(201).json(novaNota);
  } catch (error) {
    console.error('Erro ao emitir nota fiscal:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registrar nota fiscal de entrada
router.post('/:empresaId/entrada', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    const { 
      fornecedorId, 
      valor, 
      dataEmissao, 
      numero, 
      serie, 
      chave, 
      observacao 
    } = req.body;
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se o fornecedor existe
    const fornecedor = await prisma.fornecedor.findFirst({
      where: {
        id: Number(fornecedorId),
        empresaId: Number(empresaId),
        ativo: true
      }
    });
    
    if (!fornecedor) {
      return res.status(404).json({ error: 'Fornecedor não encontrado ou inativo' });
    }
    
    // Verificar se já existe nota fiscal com a mesma chave
    if (chave) {
      const notaExistente = await prisma.notaFiscal.findFirst({
        where: {
          chave,
          empresaId: Number(empresaId)
        }
      });
      
      if (notaExistente) {
        return res.status(400).json({ error: 'Já existe uma nota fiscal com esta chave' });
      }
    }
    
    // Criar nota fiscal
    const novaNota = await prisma.notaFiscal.create({
      data: {
        tipo: 'entrada',
        modelo: 'nfe',
        numero,
        serie,
        chave,
        dataEmissao: new Date(dataEmissao),
        dataAutorizacao: new Date(dataEmissao),
        valor: Number(valor),
        status: 'autorizada',
        observacao,
        fornecedorId: Number(fornecedorId),
        usuarioId: Number(userId),
        empresaId: Number(empresaId)
      },
      include: {
        fornecedor: true
      }
    });
    
    return res.status(201).json(novaNota);
  } catch (error) {
    console.error('Erro ao registrar nota fiscal de entrada:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cancelar nota fiscal
router.post('/:empresaId/notas/:id/cancelar', authenticateToken, isManager, async (req, res) => {
  try {
    const { empresaId, id } = req.params;
    const userId = req.user?.id;
    const { justificativa } = req.body;
    
    if (!justificativa) {
      return res.status(400).json({ error: 'Justificativa é obrigatória para cancelamento' });
    }
    
    // Verificar se o usuário pertence à empresa
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
    }
    
    // Verificar se a nota existe
    const nota = await prisma.notaFiscal.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!nota) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }
    
    // Verificar se a nota pode ser cancelada
    if (nota.status === 'cancelada') {
      return res.status(400).json({ error: 'Nota fiscal já está cancelada' });
    }
    
    if (nota.status !== 'autorizada' && nota.status !== 'emitida') {
      return res.status(400).json({ error: 'Apenas notas autorizadas ou emitidas podem ser canceladas' });
    }
    
    // Aqui seria implementada a integração com o serviço de cancelamento de NF-e
    // Por enquanto, apenas simulamos o cancelamento
    
    // Atualizar nota
    const notaAtualizada = await prisma.notaFiscal.update({
      where: { id: Number(id) },
      data: {
        status: 'cancelada',
        observacao: `${nota.observacao || ''} | Cancelada: ${justificativa}`
      }
    });
    
    return res.json(notaAtualizada);
  } catch (error) {
    console.error('Erro ao cancelar nota fiscal:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter XML da nota fiscal
router.get('/:empresaId/notas/:id/xml', authenticateToken, async (req, res) => {
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
    
    // Verificar se a nota existe
    const nota = await prisma.notaFiscal.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!nota) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }
    
    if (!nota.xml) {
      return res.status(404).json({ error: 'XML não disponível para esta nota fiscal' });
    }
    
    return res.send(nota.xml);
  } catch (error) {
    console.error('Erro ao obter XML da nota fiscal:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter DANFE da nota fiscal
router.get('/:empresaId/notas/:id/danfe', authenticateToken, async (req, res) => {
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
    
    // Verificar se a nota existe
    const nota = await prisma.notaFiscal.findFirst({
      where: {
        id: Number(id),
        empresaId: Number(empresaId)
      }
    });
    
    if (!nota) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }
    
    if (!nota.pdf) {
      return res.status(404).json({ error: 'DANFE não disponível para esta nota fiscal' });
    }
    
    // Aqui seria implementada a geração do DANFE
    // Por enquanto, apenas simulamos o retorno
    
    return res.json({ url: `/api/fiscal/${empresaId}/notas/${id}/pdf` });
  } catch (error) {
    console.error('Erro ao obter DANFE da nota fiscal:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
