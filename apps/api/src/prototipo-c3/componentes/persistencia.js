const { paso } = require('./impresora')

class Persistencia {
  constructor() {
    this.incidentes = []
    this.seguimientos = []
    this.auditorias = []
  }

  guardarIncidente(incidente) {
    paso(
      'Persistencia',
      `Recibe incidente "${incidente.titulo}" y lo guarda en la Base de Datos del Sistema.`
    )

    this.incidentes.push(incidente)

    paso(
      'Persistencia',
      `Confirma almacenamiento del incidente ${incidente.id} a Gestion de Incidentes.`
    )

    return incidente
  }

  guardarSeguimiento(seguimiento) {
    paso(
      'Persistencia',
      `Guarda accion de seguimiento para el incidente ${seguimiento.incidenteId}.`
    )

    this.seguimientos.push(seguimiento)
    return seguimiento
  }

  guardarAuditoria(evento) {
    paso(
      'Persistencia',
      `Registra auditoria: ${evento.accion} sobre ${evento.entidad}.`
    )

    this.auditorias.push(evento)
    return evento
  }

  buscarIncidentesPorAlumno(alumnoId) {
    paso(
      'Persistencia',
      `Consulta incidentes historicos del alumno ${alumnoId} en la Base de Datos del Sistema.`
    )

    return this.incidentes.filter((incidente) => incidente.alumno.id === alumnoId)
  }

  listarIncidentes() {
    paso('Persistencia', 'Entrega todos los incidentes guardados a Reportes y Estadisticas.')
    return this.incidentes
  }
}

module.exports = Persistencia
