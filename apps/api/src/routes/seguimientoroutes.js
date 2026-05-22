const express = require('express');
const router = express.Router();
const { registrarSeguimiento, obtenerSeguimientos } = require('../controllers/seguimientoController');

// Definimos que cuando llegue un POST a /incidentes/:id/seguimientos se ejecute tu lógica
router.post('/incidentes/:id/seguimientos', registrarSeguimiento);
router.get('/incidentes/:id/seguimientos', obtenerSeguimientos);

module.exports = router;