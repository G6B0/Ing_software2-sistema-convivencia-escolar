const express = require('express');
const router = express.Router();
const { registrarSeguimiento } = require('../controllers/seguimientoController');

// Definimos que cuando llegue un POST a /incidentes/:id/seguimientos se ejecute tu lógica
router.post('/incidentes/:id/seguimientos', registrarSeguimiento);

module.exports = router;