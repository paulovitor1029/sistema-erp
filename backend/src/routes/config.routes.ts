import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Obter configurações da empresa
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
    
    // Buscar configurações da empresa
    const empresa = await prisma.empresa.findUnique({
      where: { id: Number(empresaId) }
    });
    
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    // Formatar resposta
    return res.json({
      id: empresa.id,
      nome: empresa.nome,
      cnpj: empresa.cnpj,
      email: empresa.email,
      telefone: empresa.telefone,
      endereco: empresa.endereco,
      cidade: empresa.cidade,
      estado: empresa.estado,
      cep: empresa.cep,
      logo: empresa.logo,
      tipoNegocio: empresa.tipoNegocio,
      modulos: {
        produtos: empresa.moduloProdutos,
        servicos: empresa.moduloServicos,
        estoque: empresa.moduloEstoque,
        pdv: empresa.moduloPDV,
        promocoes: empresa.moduloPromocoes,
        fiscal: empresa.moduloFiscal,
        ponto: empresa.moduloPonto
      }
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar configurações da empresa
router.put('/:empresaId', authenticateToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user?.id;
    const { nome, email, telefone, endereco, cidade, estado, cep, logo, tipoNegocio, modulos } = req.body;
    
    // Verificar se o usuário tem permissão de administrador
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      select: { empresaId: true, role: true }
    });
    
    if (!usuario || usuario.empresaId !== Number(empresaId) || usuario.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado para editar configurações' });
    }
    
    // Atualizar empresa
    const empresaAtualizada = await prisma.empresa.update({
      where: { id: Number(empresaId) },
      data: {
        nome,
        email,
        telefone,
        endereco,
        cidade,
        estado,
        cep,
        logo,
        tipoNegocio,
        moduloProdutos: modulos?.produtos,
        moduloServicos: modulos?.servicos,
        moduloEstoque: modulos?.estoque,
        moduloPDV: modulos?.pdv,
        moduloPromocoes: modulos?.promocoes,
        moduloFiscal: modulos?.fiscal,
        moduloPonto: modulos?.ponto
      }
    });
    
    // Formatar resposta
    return res.json({
      id: empresaAtualizada.id,
      nome: empresaAtualizada.nome,
      email: empresaAtualizada.email,
      telefone: empresaAtualizada.telefone,
      endereco: empresaAtualizada.endereco,
      cidade: empresaAtualizada.cidade,
      estado: empresaAtualizada.estado,
      cep: empresaAtualizada.cep,
      logo: empresaAtualizada.logo,
      tipoNegocio: empresaAtualizada.tipoNegocio,
      modulos: {
        produtos: empresaAtualizada.moduloProdutos,
        servicos: empresaAtualizada.moduloServicos,
        estoque: empresaAtualizada.moduloEstoque,
        pdv: empresaAtualizada.moduloPDV,
        promocoes: empresaAtualizada.moduloPromocoes,
        fiscal: empresaAtualizada.moduloFiscal,
        ponto: empresaAtualizada.moduloPonto
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
