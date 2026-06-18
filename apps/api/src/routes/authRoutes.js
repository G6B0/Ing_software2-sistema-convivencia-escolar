const express = require('express')
const { consultarPermisosSesion, iniciarSesion } = require('../controllers/authController')

const router = express.Router()

router.post('/auth/login', iniciarSesion)
router.get('/auth/permisos', consultarPermisosSesion)

module.exports = router
