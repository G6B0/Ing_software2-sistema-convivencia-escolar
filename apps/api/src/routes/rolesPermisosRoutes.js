const express = require('express')
const {
  actualizarPermisosRol,
  consultarPermisosRol,
} = require('../controllers/rolesPermisosController')

const router = express.Router()

router.get('/roles/:rol/permisos', consultarPermisosRol)
router.put('/roles/:rol/permisos', actualizarPermisosRol)

module.exports = router
