const express = require('express');
const authenticate = require('../middlewares/auth');
const { getUsersByTenant } = require('../controllers/usersController');

const router = express.Router();

router.get('/', authenticate, getUsersByTenant);

module.exports = router;