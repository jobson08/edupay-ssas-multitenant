const { ATIVIDADES_DISPONIVEIS } = require('../services/atividadeService');
const { prisma } = require('../server');

const getAtividadesDisponiveis = async (req, res) => {
  res.json(ATIVIDADES_DISPONIVEIS.map(a => a.nome));
};

const getAtividadesByTenant = async (req, res) => {
  const tenantId = req.user.tenantId;
  try {
    const atividades = await prisma.atividade.findMany({ where: { tenantId } });
    res.json(atividades);
  } catch (e) {
    throw new Error('Erro ao listar atividades');
  }
};

module.exports = { getAtividadesDisponiveis, getAtividadesByTenant };