const express = require('express');
const authenticate = require('../middlewares/auth');
const { createDesempenho } = require('../controllers/desempenhoController');
const validate = require('../middlewares/validate');
const { z } = require('zod');

const router = express.Router();

const desempenhoSchema = z.object({
  alunoId: z.string(),
  atividade: z.string(),
  data: z.string(),
  metrica: z.any(),
  comentario: z.string().optional(),
  atividadeId: z.string().optional(),
});

router.post('/', authenticate, validate(desempenhoSchema), createDesempenho);

module.exports = router;