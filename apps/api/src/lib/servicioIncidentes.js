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

    datosIncidente.protocolo = this.servicioInstitucional.consultarProtocolo(datosIncidente.gravedad)
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
    const accionSeguimiento = datosSeguimiento.accion || datosSeguimiento.descripcion

    if (!accionSeguimiento || accionSeguimiento.trim() === '') {
      throw new ErrorValidacionSistema('La accion o descripcion del seguimiento es obligatoria.')
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
      accion: accionSeguimiento,
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

  async actualizarGravedadIncidente(
    incidenteId,
    nuevaGravedad,
    funcionarioSesionId) {
      
    const funcionario =
      this.servicioInstitucional.consultarFuncionario(
        funcionarioSesionId
      )

    if (!funcionario) {
      throw new ErrorValidacionSistema(
        'El funcionario responsable no existe.'
      )
    }

    const incidente =
      await this.consultarIncidentePorId(incidenteId)

    if (!incidente) {
      throw new ErrorValidacionSistema(
        'El incidente no existe.'
      )
    }

    const gravedadAnterior = incidente.gravedad

    const protocolo = this.servicioInstitucional.consultarProtocolo(nuevaGravedad)

    if (!protocolo) {
      throw new ErrorValidacionSistema(
        'La gravedad del incidente no es valida.'
      )
    }

    // Si la gravedad no cambia, no registrar auditoría
    if (gravedadAnterior === nuevaGravedad) {
      return incidente
    }

    const incidenteActualizado =
      await this.persistenciaSistema.actualizarGravedadIncidente(
        incidenteId,
        nuevaGravedad,
        protocolo
      )

    await this.persistenciaSistema.guardarAuditoria({
      accion: 'CAMBIO_GRAVEDAD',
      fecha: new Date().toISOString(),
      funcionarioResponsableId: funcionario.id,
      entidad: 'incidente',
      identificadorRelacionado: incidenteId,
      gravedadAnterior,
      gravedadNueva: nuevaGravedad,
    })

    return incidenteActualizado
  }

  async obtenerHistorialSeguimientos(incidenteId, funcionarioSesionId) {
    // 1. Validar que el incidente exista
    const incidente = await this.consultarIncidentePorId(incidenteId)
    if (!incidente) {
      throw new ErrorValidacionSistema('El incidente consultado no existe.')
    }

    // 2. Validar que el funcionario exista (Preparando terreno para el Test 3)
    const funcionario = this.servicioInstitucional.consultarFuncionario(funcionarioSesionId)
    if (!funcionario) {
      throw new ErrorValidacionSistema('El funcionario no tiene permisos o no existe.')
    }

    // 3. Obtener los seguimientos desde la base de datos
    let seguimientos = await this.persistenciaSistema.consultarSeguimientosPorIncidente(incidenteId)

    // 4. Test 2: Si no hay seguimientos, la BD podría devolver null o undefined.
    // Lo convertimos a un arreglo vacío para que no explote y sea amigable.
    if (!seguimientos) {
      seguimientos = []
    }

    // 5. Test 1: Ordenar cronológicamente (del más antiguo al más nuevo)
    seguimientos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

    return seguimientos
  }

  consultarIncidentePorId(incidenteId) {
    return this.persistenciaSistema.consultarIncidentePorId(incidenteId)
  }

  async listarIncidentes() {
    const incidentes = await this.persistenciaSistema.listarIncidentes()

    // Enriquecer cada incidente con información de los alumnos
    const incidentesEnriquecidos = incidentes.map((incidente) => {
      const participantesEnriquecidos = (incidente.participantes || []).map((participante) => {
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
