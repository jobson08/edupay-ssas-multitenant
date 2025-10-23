const { prisma } = require('../server');

const createDesempenho = async (req, res) => {
  const { alunoId, atividade, data, metrica, comentario, atividadeId } = req.body;
  try {
    const desempenho = await prisma.desempenhoAtividade.create({
      data: {
        alunoId,
        atividade: atividade.toLowerCase(),
        data: new Date(data),
        metrica,
        comentario,
        ...(atividadeId && { atividadeId }),
      },
    });
    res.json(desempenho);
  } catch (e) {
    throw new Error('Erro ao adicionar desempenho');
  }
};

module.exports = { createDesempenho };