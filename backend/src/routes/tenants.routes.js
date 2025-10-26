const express = require('express');
const { createTenant } = require('../controllers/tenantsController');
const validate = require('../middlewares/validate');
const { z } = require('zod');

const router = express.Router();

const tenantSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  cpfCnpj: z.string().optional(), // Opcional, validado no controlador
  plan: z.string().optional(),
  siteData: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      logoUrl: z.string().optional(),
      primaryColor: z.string().optional(),
    })
    .optional(),
  atividades: z.array(z.string()).min(1),
  adminName: z.string().min(1),
  adminEmail: z.string().email(),
});

router.post('/', validate(tenantSchema), createTenant);

module.exports = router;