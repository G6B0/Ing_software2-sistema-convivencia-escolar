const {
  CAMPOS_INCIDENTE_REQUERIDOS,
  CAMPOS_SEGUIMIENTO_REQUERIDOS,
  crearId,
  ESTADOS_INCIDENTE,
  validarCamposRequeridos,
  validarParticipantes,
} = require('./persistenciaSistema')
const { ErrorValidacionSistema } = require('./erroresSistema')

function desdeIncidenteSupabase(registro, participantes = []) {
  return {
    id: registro.id,
    titulo: registro.titulo,
    fecha: registro.fecha,
    descripcion: registro.descripcion,
    gravedad: registro.gravedad,
    protocolo: registro.protocolo_nombre,
    estado: registro.estado,
    funcionarioResponsableId: registro.funcionario_responsable_id,
    creadoEn: registro.creado_en,
    participantes,
  }
}

function desdeParticipanteSupabase(registro) {
  return {
    id: registro.id,
    incidenteId: registro.incidente_id,
    alumnoInstitucionalId: registro.alumno_institucional_id,
    rolEnIncidente: registro.rol_en_incidente,
    observacion: registro.observacion,
  }
}

function desdeAuditoriaSupabase(registro) {
  return {
    id: registro.id,
    accion: registro.accion,
    fecha: registro.fecha,
    funcionarioResponsableId: registro.funcionario_responsable_id,
    entidad: registro.entidad,
    identificadorRelacionado: registro.identificador_relacionado,
    gravedadAnterior: registro.gravedad_anterior,
    gravedadNueva: registro.gravedad_nueva,
  }
}

function desdeSeguimientoSupabase(registro) {
  return {
    id: registro.id,
    incidenteId: registro.incidente_id,
    accion: registro.accion,
    evolucionCaso: registro.evolucion_caso,
    fecha: registro.fecha,
    funcionarioResponsableId: registro.funcionario_responsable_id,
  }
}

function asegurarSinError(error, mensaje) {
  if (error) {
    throw new Error(`${mensaje}: ${error.message}`)
  }
}

class PersistenciaSistemaSupabase {
  constructor(supabase) {
    this.supabase = supabase
  }

  async guardarIncidente(datosIncidente) {
    validarCamposRequeridos(datosIncidente, CAMPOS_INCIDENTE_REQUERIDOS, 'Incidente')
    validarParticipantes(datosIncidente.participantes)

    const incidenteId = datosIncidente.id || crearId('INC')
    const creadoEn = datosIncidente.creadoEn || new Date().toISOString()

    const { data: incidente, error: errorIncidente } = await this.supabase
      .from('incidentes')
      .insert({
        id: incidenteId,
        titulo: datosIncidente.titulo,
        fecha: datosIncidente.fecha,
        descripcion: datosIncidente.descripcion,
        gravedad: datosIncidente.gravedad,
        estado: 'Abierto',
        funcionario_responsable_id: datosIncidente.funcionarioResponsableId,
        creado_en: creadoEn,
      })
      .select('*')
      .single()

    asegurarSinError(errorIncidente, 'No se pudo guardar el incidente')

    const participantesInsert = datosIncidente.participantes.map((participante) => ({
      id: participante.id || crearId('PAR'),
      incidente_id: incidenteId,
      alumno_institucional_id: participante.alumnoInstitucionalId,
      rol_en_incidente: participante.rolEnIncidente,
      observacion: participante.observacion || null,
    }))

    const { data: participantes, error: errorParticipantes } = await this.supabase
      .from('incidente_participantes')
      .insert(participantesInsert)
      .select('*')

    asegurarSinError(errorParticipantes, 'No se pudieron guardar los participantes del incidente')

    return desdeIncidenteSupabase(
      incidente,
      participantes.map((participante) => desdeParticipanteSupabase(participante))
    )
  }

  async consultarIncidentePorId(incidenteId) {
    const { data: incidente, error } = await this.supabase
      .from('incidentes')
      .select('*')
      .eq('id', incidenteId)
      .maybeSingle()

    asegurarSinError(error, 'No se pudo consultar el incidente')

    if (!incidente) {
      return null
    }

    const participantes = await this.consultarParticipantesPorIncidente(incidenteId)
    return desdeIncidenteSupabase(incidente, participantes)
  }

  async listarIncidentes() {
    const { data: incidentes, error } = await this.supabase
      .from('incidentes')
      .select('*')
      .order('fecha', { ascending: false })

    asegurarSinError(error, 'No se pudieron listar los incidentes')

    return Promise.all(
      incidentes.map(async (incidente) =>
        desdeIncidenteSupabase(
          incidente,
          await this.consultarParticipantesPorIncidente(incidente.id)
        )
      )
    )
  }

