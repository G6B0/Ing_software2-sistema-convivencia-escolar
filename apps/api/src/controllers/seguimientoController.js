const registrarSeguimiento = async (req, res) => {
  try {
    const incidenteId = req.params.id
    const datosSeguimiento = req.body
    const funcionarioSesionId = req.header('x-funcionario-id')
    const servicioIncidentes = req.app.locals.servicioIncidentes

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
    if (error.name === 'ErrorValidacionSistema') {
      return res.status(400).json({ error: error.message })
    }

    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { registrarSeguimiento }
