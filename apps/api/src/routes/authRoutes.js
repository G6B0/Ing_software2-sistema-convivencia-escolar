const express = require('express')
const { iniciarSesion } = require('../controllers/authController')

const router = express.Router()

router.post('/auth/login', iniciarSesion)

module.exports = router
