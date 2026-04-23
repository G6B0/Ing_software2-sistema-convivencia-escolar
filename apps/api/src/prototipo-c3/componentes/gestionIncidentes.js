const { envio, paso } = require('./impresora')

class GestionIncidentes {
  constructor(persistencia, auditoria) {
    this.persistencia = persistencia
    this.auditoria = auditoria
    this.siguienteId = 1
  }

  registrarIncidente(solicitud, alumno, usuario) {
    paso(
      'Gestion de Incidentes',
      `Recibe desde API REST la solicitud para registrar "${solicitud.titulo}".`
    )

    const gravedad = this.clasificarGravedad(solicitud.descripcion)
    const protocolo = this.asociarProtocolo(gravedad)

    const incidente = {
      id: `INC-${String(this.siguienteId).padStart(3, '0')}`,
      titulo: solicitud.titulo,
      descripcion: solicitud.descripcion,
      fecha: solicitud.fecha,
      estado: 'abierto',
      gravedad,
      protocolo,
      alumno,
      reportadoPor: usuario.nombre,
    }

    this.siguienteId += 1

    paso(
      'Gestion de Incidentes',
      `Clasifica gravedad como ${gravedad} y asocia ${protocolo}.`
    )

    envio('Gestion de Incidentes', 'Persistencia', 'incidente nuevo')
    this.persistencia.guardarIncidente(incidente)

    envio('Gestion de Incidentes', 'Auditoria y Trazabilidad', 'creacion de incidente')
    this.auditoria.registrar(
      'CREACION',
      'Incidente',
      `Se creo ${incidente.id} para ${alumno.nombre}.`,
      usuario
    )

    paso(
      'Gestion de Incidentes',
      `Devuelve incidente ${incidente.id} a API REST para continuar el flujo.`
    )

    return incidente
  }

  cerrarIncidente(incidente, usuario) {
    paso(
      'Gestion de Incidentes',
      `Cambia estado del incidente ${incidente.id} desde ${incidente.estado} a cerrado.`
    )

    incidente.estado = 'cerrado'

    envio('Gestion de Incidentes', 'Auditoria y Trazabilidad', 'cambio de estado')
    this.auditoria.registrar(
      'CAMBIO_ESTADO',
      'Incidente',
      `Se cerro ${incidente.id}.`,
      usuario
    )

    return incidente
  }

  clasificarGravedad(descripcion) {
    return descripcion.toLowerCase().includes('agresion') ? 'alta' : 'media'
  }

  asociarProtocolo(gravedad) {
    return gravedad === 'alta' ? 'Protocolo de convivencia grave' : 'Protocolo de mediacion'
  }
}

module.exports = GestionIncidentes
