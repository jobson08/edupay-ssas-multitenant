const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');
const mercadopago = require('mercadopago');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (MP_ACCESS_TOKEN) {
  mercadopago.configure({ access_token: MP_ACCESS_TOKEN });
} else {
  console.warn('MP_ACCESS_TOKEN não configurado. Pagamentos não funcionarão.');
}

// Função para calcular idade
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Middleware para detectar tenant
const tenantMiddleware = async (req, res, next) => {
  try {
    const host = req.headers.host;
    const slug = host.split('.')[0];
    const tenant = await prisma.tenant.findFirst({
      where: { OR: [{ slug }, { domain: host }] },
    });
    if (!tenant) return res.status(404).json({ error: 'Tenant não encontrado' });
    if (tenant.status === 'suspenso' || tenant.status === 'cancelado') {
      return res.status(403).json({ error: `Tenant ${tenant.status}` });
    }
    req.tenant = tenant;
    next();
  } catch (e) {
    console.error('Erro no tenantMiddleware:', e);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

// Middleware de autenticação
const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token ausente' });
  const token = auth.replace('Bearer ', '');
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.auth = data;
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
    if (user.role === 'SUPERADMIN') {
      next();
      return;
    }
    if (req.tenant && req.auth.tenantId !== req.tenant.id) {
      return res.status(403).json({ error: 'Acesso não autorizado ao tenant' });
    }
    req.user = user;
    next();
  } catch (e) {
    console.error('Erro no authMiddleware:', e);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Criar responsável
app.post('/responsaveis', authMiddleware, async (req, res) => {
  try {
    const { nome, email, cpf, telefone } = req.body;
    const tenantId = req.auth.tenantId;
    if (req.auth.role !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    if (cpf && !/^\d{11}$/.test(cpf)) {
      return res.status(400).json({ error: 'CPF inválido (deve ter 11 dígitos)' });
    }
    const responsavel = await prisma.responsavel.create({
      data: {
        nome,
        email,
        cpf,
        telefone,
        tenantId,
      },
    });
    res.json(responsavel);
  } catch (e) {
    console.error('Erro em /responsaveis:', e);
    res.status(500).json({ error: e.message || 'Erro interno no servidor' });
  }
});

// Listar responsáveis
app.get('/responsaveis', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.auth.tenantId;
    if (req.auth.role !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    const responsaveis = await prisma.responsavel.findMany({ where: { tenantId } });
    res.json(responsaveis);
  } catch (e) {
    console.error('Erro em /responsaveis:', e);
    res.status(500).json({ error: e.message || 'Erro interno no servidor' });
  }
});

// Criar aluno
app.post('/alunos', authMiddleware, async (req, res) => {
  try {
    const { name, birthDate, responsavelId } = req.body;
    const tenantId = req.auth.tenantId;
    if (!tenantId) return res.status(400).json({ error: 'Usuário sem tenant associado' });
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    if (birthDate && isNaN(Date.parse(birthDate))) {
      return res.status(400).json({ error: 'Data de nascimento inválida' });
    }
    if (birthDate && calculateAge(birthDate) < 18 && !responsavelId) {
      return res.status(400).json({ error: 'Responsável é obrigatório para menores de 18 anos' });
    }
    if (responsavelId) {
      const responsavel = await prisma.responsavel.findUnique({ where: { id: responsavelId } });
      if (!responsavel || responsavel.tenantId !== tenantId) {
        return res.status(400).json({ error: 'Responsável inválido ou não pertence ao tenant' });
      }
    }
    const aluno = await prisma.aluno.create({
      data: {
        name,
        birthDate: birthDate ? new Date(birthDate) : null,
        responsavelId,
        tenantId,
      },
    });
    res.json(aluno);
  } catch (e) {
    console.error('Erro em /alunos:', e);
    res.status(500).json({ error: e.message || 'Erro interno no servidor' });
  }
});

// Criar mensalidade
app.post('/mensalidades', authMiddleware, async (req, res) => {
  try {
    const { alunoId, userId, valor, vencimento, tipo } = req.body;
    const tenantId = req.auth.tenantId;
    if (!tenantId) return res.status(400).json({ error: 'Usuário sem tenant associado' });
    if (!valor || !vencimento || !tipo) return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    if (!['aluno', 'funcionario'].includes(tipo)) return res.status(400).json({ error: 'Tipo inválido' });
    let associado;
    if (tipo === 'aluno') {
      if (!alunoId) return res.status(400).json({ error: 'alunoId obrigatório para tipo aluno' });
      associado = await prisma.aluno.findUnique({
        where: { id: alunoId },
        include: { responsavel: true },
      });
      if (!associado || associado.tenantId !== tenantId) return res.status(403).json({ error: 'Aluno inválido' });
      if (associado.birthDate && calculateAge(associado.birthDate) < 18 && !associado.responsavel) {
        return res.status(400).json({ error: 'Responsável obrigatório para aluno menor de 18 anos' });
      }
    } else if (tipo === 'funcionario') {
      if (!userId) return res.status(400).json({ error: 'userId obrigatório para tipo funcionario' });
      associado = await prisma.user.findUnique({ where: { id: userId } });
      if (!associado || associado.tenantId !== tenantId || !['PROFESSOR', 'RH', 'SEGURANCA', 'OUTRO'].includes(associado.role)) {
        return res.status(403).json({ error: 'Funcionário inválido' });
      }
    }
    const mensalidade = await prisma.mensalidade.create({
      data: {
        alunoId: tipo === 'aluno' ? alunoId : null,
        userId: tipo === 'funcionario' ? userId : null,
        tenantId,
        valor,
        vencimento: new Date(vencimento),
        status: 'PENDENTE',
        tipo,
      },
    });
    res.json(mensalidade);
  } catch (e) {
    console.error('Erro em /mensalidades:', e);
    res.status(500).json({ error: e.message || 'Erro interno no servidor' });
  }
});

// Gerar boleto para mensalidade
app.post('/mensalidades/:id/boleto', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.auth.tenantId;
    if (!tenantId) return res.status(400).json({ error: 'Usuário sem tenant associado' });
    const mensalidade = await prisma.mensalidade.findUnique({
      where: { id },
      include: { aluno: { include: { responsavel: true } }, user: true },
    });
    if (!mensalidade || mensalidade.tenantId !== tenantId) {
      return res.status(403).json({ error: 'Mensalidade inválida ou não pertence ao tenant' });
    }
    if (!MP_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Configuração de pagamento não disponível' });
    }
    let payer;
    if (mensalidade.tipo === 'aluno' && mensalidade.aluno?.birthDate && calculateAge(mensalidade.aluno.birthDate) < 18) {
      if (!mensalidade.aluno.responsavel) {
        return res.status(400).json({ error: 'Responsável obrigatório para aluno menor' });
      }
      payer = {
        email: mensalidade.aluno.responsavel.email || req.user.email, // Usa email do responsável, se disponível
        name: mensalidade.aluno.responsavel.nome,
        identification: mensalidade.aluno.responsavel.cpf ? { type: 'CPF', number: mensalidade.aluno.responsavel.cpf } : undefined,
      };
    } else {
      payer = {
        email: req.user.email,
        name: mensalidade.aluno?.name || mensalidade.user?.name,
      };
    }
    const payment = await mercadopago.payment.create({
      transaction_amount: mensalidade.valor,
      payment_method_id: 'bolbradesco',
      payer,
      description: `Mensalidade ${mensalidade.id} - ${req.tenant.name}`,
    });
    await prisma.mensalidade.update({
      where: { id },
      data: { status: payment.status === 'approved' ? 'PAGO' : 'PENDENTE' },
    });
    res.json({ boletoUrl: payment.transaction_details.external_resource_url });
  } catch (e) {
    console.error('Erro em /mensalidades/:id/boleto:', e);
    res.status(500).json({ error: e.message || 'Erro interno no servidor' });
  }
});

// ... (manter outros endpoints: /tenants/register, /funcionarios, /superadmin, etc.)

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));