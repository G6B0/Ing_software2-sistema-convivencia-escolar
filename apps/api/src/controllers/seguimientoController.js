const { ErrorAutorizacionSistema } = require('../lib/erroresSistema')
const { PERMISOS } = require('../lib/rolesPermisos')

function responderErrorOperacion(error, res) {
  if (error instanceof ErrorAutorizacionSistema) {
    return res.status(403).json({ error: error.message })
  }

  if (error.name === 'ErrorValidacionSistema') {
    return res.status(400).json({ error: error.message })
  }

  console.error(error)
  return res.status(500).json({ error: 'Error interno del servidor' })
}

const registrarSeguimiento = async (req, res) => {
  try {
    const incidenteId = req.params.id
    const datosSeguimiento = req.body
    const funcionarioSesionId = req.header('x-funcionario-id')
    const servicioIncidentes = req.app.locals.servicioIncidentes
    const servicioAutorizacion = req.app.locals.servicioAutorizacion

    servicioAutorizacion.verificarPermisoFuncionario(funcionarioSesionId, [
      PERMISOS.REGISTRAR_SEGUIMIENTOS,
      PERMISOS.REGISTRAR_SEGUIMIENTOS_BASICOS,
    ])

    const nuevoSeguimiento = await servicioIncidentes.registrarSeguimiento(
      incidenteId,
      datosSeguimiento,
      funcionarioSesionId
    )

    return res.status(201).json({
      mensaje: 'Seguimiento registrado con exito',
      seguimiento: nuevoSeguimiento,
    })
  } catch (error) {
    return responderErrorOperacion(error, res)
  }
}

const obtenerSeguimientos = async (req, res) => {
  try {
    const incidenteId = req.params.id
    const funcionarioSesionId = req.header('x-funcionario-id')
    const servicioIncidentes = req.app.locals.servicioIncidentes
    const servicioAutorizacion = req.app.locals.servicioAutorizacion

    servicioAutorizacion.verificarPermisoFuncionario(funcionarioSesionId, [
      PERMISOS.CONSULTAR_HISTORIAL,
      PERMISOS.CONSULTAR_INCIDENTES,
      PERMISOS.CONSULTAR_INCIDENTES_PROPIOS_O_GENERALES,
      PERMISOS.GESTIONAR_INCIDENTES,
    ])

    const historial = await servicioIncidentes.obtenerHistorialSeguimientos(
      incidenteId,
      funcionarioSesionId
    )

    return res.status(200).json(historial)
  } catch (error) {
    return responderErrorOperacion(error, res)
  }
}

const actualizarGravedadIncidente = async (req, res) => {
  try {
    const incidenteId = req.params.id
    const { gravedad } = req.body
    const funcionarioSesionId = req.header('x-funcionario-id')
    const servicioIncidentes = req.app.locals.servicioIncidentes
    const servicioAutorizacion = req.app.locals.servicioAutorizacion

    servicioAutorizacion.verificarPermisoFuncionario(
      funcionarioSesionId,
      PERMISOS.MODIFICAR_GRAVEDAD
    )

    const incidenteActualizado = await servicioIncidentes.actualizarGravedadIncidente(
      incidenteId,
      gravedad,
      funcionarioSesionId
    )

    return res.status(200).json({
      mensaje: 'Gravedad actualizada con exito',
      incidente: incidenteActualizado,
    })
  } catch (error) {
      return res.status(500).json({
        error: 'Error interno del servidor',
      })
  }
}

const actualizarEstadoIncidente = async (req, res) => {
  try {
    const incidenteId = req.params.id
    const { estado } = req.body
    const funcionarioSesionId = req.header('x-funcionario-id')
    const servicioIncidentes = req.app.locals.servicioIncidentes
    const servicioAutorizacion = req.app.locals.servicioAutorizacion

    servicioAutorizacion.verificarPermisoFuncionario(funcionarioSesionId, [
      PERMISOS.CAMBIAR_ESTADO_INCIDENTES,
      PERMISOS.GESTIONAR_ESTADOS_OPERATIVOS,
    ])

    const incidenteActualizado = await servicioIncidentes.actualizarEstadoIncidente(
      incidenteId,
      estado,
      funcionarioSesionId
    )

    return res.status(200).json({
      mensaje: 'Estado actualizado con exito',
      incidente: incidenteActualizado,
    })
  } catch (error) {
    return responderErrorOperacion(error, res)
  }
}

module.exports = {
  registrarSeguimiento,
  obtenerSeguimientos,
  actualizarGravedadIncidente,
  actualizarEstadoIncidente,
}
