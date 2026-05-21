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
    if (!datosSeguimiento.descripcion || datosSeguimiento.descripcion.trim() === '') {
      throw new ErrorValidacionSistema('La descripción del seguimiento es obligatoria.')
    }
    
    if (!datosSeguimiento.fecha || datosSeguimiento.fecha.trim() === '') {
      throw new ErrorValidacionSistema('La fecha del seguimiento es obligatoria.')
    }

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

  async listarIncidentes() {
    const incidentes = await this.persistenciaSistema.listarIncidentes()

    // Enriquecer cada incidente con información de los alumnos
    const incidentesEnriquecidos = incidentes.map((incidente) => {
      const participantesEnriquecidos = incidente.participantes.map((participante) => {
        const alumno = this.servicioInstitucional.consultarAlumnoPorId(
          participante.alumnoInstitucionalId
        )

        return {
          ...participante,
          nombreAlumno: alumno ? alumno.nombre : null,
          curso: alumno ? alumno.curso : null,
        }
      })

      return {
        ...incidente,
        participantes: participantesEnriquecidos,
      }
    })

    return incidentesEnriquecidos
  }
}

module.exports = ServicioIncidentes