  import 'dotenv/config'; 
import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client'; 
import cors from 'cors';
import path from 'path';
// Adicionadas para resolver o erro de __dirname
import { fileURLToPath } from 'url';

// --- CONFIGURAÇÃO OBRIGATÓRIA PARA ES MODULES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ------------------------------------------------

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

const allowedOrigins = ['https://instagramm-n17v.onrender.com', 'http://localhost:5173']; 
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true 
}));

// Agora o path.join(__dirname) funcionará corretamente
app.use("/tmp", express.static(path.join(__dirname, "/tmp")));

// Servir os arquivos de build do frontend (dist)
const frontendDistPath = path.join(__dirname, "../front-end/dist");
app.use(express.static(frontendDistPath));

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

// Rota coringa
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`); 
});