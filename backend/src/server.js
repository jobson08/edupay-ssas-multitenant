const express = require('express');
const { PrismaClient } = require('@prisma/client');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Importar rotas
const tenantRoutes = require('./routes/tenants.routes');
const userRoutes = require('./routes/users.routes');
const alunoRoutes = require('./routes/alunos.routes');
const atividadeRoutes = require('./routes/atividades.routes');
const categoriaRoutes = require('./routes/categorias.routes');
const desempenhoRoutes = require('./routes/desempenho.routes');
const desenvolvimentoRoutes = require('./routes/desenvolvimento.routes');

// Usar rotas
app.use('/tenants', tenantRoutes);
app.use('/users', userRoutes);
app.use('/alunos', alunoRoutes);
app.use('/atividades', atividadeRoutes);
app.use('/categorias-idade', categoriaRoutes);
app.use('/desempenho', desempenhoRoutes);
app.use('/desenvolvimento', desenvolvimentoRoutes);

// Middleware de erro
app.use(errorHandler);

app.listen(4000, () => console.log('Backend rodando na porta 4000'));

// Exportar prisma para uso nos controladores
module.exports = { prisma };