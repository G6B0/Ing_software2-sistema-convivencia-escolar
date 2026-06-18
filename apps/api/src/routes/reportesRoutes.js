const express = require('express');
const router = express.Router();
const {
  obtenerDashboard,
  obtenerRankingCursos,
  obtenerReporteMensual,
} = require('../controllers/reportesController');
const { PERMISOS } = require('../lib/rolesPermisos');
const { autorizarPermisos } = require('../middleware/autorizacion');

const permisosDashboard = [
  PERMISOS.CONSULTAR_INCIDENTES,
  PERMISOS.CONSULTAR_INCIDENTES_PROPIOS_O_GENERALES,
  PERMISOS.CONSULTAR_HISTORIAL,
  PERMISOS.GESTIONAR_INCIDENTES,
  PERMISOS.VISUALIZAR_REINCIDENCIA,
  PERMISOS.REVISAR_REPORTES,
  PERMISOS.CONSULTAR_REPORTES,
];

const permisosReportes = [
  PERMISOS.REVISAR_REPORTES,
  PERMISOS.CONSULTAR_REPORTES,
];

router.get('/reportes/dashboard', autorizarPermisos(permisosDashboard), obtenerDashboard);
router.get('/reportes/ranking-cursos', autorizarPermisos([
  ...permisosReportes,
  PERMISOS.VISUALIZAR_REINCIDENCIA,
]), obtenerRankingCursos);
router.get('/reportes/mensual', autorizarPermisos(permisosReportes), obtenerReporteMensual);

module.exports = router;
