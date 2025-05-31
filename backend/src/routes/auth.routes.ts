import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();
const prisma = new PrismaClient();

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário pelo email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { empresa: true }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        role: usuario.role,
        empresaId: usuario.empresaId
      },
      process.env.JWT_SECRET || 'sistema-erp-multiempresa-secret-key-2025',
      { expiresIn: '24h' }
    );

    // Atualizar último login
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() }
    });

    // Retornar dados do usuário e token
    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        empresa: {
          id: usuario.empresa.id,
          nome: usuario.empresa.nome,
          tipoNegocio: usuario.empresa.tipoNegocio,
          modulos: {
            produtos: usuario.empresa.moduloProdutos,
            servicos: usuario.empresa.moduloServicos,
            estoque: usuario.empresa.moduloEstoque,
            pdv: usuario.empresa.moduloPDV,
            promocoes: usuario.empresa.moduloPromocoes,
            fiscal: usuario.empresa.moduloFiscal,
            ponto: usuario.empresa.moduloPonto
          }
        }
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para verificar token
router.get('/verificar-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'sistema-erp-multiempresa-secret-key-2025'
      ) as any;
      
      // Buscar usuário atualizado
      const usuario = await prisma.usuario.findUnique({
        where: { id: decoded.id },
        include: { empresa: true }
      });
      
      if (!usuario || !usuario.ativo) {
        return res.status(401).json({ error: 'Usuário inválido ou inativo' });
      }
      
      return res.json({
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role,
          empresa: {
            id: usuario.empresa.id,
            nome: usuario.empresa.nome,
            tipoNegocio: usuario.empresa.tipoNegocio,
            modulos: {
              produtos: usuario.empresa.moduloProdutos,
              servicos: usuario.empresa.moduloServicos,
              estoque: usuario.empresa.moduloEstoque,
              pdv: usuario.empresa.moduloPDV,
              promocoes: usuario.empresa.moduloPromocoes,
              fiscal: usuario.empresa.moduloFiscal,
              ponto: usuario.empresa.moduloPonto
            }
          }
        }
      });
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
