const esquemaSistema = {
  incidentes: {
    descripcion: 'Incidentes escolares registrados por el sistema.',
    campos: {
      id: { tipo: 'string', requerido: true, unico: true },
      titulo: { tipo: 'string', requerido: true },
      fecha: { tipo: 'string', requerido: true },
      descripcion: { tipo: 'string', requerido: true },
      gravedad: { tipo: 'string', requerido: true },
      estado: {
        tipo: 'string',
        requerido: true,
        valoresPermitidos: ['Abierto', 'En seguimiento', 'Cerrado'],
      },
      funcionarioResponsableId: {
        tipo: 'string',
        requerido: true,
        referencia: 'Base de Datos Institucionales.funcionarios.id',
      },
      creadoEn: { tipo: 'string', requerido: true },
    },
  },
  incidenteParticipantes: {
    descripcion: 'Alumnos institucionales asociados a un incidente y su rol dentro del hecho.',
    campos: {
      id: { tipo: 'string', requerido: true, unico: true },
      incidenteId: { tipo: 'string', requerido: true, referencia: 'incidentes.id' },
      alumnoInstitucionalId: {
        tipo: 'string',
        requerido: true,
        referencia: 'Base de Datos Institucionales.alumnos.id',
      },
      rolEnIncidente: {
        tipo: 'string',
        requerido: true,
        valoresPermitidos: ['Agresor', 'Victima', 'Testigo', 'Involucrado'],
      },
      observacion: { tipo: 'string', requerido: false },
    },
  },
  seguimientos: {
    descripcion: 'Acciones de seguimiento asociadas a incidentes.',
    campos: {
      id: { tipo: 'string', requerido: true, unico: true },
      incidenteId: { tipo: 'string', requerido: true, referencia: 'incidentes.id' },
      accion: { tipo: 'string', requerido: true },
      evolucionCaso: { tipo: 'string', requerido: true },
      fecha: { tipo: 'string', requerido: true },
      funcionarioResponsableId: {
        tipo: 'string',
        requerido: true,
        referencia: 'Base de Datos Institucionales.funcionarios.id',
      },
    },
  },
  auditorias: {
    descripcion: 'Trazabilidad de operaciones criticas del sistema.',
    campos: {
      id: { tipo: 'string', requerido: true, unico: true },
      accion: { tipo: 'string', requerido: true },
      fecha: { tipo: 'string', requerido: true },
      funcionarioResponsableId: {
        tipo: 'string',
        requerido: true,
        referencia: 'Base de Datos Institucionales.funcionarios.id',
      },
      entidad: { tipo: 'string', requerido: true },
      identificadorRelacionado: { tipo: 'string', requerido: true },
    },
  },
  notificaciones: {
    descripcion: 'Notificaciones generadas para el director al registrar incidentes graves.',
    campos: {
      id: { tipo: 'string', requerido: true, unico: true },
      titulo: { tipo: 'string', requerido: true },
      incidenteId: { tipo: 'string', requerido: true, referencia: 'incidentes.id' },
      fechaCreacion: { tipo: 'string', requerido: true },
      leida: { tipo: 'boolean', requerido: true },
      destinatarioId: {
        tipo: 'string',
        requerido: true,
        referencia: 'Base de Datos Institucionales.funcionarios.id',
      },
    },
  },
  protocolos: {
    descripcion: 'Protocolos de acción según gravedad del incidente.',
    campos: {
      gravedad: { tipo: 'string', requerido: true, unico: true, valoresPermitidos: ['Leve', 'Moderado', 'Grave'] },
      descripcion: { tipo: 'string', requerido: true },
    },
  },
}

const tablasDelSistema = Object.freeze(Object.keys(esquemaSistema))

module.exports = {
  esquemaSistema,
  tablasDelSistema,
}
