const ConsultaDatosInstitucionales = require('./componentes/consultaDatosInstitucionales')
const GestionIncidentes = require('./componentes/gestionIncidentes')
const Persistencia = require('./componentes/persistencia')
const AuditoriaTrazabilidad = require('./componentes/auditoriaTrazabilidad')
const { titulo } = require('./componentes/impresora')

titulo('TEST - No guardar incidente si alumno no existe')

const persistencia = new Persistencia()
const auditoria = new AuditoriaTrazabilidad(persistencia)
const consultaInstitucional = new ConsultaDatosInstitucionales()
const gestionIncidentes = new GestionIncidentes(persistencia, auditoria)

const usuario = { nombre: 'Prof. Martínez', rol: 'docente' }

const solicitud = {
  titulo: 'Agresión en patio',
  descripcion: 'El alumno protagonizó una agresión durante el recreo.',
  fecha: '2025-05-13',
}

const alumnoIdInvalido = 'ALU-9999' // Aca se puede cambiar por otro alumno inexistente para probar el rechazo

console.log(`\n=== Intentando registrar incidente para alumno: ${alumnoIdInvalido} ===`)

try {
  // Primero valida si el alumno existe
  const alumno = consultaInstitucional.obtenerAlumno(alumnoIdInvalido)

  // Si no lanza error (no debería llegar aquí), registra el incidente
  gestionIncidentes.registrarIncidente(solicitud, alumno, usuario)
  throw new Error('ERROR DEL TEST: Se registró un incidente para un alumno inexistente.')

} catch (error) {
  if (error.message.startsWith('ERROR DEL TEST')) {
    throw error
  }

  console.log(`\nCorrecto: El sistema detuvo el flujo con el mensaje: "${error.message}"`)
  console.log('Correcto: No se almacenó ningún incidente.')

  // Verificación extra: confirmar que persistencia está vacía
  const incidentes = persistencia.obtenerIncidentes?.() ?? persistencia.incidentes ?? []
  console.log(`Incidentes almacenados en persistencia: ${incidentes.length}`)

  if (incidentes.length !== 0) {
    throw new Error('ERROR DEL TEST: Persistencia contiene incidentes para un alumno inexistente.')
  }
}

titulo('FIN DEL TEST')
