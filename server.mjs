 import 'dotenv/config'; 
import express from 'express';
// Importe 'Prisma' junto com 'PrismaClient'
import { PrismaClient, Prisma } from '@prisma/client'; 
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// CONFIGURAÇÃO DE CORS ATUALIZADA
// Em 2026, '*' libera para todos os dispositivos, ideal para testes iniciais
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Listar usuários
app.get('/usuarios', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

// Criar usuário (ROTA CORRIGIDA COM TRATAMENTO P2002)
app.post('/usuarios', async (req, res) => {
  try {
    const novoUsuario = await prisma.user.create({
      data: {
        email: req.body.email, 
        senha: req.body.senha 
      }
    });
    res.status(201).json(novoUsuario);
  } catch (error) {
    // Verificação específica para o erro de e-mail duplicado (P2002)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: 'Este endereço de e-mail já está cadastrado.' });
    } else {
      // Para todos os outros erros (falha de conexão, etc.)
      console.error('Erro inesperado ao criar usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
});

// Editar usuário
app.put('/usuarios/:id', async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: {
        email: req.body.email,
        senha: req.body.senha
      }
    });
    res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
});

// Deletar usuário
app.delete('/usuarios/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    res.status(200).json({ message: 'Usuário deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário.' });
  }
});

// Porta configurada para o Render (sempre usa process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`); 
});