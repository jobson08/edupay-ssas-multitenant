const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (e) {
    res.status(400).json({ error: 'Dados inválidos', details: e.errors });
  }
};

module.exports = validate;