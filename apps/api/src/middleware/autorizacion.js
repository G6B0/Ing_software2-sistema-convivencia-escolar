const { ErrorAutorizacionSistema } = require('../lib/erroresSistema')

function responderErrorAutorizacion(error, res) {
  if (error instanceof ErrorAutorizacionSistema) {
    return res.status(403).json({ ok: false, mensaje: error.message })
  }

  console.error(error)
  return res.status(500).json({ ok: false, mensaje: 'No se pudo validar la autorizacion.' })
}

function autorizarPermisos(permisos) {
  return (req, res, next) => {
    try {
      req.app.locals.servicioAutorizacion.verificarPermisoFuncionario(
        req.header('x-funcionario-id'),
        permisos
      )
      return next()
    } catch (error) {
      return responderErrorAutorizacion(error, res)
    }
  }
}

function autorizarTodosLosPermisos(permisos) {
  return (req, res, next) => {
    try {
      req.app.locals.servicioAutorizacion.verificarTodosLosPermisosFuncionario(
        req.header('x-funcionario-id'),
        permisos
      )
      return next()
    } catch (error) {
      return responderErrorAutorizacion(error, res)
    }
  }
}

module.exports = {
  autorizarPermisos,
  autorizarTodosLosPermisos,
}
