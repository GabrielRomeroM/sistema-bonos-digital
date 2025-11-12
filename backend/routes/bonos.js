const express = require('express');
const router = express.Router();
const {
  crearBono,
  obtenerBonos,
  obtenerBonoPorId,
  verificarFirma
} = require('../controllers/bonoController');

// Rutas para bonos
router.post('/', crearBono);
router.get('/', obtenerBonos);
router.get('/:id', obtenerBonoPorId);
router.get('/:id/verificar-firma', verificarFirma);

module.exports = router;