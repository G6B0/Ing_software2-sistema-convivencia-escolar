const { envio, paso } = require('./impresora')

class SeguimientoReincidencia {
  constructor(persistencia, auditoria) {
    this.persistencia = persistencia
    this.auditoria = auditoria
    this.umbralReincidencia = 1
  }

  registrarAccion(incidente, accion, usuario) {
    paso(
      'Seguimiento y Reincidencia',
      `Recibe accion de seguimiento para ${incidente.id}: ${accion}.`
    )

    const seguimiento = {
      id: `SEG-${incidente.id}`,
      incidenteId: incidente.id,
      accion,
      responsable: usuario.nombre,
      fecha: '2026-04-23',
    }

    envio('Seguimiento y Reincidencia', 'Persistencia', 'accion de seguimiento')
    this.persistencia.guardarSeguimiento(seguimiento)

    envio('Seguimiento y Reincidencia', 'Auditoria y Trazabilidad', 'registro de seguimiento')
    this.auditoria.registrar(
      'SEGUIMIENTO',
      'Incidente',
      `Se registro seguimiento en ${incidente.id}.`,
      usuario
    )

    paso(
      'Seguimiento y Reincidencia',
      'Accion registrada y disponible para orientacion y convivencia escolar.'
    )

    return seguimiento
  }

  evaluarReincidencia(alumno) {
    paso(
      'Seguimiento y Reincidencia',
      `Solicita historial del alumno ${alumno.id} para calcular reincidencia.`
    )

    envio('Seguimiento y Reincidencia', 'Persistencia', 'consulta de historial por alumno')
    const historial = this.persistencia.buscarIncidentesPorAlumno(alumno.id)
    const total = historial.length
    const superaUmbral = total > this.umbralReincidencia

    paso(
      'Seguimiento y Reincidencia',
      `Resultado: ${alumno.nombre} tiene ${total} incidente(s). Supera umbral: ${superaUmbral ? 'si' : 'no'}.`
    )

    return {
      alumno,
      total,
      superaUmbral,
    }
  }
}

module.exports = SeguimientoReincidencia
