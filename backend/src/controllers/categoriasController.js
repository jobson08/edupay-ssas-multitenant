const { prisma } = require('../server');

const getCategoriasByAtividade = async (req, res) => {
  const tenantId = req.user.tenantId;
  const { atividadeId } = req.query;
  try {
    const categorias = await prisma.categoriaIdade.findMany({
      where: { tenantId, atividadeId },
      include: { atividade: true },
    });
    res.json(categorias);
  } catch (e) {
    throw new Error('Erro ao listar categorias');
  }
};

module.exports = { getCategoriasByAtividade };