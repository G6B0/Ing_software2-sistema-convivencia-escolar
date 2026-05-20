const { ErrorValidacionSistema } = require('./erroresSistema')

class ServicioIncidentes {
  constructor({ persistenciaSistema, servicioInstitucional }) {
    this.persistenciaSistema = persistenciaSistema
    this.servicioInstitucional = servicioInstitucional
  }

  async registrarIncidente(datosIncidente) {
    const funcionario = this.servicioInstitucional.consultarFuncionario(
      datosIncidente.funcionarioResponsableId
    )

    if (!funcionario) {
      throw new ErrorValidacionSistema('El funcionario responsable no existe.')
    }

    if (!Array.isArray(datosIncidente.participantes) || datosIncidente.participantes.length === 0) {
      throw new ErrorValidacionSistema('El incidente debe tener al menos un participante.')
    }

    datosIncidente.participantes.forEach((participante) => {
      const alumno = this.servicioInstitucional.consultarAlumnoPorId(
        participante.alumnoInstitucionalId
      )

      if (!alumno) {
        throw new ErrorValidacionSistema('Uno de los alumnos no existe en la fuente institucional.')
      }
    })

    const incidente = await this.persistenciaSistema.guardarIncidente(datosIncidente)

    await this.persistenciaSistema.guardarAuditoria({
      accion: 'CREAR_INCIDENTE',
      fecha: new Date().toISOString(),
      funcionarioResponsableId: incidente.funcionarioResponsableId,
      entidad: 'incidente',
      identificadorRelacionado: incidente.id,
    })

    return incidente
  }

  async registrarSeguimiento(incidenteId, datosSeguimiento, funcionarioSesionId) {
    const incidente = await this.consultarIncidentePorId(incidenteId)

    if (!incidente) {
      throw new ErrorValidacionSistema('El incidente al que intenta hacer seguimiento no existe.')
    }

    const funcionario = this.servicioInstitucional.consultarFuncionario(funcionarioSesionId)

    if (!funcionario) {
      throw new ErrorValidacionSistema('El funcionario responsable no existe.')
    }

    const nuevoSeguimiento = await this.persistenciaSistema.guardarSeguimiento({
      ...datosSeguimiento,
      incidenteId,
      funcionarioResponsableId: funcionario.id,
    })

    await this.persistenciaSistema.guardarAuditoria({
      accion: 'CREAR_SEGUIMIENTO',
      fecha: new Date().toISOString(),
      funcionarioResponsableId: funcionario.id,
      entidad: 'seguimiento',
      identificadorRelacionado: nuevoSeguimiento.id,
    })

    return nuevoSeguimiento
  }

  consultarIncidentePorId(incidenteId) {
    return this.persistenciaSistema.consultarIncidentePorId(incidenteId)
  }
}

module.exports = ServicioIncidentes
