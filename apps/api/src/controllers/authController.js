const { ErrorValidacionSistema } = require('../lib/erroresSistema')

const iniciarSesion = async (req, res) => {
  try {
    const servicioAutenticacion = req.app.locals.servicioAutenticacion
    const sesion = await servicioAutenticacion.iniciarSesion(req.body)

    return res.status(200).json({
      ok: true,
      data: sesion,
    })
  } catch (error) {
    if (error instanceof ErrorValidacionSistema) {
      return res.status(401).json({
        ok: false,
        mensaje: error.message,
      })
    }

    return res.status(500).json({
      ok: false,
      mensaje: 'No se pudo iniciar sesion.',
    })
  }
}

module.exports = { iniciarSesion }
