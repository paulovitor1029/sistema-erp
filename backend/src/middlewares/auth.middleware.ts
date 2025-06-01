import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface para o payload do token JWT
interface TokenPayload {
  id: number;
  email: string;
  role: string;
  empresaId: number;
}

// Estendendo o tipo Request do Express para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// Middleware para autenticação de token JWT
export const authenticateToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }
    
    const secret = process.env.JWT_SECRET || 'sistema-erp-multiempresa-secret-key-2025';
    
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido ou expirado' });
      }
      
      req.user = decoded as TokenPayload;
      next();
    });
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware para verificar se o usuário é administrador ou gerente
export const isManager = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }
    
    next();
  } catch (error) {
    console.error('Erro no middleware de verificação de permissão:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware para verificar se o usuário é administrador
export const isAdmin = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }
    
    next();
  } catch (error) {
    console.error('Erro no middleware de verificação de permissão:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
