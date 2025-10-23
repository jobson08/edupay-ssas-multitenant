const { prisma } = require('../server');
const { calcularIdade } = require('../services/idadeService');

const createAluno = async (req, res) => {
  const { name, birthDate, peso, altura, responsavelId, tenantId, atividadeId } = req.body;
  try {
    let categoriaId = null;
    const atividade = await prisma.atividade.findUnique({ where: { id: atividadeId } });
    if (birthDate && atividadeId && atividade?.requerIdade) {
      const idade = calcularIdade(birthDate);
      const categoria = await prisma.categoriaIdade.findFirst({
        where: {
          tenantId: tenantId || req.user.tenantId,
          atividadeId,
          idadeMaxima: { gte: idade },
        },
        orderBy: { idadeMaxima: 'asc' },
      });
      categoriaId = categoria?.id || null;
    }
    const aluno = await prisma.aluno.create({
      data: {
        name,
        birthDate: birthDate ? new Date(birthDate) : null,
        peso: peso ? parseFloat(peso) : null,
        altura: altura ? parseFloat(altura) : null,
        categoriaId,
        responsavelId,
        tenantId: tenantId || req.user.tenantId,
      },
    });
    res.json(aluno);
  } catch (e) {
    throw new Error('Erro ao criar aluno');
  }
};

const updateAluno = async (req, res) => {
  const { id } = req.params;
  const { name, birthDate, peso, altura, responsavelId, tenantId, atividadeId, categoriaId } = req.body;
  try {
    let finalCategoriaId = categoriaId;
    const atividade = await prisma.atividade.findUnique({ where: { id: atividadeId } });
    if (birthDate && atividadeId && atividade?.requerIdade && !categoriaId) {
      const idade = calcularIdade(birthDate);
      const categoria = await prisma.categoriaIdade.findFirst({
        where: {
          tenantId: tenantId || req.user.tenantId,
          atividadeId,
          idadeMaxima: { gte: idade },
        },
        orderBy: { idadeMaxima: 'asc' },
      });
      finalCategoriaId = categoria?.id || null;
    }
    const aluno = await prisma.aluno.update({
      where: { id },
      data: {
        name,
        birthDate: birthDate ? new Date(birthDate) : null,
        peso: peso ? parseFloat(peso) : null,
        altura: altura ? parseFloat(altura) : null,
        categoriaId: finalCategoriaId,
        responsavelId,
        tenantId: tenantId || req.user.tenantId,
      },
    });
    res.json(aluno);
  } catch (e) {
    throw new Error('Erro ao atualizar aluno');
  }
};

const getAlunoById = async (req, res) => {
  const alunoId = req.params.id || 'temp-aluno-id';
  try {
    const aluno = await prisma.aluno.findFirst({
      where: { id: alunoId },
      include: {
        responsavel: true,
        desenvolvimentos: true,
        desempenhos: true,
        categoria: { include: { atividade: true } },
      },
    });
    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });
    res.json(aluno);
  } catch (e) {
    throw new Error('Erro ao buscar aluno');
  }
};

module.exports = { createAluno, updateAluno, getAlunoById };