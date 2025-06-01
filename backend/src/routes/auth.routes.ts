import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middlewares/auth.middleware';

const router: Router = express.Router();
const prisma = new PrismaClient();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // Buscar usuário pelo email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        empresa: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            modulosAtivos: true
          }
        }
      }
    });
    
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT
    const secret = process.env.JWT_SECRET || 'sistema-erp-multiempresa-secret-key-2025';
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        role: usuario.role,
        empresaId: usuario.empresaId
      },
      secret,
      { expiresIn: '8h' }
    );
    
    // Retornar dados do usuário e token
    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        empresa: usuario.empresa
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verificar', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    // Buscar usuário pelo ID
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: {
        empresa: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            modulosAtivos: true
          }
        }
      }
    });
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Retornar dados do usuário
    return res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        empresa: usuario.empresa
      }
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
