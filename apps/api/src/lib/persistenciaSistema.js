const { randomUUID } = require('node:crypto')
const { ErrorValidacionSistema } = require('./erroresSistema')

const CAMPOS_INCIDENTE_REQUERIDOS = [
  'titulo',
  'fecha',
  'descripcion',
  'gravedad',
  'funcionarioResponsableId',
]

const ESTADOS_INCIDENTE = new Set(['Abierto', 'Cerrado', 'Reabierto'])
const GRAVEDADES_INCIDENTE = new Set([
  'Leve',
  'Moderado',
  'Grave',
])

const ROLES_PARTICIPANTE_INCIDENTE = new Set(['Agresor', 'Victima', 'Testigo', 'Involucrado'])
const CAMPOS_SEGUIMIENTO_REQUERIDOS = [
  'incidenteId',
  'accion',
  'evolucionCaso',
  'fecha',
  'funcionarioResponsableId',
]

function crearId(prefijo) {
  if (prefijo === 'INC') {

  const fecha = new Date()

  const yyyymmdd =
    fecha.getFullYear().toString() +
    String(fecha.getMonth() + 1).padStart(2, '0') +
    String(fecha.getDate()).padStart(2, '0')

  return `${prefijo}-${yyyymmdd}-${randomUUID().slice(0, 6)}`
}

return `${prefijo}-${randomUUID().slice(0, 8)}`
}

function validarCamposRequeridos(registro, campos, nombreEntidad) {
  const camposFaltantes = campos.filter((campo) => !registro[campo])

  if (camposFaltantes.length > 0) {
    throw new ErrorValidacionSistema(
      `${nombreEntidad} incompleto. Faltan campos requeridos: ${camposFaltantes.join(', ')}.`
    )
  }
}

class PersistenciaSistemaMemoria {
  constructor() {
    this.incidentes = new Map()
    this.incidenteParticipantes = new Map()
    this.seguimientos = new Map()
    this.auditorias = new Map()
  }

  async guardarIncidente(datosIncidente) {
    validarCamposRequeridos(datosIncidente, CAMPOS_INCIDENTE_REQUERIDOS, 'Incidente')
    validarParticipantes(datosIncidente.participantes)

    if (!GRAVEDADES_INCIDENTE.has(datosIncidente.gravedad)) {
      throw new ErrorValidacionSistema('La gravedad del incidente no es valida.')
    }
    const incidente = {
      id: datosIncidente.id || crearId('INC'),
      titulo: datosIncidente.titulo,
      fecha: datosIncidente.fecha,
      descripcion: datosIncidente.descripcion,
      gravedad: datosIncidente.gravedad,
      protocolo: datosIncidente.protocolo,
      estado: 'Abierto',
      funcionarioResponsableId: datosIncidente.funcionarioResponsableId,
      creadoEn: datosIncidente.creadoEn || new Date().toISOString(),
    }

    this.incidentes.set(incidente.id, incidente)

    const participantes = datosIncidente.participantes.map((participante) => ({
      id: participante.id || crearId('PAR'),
      incidenteId: incidente.id,
      alumnoInstitucionalId: participante.alumnoInstitucionalId,
      rolEnIncidente: participante.rolEnIncidente,
      observacion: participante.observacion || null,
    }))

    participantes.forEach((participante) => {
      this.incidenteParticipantes.set(participante.id, participante)
    })

    return {
      ...incidente,
      participantes,
    }
  }

  async actualizarGravedadIncidente(
    incidenteId,
    nuevaGravedad,
    protocolo
  ) {
    const incidente = this.incidentes.get(incidenteId)

    if (!incidente) {
      throw new ErrorValidacionSistema(
        'El incidente no existe.'
      )
    }

    if (!GRAVEDADES_INCIDENTE.has(nuevaGravedad)) {
      throw new ErrorValidacionSistema(
        'La gravedad del incidente no es valida.'
      )
    }

    incidente.gravedad = nuevaGravedad
    incidente.protocolo = protocolo

    this.incidentes.set(incidenteId, incidente)

    return incidente
  }

  async consultarIncidentePorId(incidenteId) {
    const incidente = this.incidentes.get(incidenteId)

    if (!incidente) {
      return null
    }

    return {
      ...incidente,
      participantes: await this.consultarParticipantesPorIncidente(incidenteId),
    }
  }

  async listarIncidentes() {
    return Promise.all(
      Array.from(this.incidentes.keys()).map((incidenteId) =>
        this.consultarIncidentePorId(incidenteId)
      )
    )
  }

  async consultarParticipantesPorIncidente(incidenteId) {
    return Array.from(this.incidenteParticipantes.values()).filter(
      (participante) => participante.incidenteId === incidenteId
    )
  }

  async guardarAuditoria(datosAuditoria) {
    validarCamposRequeridos(
      datosAuditoria,
      [
        'accion',
        'fecha',
        'funcionarioResponsableId',
        'entidad',
        'identificadorRelacionado',
      ],
      'Auditoria'
    )

    const auditoria = {
      id: datosAuditoria.id || crearId('AUD'),
      ...datosAuditoria,
    }

    this.auditorias.set(auditoria.id, auditoria)

    return auditoria
  }

  async consultarAuditoriasPorIncidente(incidenteId) {
    return Array.from(this.auditorias.values()).filter(
      (auditoria) =>
        auditoria.entidad === 'incidente' && auditoria.identificadorRelacionado === incidenteId
    )
  }

  async guardarSeguimiento(datosSeguimiento) {
    validarCamposRequeridos(
      datosSeguimiento,
      CAMPOS_SEGUIMIENTO_REQUERIDOS,
      'Seguimiento'
    )

    if (!this.incidentes.has(datosSeguimiento.incidenteId)) {
      throw new ErrorValidacionSistema('No existe el incidente indicado para el seguimiento.')
    }

    const seguimiento = {
      id: datosSeguimiento.id || crearId('SEG'),
      incidenteId: datosSeguimiento.incidenteId,
      accion: datosSeguimiento.accion,
      evolucionCaso: datosSeguimiento.evolucionCaso,
      fecha: datosSeguimiento.fecha,
      funcionarioResponsableId: datosSeguimiento.funcionarioResponsableId,
    }

    this.seguimientos.set(seguimiento.id, seguimiento)
    return seguimiento
  }

  async consultarSeguimientosPorIncidente(incidenteId) {
    return Array.from(this.seguimientos.values()).filter(
      (seguimiento) => seguimiento.incidenteId === incidenteId
    )
  }
}

module.exports = {
  CAMPOS_INCIDENTE_REQUERIDOS,
  CAMPOS_SEGUIMIENTO_REQUERIDOS,
  crearId,
  ESTADOS_INCIDENTE,
  GRAVEDADES_INCIDENTE,
  PersistenciaSistemaMemoria,
  ROLES_PARTICIPANTE_INCIDENTE,
  validarCamposRequeridos,
  validarParticipantes,
}

function validarParticipantes(participantes) {
  if (!Array.isArray(participantes) || participantes.length === 0) {
    throw new ErrorValidacionSistema('El incidente debe tener al menos un participante.')
  }

  participantes.forEach((participante) => {
    validarCamposRequeridos(
      participante,
      ['alumnoInstitucionalId', 'rolEnIncidente'],
      'Participante del incidente'
    )

    if (!ROLES_PARTICIPANTE_INCIDENTE.has(participante.rolEnIncidente)) {
      throw new ErrorValidacionSistema('El rol del participante en el incidente no es valido.')
    }
  })
}
