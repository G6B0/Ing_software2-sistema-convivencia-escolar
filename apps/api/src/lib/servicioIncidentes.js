const { ErrorValidacionSistema } = require('./erroresSistema')
const { ESTADOS_INCIDENTE } = require('./persistenciaSistema')
const { crearId } = require('./persistenciaSistema')

function obtenerFechaLocalISO() {
  const fecha = new Date()
  const yyyy = fecha.getFullYear()
  const mm = String(fecha.getMonth() + 1).padStart(2, '0')
  const dd = String(fecha.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

function obtenerFechaSolo(fecha) {
  return String(fecha).split('T')[0]
}

class ServicioIncidentes {
  constructor({ persistenciaSistema, servicioInstitucional }) {
    this.persistenciaSistema = persistenciaSistema
    this.servicioInstitucional = servicioInstitucional
  }

  async registrarIncidente(datosIncidente) {
    if (datosIncidente.fecha && obtenerFechaSolo(datosIncidente.fecha) > obtenerFechaLocalISO()) {
      throw new ErrorValidacionSistema('La fecha del incidente no puede estar en el futuro.')
    }

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
    if (datosIncidente.gravedad === 'Grave') {
      console.log('Generando notificación para incidente grave...')
      const director = this.servicioInstitucional.consultarDirector()
      console.log('Director encontrado:', director)
      if (director) {
        await this.persistenciaSistema.guardarNotificacion({
          id: crearId('NOT'),
          titulo: `Incidente grave: ${incidente.titulo}`,
          incidenteId: incidente.id,
          fechaCreacion: new Date().toISOString(),
          destinatarioId: director.id,
        })
      }
    }

    return incidente
  }

  async registrarSeguimiento(incidenteId, datosSeguimiento, funcionarioSesionId) {
    
    // --- VALIDACIONES ESTRICTAS (TAREA 5465) ---
    if (!datosSeguimiento.descripcion || datosSeguimiento.descripcion.trim() === '') {
      throw new ErrorValidacionSistema('La descripción del seguimiento es obligatoria.');
    }

    if (!datosSeguimiento.accion || datosSeguimiento.accion.trim() === '') {
      throw new ErrorValidacionSistema('La acción del seguimiento es obligatoria.');
    }

    if (!datosSeguimiento.evolucionCaso || datosSeguimiento.evolucionCaso.trim() === '') {
      throw new ErrorValidacionSistema('La evolución del caso es obligatoria.');
    }

    if (!datosSeguimiento.fecha || datosSeguimiento.fecha.trim() === '') {
      throw new ErrorValidacionSistema('La fecha del seguimiento es obligatoria.');
    }

    if (obtenerFechaSolo(datosSeguimiento.fecha) > obtenerFechaLocalISO()) {
      throw new ErrorValidacionSistema('La fecha del seguimiento no puede estar en el futuro.');
    }
    // ------------------------------------------

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
      accion: datosSeguimiento.accion,
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

  async actualizarEstadoIncidente(incidenteId, nuevoEstado, funcionarioSesionId) {
    const funcionario = this.servicioInstitucional.consultarFuncionario(funcionarioSesionId)

    if (!funcionario) {
      throw new ErrorValidacionSistema('El funcionario responsable no existe.')
    }

    const incidente = await this.consultarIncidentePorId(incidenteId)

    if (!incidente) {
      throw new ErrorValidacionSistema('El incidente no existe.')
    }

    if (!ESTADOS_INCIDENTE.has(nuevoEstado)) {
      throw new ErrorValidacionSistema('El estado del incidente no es valido.')
    }

    const estadoAnterior = incidente.estado

    if (estadoAnterior === nuevoEstado) {
      return incidente
    }

    const incidenteActualizado = await this.persistenciaSistema.actualizarEstadoIncidente(
      incidenteId,
      nuevoEstado
    )

    await this.persistenciaSistema.guardarAuditoria({
      accion: 'CAMBIO_ESTADO',
      fecha: new Date().toISOString(),
      funcionarioResponsableId: funcionario.id,
      entidad: 'incidente',
      identificadorRelacionado: incidenteId,
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

    return seguimientos.map((seguimiento) => {
      const funcionario = this.servicioInstitucional.consultarFuncionario(
        seguimiento.funcionarioResponsableId
      )

      return {
        ...seguimiento,
        funcionarioResponsable: funcionario
          ? {
              id: funcionario.id,
              nombre: funcionario.nombre,
              rol: funcionario.rol,
            }
          : null,
        funcionarioNombre: funcionario ? funcionario.nombre : null,
      }
    })
  }

  async consultarIncidentePorId(incidenteId) {
    const incidente = await this.persistenciaSistema.consultarIncidentePorId(incidenteId)

    if (!incidente) return null

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

    const funcionario = this.servicioInstitucional.consultarFuncionario(
      incidente.funcionarioResponsableId
    )

    return {
      ...incidente,
      participantes: participantesEnriquecidos,
      funcionarioResponsable: funcionario
        ? { nombre: funcionario.nombre, rol: funcionario.rol }
        : null,
    }
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

      const funcionario = this.servicioInstitucional.consultarFuncionario(
        incidente.funcionarioResponsableId
      )

      return {
        ...incidente,
        participantes: participantesEnriquecidos,
        funcionarioResponsable: funcionario
          ? {
              id: funcionario.id,
              nombre: funcionario.nombre,
              rol: funcionario.rol,
            }
          : null,
        funcionarioNombre: funcionario ? funcionario.nombre : null,
      }
    })

    return incidentesEnriquecidos
  }
}

module.exports = ServicioIncidentes
