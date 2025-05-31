import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface para o usuário autenticado
interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
  empresaId: number;
}

// Estender a interface Request para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Middleware para autenticar token JWT
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'sistema-erp-multiempresa-secret-key-2025'
    ) as AuthenticatedUser;

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

// Middleware para verificar permissões de administrador
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  next();
};

// Middleware para verificar permissões de gerente ou superior
export const isManager = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'gerente') {
    return res.status(403).json({ error: 'Acesso restrito a gerentes e administradores' });
  }
  next();
};

// Middleware para verificar se o usuário pertence à empresa
export const belongsToCompany = (req: Request, res: Response, next: NextFunction) => {
  const empresaId = parseInt(req.params.empresaId);
  
  if (req.user?.empresaId !== empresaId) {
    return res.status(403).json({ error: 'Acesso não autorizado a esta empresa' });
  }
  
  next();
};
