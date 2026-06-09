const { ErrorAutorizacionSistema, ErrorValidacionSistema } = require('../lib/erroresSistema')

function responderErrorGestion(error, res) {
  if (error instanceof ErrorAutorizacionSistema) {
    return res.status(403).json({ ok: false, mensaje: error.message })
  }

  if (error instanceof ErrorValidacionSistema) {
    return res.status(400).json({ ok: false, mensaje: error.message })
  }

  console.error(error)
  return res.status(500).json({ ok: false, mensaje: 'No se pudieron gestionar los permisos.' })
}

function consultarPermisosRol(req, res) {
  try {
    const resultado = req.app.locals.servicioAutorizacion.consultarPermisosRol(
      req.header('x-funcionario-id'),
      req.params.rol
    )

    return res.json({ ok: true, data: resultado })
  } catch (error) {
    return responderErrorGestion(error, res)
  }
}

function actualizarPermisosRol(req, res) {
  try {
    const resultado = req.app.locals.servicioAutorizacion.actualizarPermisosRol(
      req.header('x-funcionario-id'),
      req.params.rol,
      req.body.permisos
    )

    return res.json({ ok: true, data: resultado })
  } catch (error) {
    return responderErrorGestion(error, res)
  }
}

module.exports = {
  actualizarPermisosRol,
  consultarPermisosRol,
}
