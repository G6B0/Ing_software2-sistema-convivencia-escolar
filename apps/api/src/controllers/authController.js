const { ErrorAutorizacionSistema, ErrorValidacionSistema } = require('../lib/erroresSistema')

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

const consultarPermisosSesion = (req, res) => {
  try {
    const resultado = req.app.locals.servicioAutorizacion.consultarPermisosFuncionario(
      req.header('x-funcionario-id')
    )

    return res.status(200).json({ ok: true, data: resultado })
  } catch (error) {
    if (error instanceof ErrorAutorizacionSistema) {
      return res.status(403).json({ ok: false, mensaje: error.message })
    }

    return res.status(500).json({
      ok: false,
      mensaje: 'No se pudieron consultar los permisos de la sesion.',
    })
  }
}

module.exports = { consultarPermisosSesion, iniciarSesion }
