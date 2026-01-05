 import 'dotenv/config'; 
import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client'; 
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// CONFIGURAÇÃO DE CORS
// Adicione aqui a URL do seu frontend quando fizer o deploy dele
const allowedOrigins = [
  'https://instagramm-n17v.onrender.com', // Seu frontend no Render
  'http://localhost:5173'                  // Seu ambiente local (Vite)
]; 

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (como mobile apps ou curl) ou se estiver na lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true 
}));

// --- ROTAS ---

// Listar usuários
app.get('/api/usuarios', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

// Criar usuário
app.post('/api/usuarios', async (req, res) => {
  try {
    const novoUsuario = await prisma.user.create({
      data: {
        email: req.body.email, 
        senha: req.body.senha 
      }
    });
    res.status(201).json(novoUsuario);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: 'Este endereço de e-mail já está cadastrado.' });
    } else {
      console.error('Erro inesperado ao criar usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
});

// Editar usuário
app.put('/api/usuarios/:id', async (req, res) => {
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
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    res.status(200).json({ message: 'Usuário deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário.' });
  }
});

// --- INICIALIZAÇÃO ---

// No Render, a porta 10000 é o padrão se a variável process.env.PORT não estiver definida
const PORT = process.env.PORT || 10000;

// IMPORTANTE: Adicionado '0.0.0.0' para o Render conseguir mapear a porta corretamente
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`); 
});