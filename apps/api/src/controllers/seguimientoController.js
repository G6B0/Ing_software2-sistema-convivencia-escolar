const registrarSeguimiento = async (req, res) => {
  try {
    const incidenteId = req.params.id;
    const datosSeguimiento = req.body;

    // Aquí extraemos el servicio de incidentes. 
    const servicioIncidentes = req.app.locals.servicioIncidentes; 

    const nuevoSeguimiento = await servicioIncidentes.registrarSeguimiento(incidenteId, datosSeguimiento);

    return res.status(201).json({
      mensaje: 'Seguimiento registrado con éxito',
      seguimiento: nuevoSeguimiento
    });

  } catch (error) {
    // Si es un error de validación (como el incidente que no existe), devolvemos 400
    if (error.name === 'ErrorValidacionSistema') {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { registrarSeguimiento };