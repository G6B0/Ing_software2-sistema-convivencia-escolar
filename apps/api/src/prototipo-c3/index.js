const ApiRest = require('./componentes/apiRest')
const AuditoriaTrazabilidad = require('./componentes/auditoriaTrazabilidad')
const AutenticacionAutorizacion = require('./componentes/autenticacionAutorizacion')
const ConsultaDatosInstitucionales = require('./componentes/consultaDatosInstitucionales')
const GestionIncidentes = require('./componentes/gestionIncidentes')
const Notificaciones = require('./componentes/notificaciones')
const Persistencia = require('./componentes/persistencia')
const ReportesEstadisticas = require('./componentes/reportesEstadisticas')
const SeguimientoReincidencia = require('./componentes/seguimientoReincidencia')
const { titulo } = require('./componentes/impresora')

function crearSistema() {
  const persistencia = new Persistencia()
  const auditoria = new AuditoriaTrazabilidad(persistencia)

  const componentes = {
    auth: new AutenticacionAutorizacion(),
    consultaInstitucional: new ConsultaDatosInstitucionales(),
    gestionIncidentes: new GestionIncidentes(persistencia, auditoria),
    seguimientoReincidencia: new SeguimientoReincidencia(persistencia, auditoria),
    notificaciones: new Notificaciones(),
    reportesEstadisticas: new ReportesEstadisticas(persistencia),
  }

  return new ApiRest(componentes)
}

titulo('PROTOTIPO C3 - Sistema de Convivencia Escolar')
console.log('Componentes: API REST, Autenticacion y Autorizacion, Consulta de Datos')
console.log('Institucionales, Gestion de Incidentes, Seguimiento y Reincidencia,')
console.log('Notificaciones, Auditoria y Trazabilidad, Persistencia, Reportes y Estadisticas.')

const apiRest = crearSistema()
apiRest.ejecutarCasoDemostracion()

titulo('FIN DEL PROTOTIPO')
