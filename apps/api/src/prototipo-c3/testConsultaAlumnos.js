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

const alumnoIdInvalido = 'ALU-101' //Aca se puede cambiar el alumno por uno que exista en el json

console.log(`\n=== Intentando registrar incidente para alumno: ${alumnoIdInvalido} ===`)

try {
  // Primero valida si el alumno existe
  const alumno = consultaInstitucional.obtenerAlumno(alumnoIdInvalido)

  // Si no lanza error (no debería llegar aquí), registra el incidente
  gestionIncidentes.registrarIncidente(solicitud, alumno, usuario)
  console.log('ERROR DEL TEST: Se registró un incidente para un alumno inexistente.')

} catch (error) {
  console.log(`\nCorrecto: El sistema detuvo el flujo con el mensaje: "${error.message}"`)
  console.log('Correcto: No se almacenó ningún incidente.')

  // Verificación extra: confirmar que persistencia está vacía
  const incidentes = persistencia.obtenerIncidentes?.() ?? persistencia.incidentes ?? []
  console.log(`Incidentes almacenados en persistencia: ${incidentes.length}`)
}

titulo('FIN DEL TEST')