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

const obtenerSeguimientos = async (req, res) => {
    try {
        const incidenteId = req.params.id;
        const funcionarioSesionId = req.header('x-funcionario-id') || "FUNC-001"; // Usando la misma lógica de headers que ya tenías
        const servicioIncidentes = req.app.locals.servicioIncidentes;
        
        const historial = await servicioIncidentes.obtenerHistorialSeguimientos(incidenteId, funcionarioSesionId);

        return res.status(200).json(historial);
    } catch (error) {
        if (error.name === 'ErrorValidacionSistema') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

const actualizarGravedadIncidente = async (req, res) => {
  try {
    const incidenteId = req.params.id
    const { gravedad } = req.body

    const funcionarioSesionId = req.header('x-funcionario-id')

    const servicioIncidentes = req.app.locals.servicioIncidentes

    // validar permisos si corresponde
    const incidenteActualizado =
      await servicioIncidentes.actualizarGravedadIncidente(
        incidenteId,
        gravedad,
        funcionarioSesionId
      )

    return res.status(200).json({
      mensaje: 'Gravedad actualizada con exito',
      incidente: incidenteActualizado,
    })
  } catch (error) {
    if (error.name === 'ErrorValidacionSistema') {
      return res.status(400).json({
        error: error.message,
      })
    }

    return res.status(500).json({
      error: 'Error interno del servidor',
    })
  }
};

module.exports = { registrarSeguimiento, obtenerSeguimientos, actualizarGravedadIncidente }
