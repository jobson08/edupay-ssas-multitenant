const express = require('express');
const authenticate = require('../middlewares/auth');
const { getAtividadesDisponiveis, getAtividadesByTenant } = require('../controllers/atividadesController');

const router = express.Router();

router.get('/disponiveis', getAtividadesDisponiveis);
router.get('/', authenticate, getAtividadesByTenant);

module.exports = router;