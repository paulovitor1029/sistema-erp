import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o Prisma Client
const prisma = new PrismaClient();

// Inicializar o Express
const app = express();
const port = process.env.PORT || 3001;

// Configurar CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rotas
import authRoutes from './routes/auth.routes';
import configRoutes from './routes/config.routes';
import produtosRoutes from './routes/produtos.routes';
import servicosRoutes from './routes/servicos.routes';
import clientesRoutes from './routes/clientes.routes';
import estoqueRoutes from './routes/estoque.routes';
import pdvRoutes from './routes/pdv.routes';
import financeiroRoutes from './routes/financeiro.routes';
import fiscalRoutes from './routes/fiscal.routes';
import relatoriosRoutes from './routes/relatorios.routes';

// Usar rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/pdv', pdvRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/fiscal', fiscalRoutes);
app.use('/api/relatorios', relatoriosRoutes);

// Rota de teste da API
app.get('/api', (req, res) => {
  res.json({ message: 'API do Sistema ERP Multiempresa está funcionando!' });
});

// Servir arquivos estáticos do frontend em produção
if (process.env.NODE_ENV === 'production') {
  // Caminho para a pasta dist do frontend
  const frontendPath = path.join(__dirname, '../public');
  
  // Servir arquivos estáticos
  app.use(express.static(frontendPath));
  
  // Redirecionar todas as requisições para o index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Tratamento de erros do Prisma
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default app;
