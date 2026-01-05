 import 'dotenv/config'; 
import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client'; 
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// CONFIGURAÇÃO DE CORS
const allowedOrigins = [
  'https://instagramm-n17v.onrender.com', // URL do seu frontend
  'http://localhost:5173'                  // Seu ambiente local
]; 

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

// --- ROTAS ---

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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: 'Este endereço de e-mail já está cadastrado.' });
    } else {
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
});

// Outras rotas (GET, PUT, DELETE) continuam iguais...

// --- INICIALIZAÇÃO ---
// Render exige escuta em 0.0.0.0 e usa a porta da variável process.env.PORTj
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`); 
});