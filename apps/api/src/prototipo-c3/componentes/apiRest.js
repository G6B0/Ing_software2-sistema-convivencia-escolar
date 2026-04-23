const { envio, paso } = require('./impresora')

class ApiRest {
  constructor(componentes) {
    this.auth = componentes.auth
    this.consultaInstitucional = componentes.consultaInstitucional
    this.gestionIncidentes = componentes.gestionIncidentes
    this.seguimientoReincidencia = componentes.seguimientoReincidencia
    this.notificaciones = componentes.notificaciones
    this.reportesEstadisticas = componentes.reportesEstadisticas
  }

  ejecutarCasoDemostracion() {
    paso(
      'API REST',
      'Recibe POST /login desde la UI con credenciales de un funcionario.'
    )

    envio('API REST', 'Autenticacion y Autorizacion', 'credenciales institucionales')
    const usuario = this.auth.iniciarSesion({
      email: 'ana.morales@colegio.cl',
      password: '********',
    })

    paso(
      'API REST',
      'Recibe POST /incidentes desde la UI para registrar un problema de convivencia.'
    )

    envio('API REST', 'Autenticacion y Autorizacion', 'permiso registrar_incidente')
    this.auth.verificarPermiso(usuario, 'registrar_incidente')

    envio('API REST', 'Consulta de Datos Institucionales', 'identificador del alumno')
    const alumno = this.consultaInstitucional.obtenerAlumno('ALU-1001')

    envio('API REST', 'Gestion de Incidentes', 'datos del incidente y alumno validado')
    const incidente = this.gestionIncidentes.registrarIncidente(
      {
        titulo: 'Conflicto en recreo',
        descripcion: 'Se reporta agresion verbal durante el recreo.',
        fecha: '2026-04-23',
      },
      alumno,
      usuario
    )

    envio('API REST', 'Seguimiento y Reincidencia', 'accion inicial de seguimiento')
    this.seguimientoReincidencia.registrarAccion(
      incidente,
      'Orientacion cita al estudiante para entrevista inicial',
      usuario
    )

    envio('API REST', 'Seguimiento y Reincidencia', 'solicitud de calculo de reincidencia')
    const reincidencia = this.seguimientoReincidencia.evaluarReincidencia(alumno)

    envio('API REST', 'Consulta de Datos Institucionales', 'solicitud de apoderados')
    const apoderados = this.consultaInstitucional.obtenerApoderados(alumno.id)

    envio('API REST', 'Notificaciones', 'incidente y apoderados')
    this.notificaciones.notificarApoderados(incidente, apoderados)
    this.notificaciones.alertarEquipoConvivencia(reincidencia)

    envio('API REST', 'Reportes y Estadisticas', 'solicitud de resumen por curso')
    const reporte = this.reportesEstadisticas.generarResumenPorCurso(alumno.curso)

    paso(
      'API REST',
      `Responde a la UI con incidente ${incidente.id}, estado ${incidente.estado}, y reporte del curso ${reporte.curso}.`
    )
  }
}

module.exports = ApiRest
