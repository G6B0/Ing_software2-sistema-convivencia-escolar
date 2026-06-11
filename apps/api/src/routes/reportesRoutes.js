const express = require('express');
const router = express.Router();
const {
  obtenerDashboard,
  obtenerRankingCursos,
  obtenerReporteMensual,
} = require('../controllers/reportesController');

router.get('/reportes/dashboard', obtenerDashboard);
router.get('/reportes/ranking-cursos', obtenerRankingCursos);
router.get('/reportes/mensual', obtenerReporteMensual);

module.exports = router;
