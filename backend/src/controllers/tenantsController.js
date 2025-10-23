const { prisma } = require('../server');
const { ATIVIDADES_DISPONIVEIS, CATEGORIAS_PADRAO_FUTEBOL } = require('../services/atividadeService');

const createTenant = async (req, res) => {
  const { name, slug, plan, siteData, atividades, adminName, adminEmail } = req.body;
  try {
    // Validar atividades
    const atividadesValidas = atividades.every(a => ATIVIDADES_DISPONIVEIS.some(d => d.nome === a));
    if (!atividadesValidas) {
      return res.status(400).json({ error: 'Atividade inválida' });
    }

    // Criar tenant
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        plan: plan || 'basico',
        siteData,
        status: 'teste',
      },
    });

    // Criar usuário admin
    const admin = await prisma.user.create({
      data: {
        name: adminName || 'Admin',
        email: adminEmail || `admin@${slug}.com`,
        passwordHash: 'temp-hash', // Substituir por hash real
        role: 'ADMIN',
        tenantId: tenant.id,
      },
    });

    // Criar atividades
    const atividadesCriadas = await Promise.all(
      atividades.map(nome =>
        prisma.atividade.create({
          data: {
            nome,
            tenantId: tenant.id,
            requerIdade: ATIVIDADES_DISPONIVEIS.find(a => a.nome === nome).requerIdade,
          },
        })
      )
    );

    // Criar categorias para futebol
    const futebol = atividadesCriadas.find(a => a.nome === 'Futebol');
    if (futebol) {
      await prisma.categoriaIdade.createMany({
        data: CATEGORIAS_PADRAO_FUTEBOL.map(c => ({
          nome: c.nome,
          idadeMaxima: c.idadeMaxima,
          tenantId: tenant.id,
          atividadeId: futebol.id,
        })),
      });
    }

    res.json({ tenant, atividades: atividadesCriadas, admin });
  } catch (e) {
    throw new Error('Erro ao criar tenant');
  }
};

module.exports = { createTenant };