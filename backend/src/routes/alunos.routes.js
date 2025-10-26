const express = require('express');
const authenticate = require('../middlewares/auth');
const { createAluno, updateAluno, getAlunoById } = require('../controllers/alunosController');
const validate = require('../middlewares/validate');
const { z } = require('zod');

const router = express.Router();

const alunoSchema = z.object({
  name: z.string().min(1),
  cpf: z.string().optional(), // Validado no controlador
  birthDate: z.string().optional(),
  peso: z.number().optional(),
  altura: z.number().optional(),
  responsavelId: z.string().optional(),
  tenantId: z.string().optional(),
  atividadeId: z.string().optional(),
});

router.post('/', authenticate, validate(alunoSchema), createAluno);
router.put('/:id', authenticate, validate(alunoSchema.partial()), updateAluno);
router.get('/me', authenticate, getAlunoById);

module.exports = router;