const { prisma } = require('../server');

const createDesenvolvimento = async (req, res) => {
  const { alunoId, mes, ano, comentario } = req.body;
  try {
    const desenvolvimento = await prisma.desenvolvimentoMensal.create({
      data: {
        alunoId,
        mes: parseInt(mes),
        ano: parseInt(ano),
        comentario,
      },
    });
    res.json(desenvolvimento);
  } catch (e) {
    throw new Error('Erro ao adicionar desenvolvimento');
  }
};

module.exports = { createDesenvolvimento };