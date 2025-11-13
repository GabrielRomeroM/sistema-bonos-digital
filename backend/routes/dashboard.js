const express = require('express');
const router = express.Router();
const {
  obtenerEstadisticas,
  obtenerBonosFiltrados,
  obtenerEmpleados
} = require('../controllers/dashboardController');

router.get('/estadisticas', obtenerEstadisticas);
router.get('/bonos', obtenerBonosFiltrados);
router.get('/empleados', obtenerEmpleados);

module.exports = router;