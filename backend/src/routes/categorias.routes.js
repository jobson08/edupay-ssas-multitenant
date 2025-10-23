const express = require('express');
const authenticate = require('../middlewares/auth');
const { getCategoriasByAtividade } = require('../controllers/categoriasController');

const router = express.Router();

router.get('/', authenticate, getCategoriasByAtividade);

module.exports = router;