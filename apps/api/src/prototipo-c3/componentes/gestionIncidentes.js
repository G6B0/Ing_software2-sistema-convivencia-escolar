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
      funcionarioResponsable: {
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
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

  obtenerDetalle(incidenteId) {//se mantiene el incidenteId pues de este modo cuando se busca en persistencia solo se busca con el ID como deberia ser
    paso(
      'Gestion de Incidentes',
      `Consulta detalle del incidente ${incidenteId}.`
    )

    const incidente = this.persistencia.obtenerIncidente(incidenteId)

    if (!incidente) {
      throw new Error(`Incidente ${incidenteId} no existe.`)
    }

    paso(
      'Gestion de Incidentes',
      `Devuelve detalle de ${incidenteId} con funcionario responsable: ${incidente.funcionarioResponsable.nombre}.`
    )

    return incidente
  }

  registrarSeguimiento(incidenteId, accion, usuario) {
    paso(
      'Gestion de Incidentes',
      `Recibe solicitud para registrar seguimiento en incidente ${incidenteId}.`
    )

    // Test 3: validar que el identificador no sea nulo o invalido
    if (!incidenteId || typeof incidenteId !== 'string' || incidenteId.trim() === '') {
      throw new Error('Identificador de incidente nulo o invalido.')
    }

    // Test 1: validar que el incidente existe
    const incidente = this.persistencia.obtenerIncidente(incidenteId)

    if (!incidente) {
      throw new Error(`Incidente ${incidenteId} no existe en el sistema.`)
    }

    paso(
      'Gestion de Incidentes',
      `Incidente ${incidenteId} validado correctamente. Continuando con el registro.`
    )

    // Test 2: flujo exitoso, delega en seguimientoReincidencia
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