  async consultarParticipantesPorIncidente(incidenteId) {
    const { data: participantes, error } = await this.supabase
      .from('incidente_participantes')
      .select('*')
      .eq('incidente_id', incidenteId)

    asegurarSinError(error, 'No se pudieron consultar los participantes del incidente')

    return participantes.map((participante) => desdeParticipanteSupabase(participante))
  }

  async guardarAuditoria(datosAuditoria) {
    validarCamposRequeridos(
      datosAuditoria,
      ['accion', 'fecha', 'funcionarioResponsableId', 'entidad', 'identificadorRelacionado'],
      'Auditoria'
    )

    const { data: auditoria, error } = await this.supabase
    .from('auditorias')
    .insert({
      id: datosAuditoria.id || crearId('AUD'),
      accion: datosAuditoria.accion,
      fecha: datosAuditoria.fecha,
      funcionario_responsable_id: datosAuditoria.funcionarioResponsableId,
      entidad: datosAuditoria.entidad,
      identificador_relacionado: datosAuditoria.identificadorRelacionado,
      gravedad_anterior: datosAuditoria.gravedadAnterior || null,
      gravedad_nueva: datosAuditoria.gravedadNueva || null,
    })
      .select('*')
      .single()

    asegurarSinError(error, 'No se pudo guardar la auditoria')
    return desdeAuditoriaSupabase(auditoria)
  }

  async consultarAuditoriasPorIncidente(incidenteId) {
    const { data: auditorias, error } = await this.supabase
      .from('auditorias')
      .select('*')
      .eq('entidad', 'incidente')
      .eq('identificador_relacionado', incidenteId)

    asegurarSinError(error, 'No se pudieron consultar las auditorias')
    return auditorias.map((auditoria) => desdeAuditoriaSupabase(auditoria))
  }

  async guardarSeguimiento(datosSeguimiento) {
    validarCamposRequeridos(
      datosSeguimiento,
      CAMPOS_SEGUIMIENTO_REQUERIDOS,
      'Seguimiento'
    )

    const incidente = await this.consultarIncidentePorId(datosSeguimiento.incidenteId)

    if (!incidente) {
      throw new ErrorValidacionSistema('No existe el incidente indicado para el seguimiento.')
    }

    const { data: seguimiento, error } = await this.supabase
      .from('seguimientos')
      .insert({
        id: datosSeguimiento.id || crearId('SEG'),
        incidente_id: datosSeguimiento.incidenteId,
        accion: datosSeguimiento.accion,
        evolucion_caso: datosSeguimiento.evolucionCaso,
        fecha: datosSeguimiento.fecha,
        funcionario_responsable_id: datosSeguimiento.funcionarioResponsableId,
      })
      .select('*')
      .single()

    asegurarSinError(error, 'No se pudo guardar el seguimiento')
    return desdeSeguimientoSupabase(seguimiento)
  }

  async consultarSeguimientosPorIncidente(incidenteId) {
    const { data: seguimientos, error } = await this.supabase
      .from('seguimientos')
      .select('*')
      .eq('incidente_id', incidenteId)

    asegurarSinError(error, 'No se pudieron consultar los seguimientos')
    return seguimientos.map((seguimiento) => desdeSeguimientoSupabase(seguimiento))
  }
  async actualizarGravedadIncidente(incidenteId, nuevaGravedad, protocolo) {
    const { data: incidente, error } = await this.supabase
      .from('incidentes')
      .update({
        gravedad: nuevaGravedad,
      })
      .eq('id', incidenteId)
      .select('*')
      .single()

    asegurarSinError(error, 'No se pudo actualizar la gravedad del incidente')

    const participantes = await this.consultarParticipantesPorIncidente(incidenteId)

    return desdeIncidenteSupabase(incidente, participantes)
  }

  async actualizarEstadoIncidente(incidenteId, nuevoEstado) {
    if (!ESTADOS_INCIDENTE.has(nuevoEstado)) {
      throw new ErrorValidacionSistema('El estado del incidente no es valido.')
    }

    const { data: incidente, error } = await this.supabase
      .from('incidentes')
      .update({
        estado: nuevoEstado,
      })
      .eq('id', incidenteId)
      .select('*')
      .single()

    asegurarSinError(error, 'No se pudo actualizar el estado del incidente')

    const participantes = await this.consultarParticipantesPorIncidente(incidenteId)

    return desdeIncidenteSupabase(incidente, participantes)
  }

}

module.exports = PersistenciaSistemaSupabase
