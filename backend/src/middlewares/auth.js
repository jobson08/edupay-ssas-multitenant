// Middleware de autenticação (desativado temporariamente)

const authenticate = (req, res, next) => {
  // Quando autenticação for reativada, validar token aqui
  req.user = { tenantId: req.query.tenantId || 'temp-tenant-id' }; // Temporário
  next();
};

//Autenticação: Quando reativada, substitua o middleware auth.js por validação de token JWT
/*
const jwt = require('jsonwebtoken');
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded; // Inclui tenantId e role
  next();
};
*/

module.exports = authenticate;