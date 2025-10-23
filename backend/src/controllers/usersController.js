const { prisma } = require('../server');

const getUsersByTenant = async (req, res) => {
  const tenantId = req.user.tenantId;
  try {
    const users = await prisma.user.findMany({ where: { tenantId } });
    res.json(users);
  } catch (e) {
    throw new Error('Erro ao listar usuários');
  }
};

module.exports = { getUsersByTenant };