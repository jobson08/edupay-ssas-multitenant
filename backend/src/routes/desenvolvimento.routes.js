const express = require('express');
const authenticate = require('../middlewares/auth');
const { createDesenvolvimento } = require('../controllers/desenvolvimentoController');
const validate = require('../middlewares/validate');
const { z } = require('zod');

const router = express.Router();

const desenvolvimentoSchema = z.object({
  alunoId: z.string(),
  mes: z.number().min(1).max(12),
  ano: z.number(),
  comentario: z.string().optional(),
});

router.post('/', authenticate, validate(desenvolvimentoSchema), createDesenvolvimento);

module.exports = router;