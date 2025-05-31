import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o Prisma Client
export const prisma = new PrismaClient();

// Inicializar o Express
const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Sistema ERP Multiempresa está funcionando!' });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Tratamento de erros do Prisma
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
