 import 'dotenv/config'; 
import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client'; 
import cors from 'cors';
// Importações adicionais necessárias
import path from 'path';
import cookieParser from 'cookie-parser'; 

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
// Adicionado o middleware de cookies
app.use(cookieParser());

// CONFIGURAÇÃO DE CORS ESPECÍFICA (MANTIDA SUA LÓGICA + credentials: true da imagem):
const allowedOrigins = ['https://instagramm-n17v.onrender.com', 'http://localhost:5173']; // Adicionei o localhost da imagem
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Necessário para enviar cookies cross-origin
}));

// --- INÍCIO DAS NOVAS CONFIGURAÇÕES DA IMAGEM ---

// Servir arquivos estáticos da pasta temporária (/tmp)
app.use("/tmp", express.static(path.join(__dirname, "/tmp")));

// Servir os arquivos de build do frontend (dist)
// Nota: Certifique-se de que a localização do front-end está correta em relação a este arquivo.
const frontendDistPath = path.join(__dirname, "../front-end/dist");
app.use(express.static(frontendDistPath));

// Rotas da API
// Idealmente, você moveria suas rotas de usuário para um arquivo de rotas separado (ex: ./routes/userRoutes.js)
// e faria `app.use('/api', userRoutes);` aqui. Por enquanto, estão abaixo:

// Listar usuários (Agora sob /api/usuarios)
app.get('/api/usuarios', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

// Criar usuário (Agora sob /api/usuarios)
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

// Editar usuário (Agora sob /api/usuarios/:id)
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

// Deletar usuário (Agora sob /api/usuarios/:id)
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

// Rota coringa para servir o index.html do frontend para rotas que não são da API
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// --- FIM DAS NOVAS CONFIGURAÇÕES DA IMAGEM ---

// Porta configurada para o Render (sempre usa process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`); 
});