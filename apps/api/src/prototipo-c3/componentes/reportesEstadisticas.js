const { envio, paso } = require('./impresora')

class ReportesEstadisticas {
  constructor(persistencia) {
    this.persistencia = persistencia
  }

  generarResumenPorCurso(curso) {
    paso(
      'Reportes y Estadisticas',
      `Recibe solicitud de reporte para el curso ${curso}.`
    )

    envio('Reportes y Estadisticas', 'Persistencia', 'consulta de incidentes')
    const incidentes = this.persistencia
      .listarIncidentes()
      .filter((incidente) => incidente.alumno.curso === curso)

    const resumen = {
      curso,
      total: incidentes.length,
      porGravedad: incidentes.reduce((acumulador, incidente) => {
        acumulador[incidente.gravedad] = (acumulador[incidente.gravedad] || 0) + 1
        return acumulador
      }, {}),
    }

    paso(
      'Reportes y Estadisticas',
      `Genera metricas: total ${resumen.total}, gravedad ${JSON.stringify(resumen.porGravedad)}.`
    )

    paso(
      'Reportes y Estadisticas',
      'Entrega el resumen a API REST para que pueda mostrarse al funcionario.'
    )

    return resumen
  }
}

module.exports = ReportesEstadisticas
