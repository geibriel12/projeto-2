 import 'dotenv/config'; 
import express from 'express';
import { PrismaClient } from '@prisma/client'; 
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
 app.use(cors());

// Listar usuários
app.get('/usuarios', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

// Criar usuário
app.post('/usuarios', async (req, res) => {
  try {
    await prisma.user.create({
      data: {
        email: req.body.email, 
        senha: req.body.senha // Corrigido de req.body.age para req.body.senha
      }
    });
    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário.' });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // Corrigido para usar crases (Template Literals)
  console.log(`Servidor rodando na porta ${PORT}`); 
});