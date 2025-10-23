// Middleware de autenticação (desativado temporariamente)
const authenticate = (req, res, next) => {
  // Quando autenticação for reativada, validar token aqui
  req.user = { tenantId: req.query.tenantId || 'temp-tenant-id' }; // Temporário
  next();
};

module.exports = authenticate;