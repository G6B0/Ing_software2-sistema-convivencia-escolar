const { envio, paso } = require('./impresora')

class AuditoriaTrazabilidad {
  constructor(persistencia) {
    this.persistencia = persistencia
  }

  registrar(accion, entidad, detalle, usuario) {
    paso(
      'Auditoria y Trazabilidad',
      `Recibe evento critico: ${accion} en ${entidad}.`
    )

    const evento = {
      accion,
      entidad,
      detalle,
      usuario: usuario.nombre,
      fecha: '2026-04-23T10:00:00',
    }

    envio('Auditoria y Trazabilidad', 'Persistencia', 'evento de auditoria')
    this.persistencia.guardarAuditoria(evento)

    paso(
      'Auditoria y Trazabilidad',
      'Evento guardado para mantener historial y trazabilidad del sistema.'
    )

    return evento
  }
}

module.exports = AuditoriaTrazabilidad
