const ConsultaDatosInstitucionales = require('./componentes/consultaDatosInstitucionales')
const { titulo } = require('./componentes/impresora')

const consulta = new ConsultaDatosInstitucionales()

titulo('TEST - Consulta de Datos Institucionales')

// Prueba 1: obtener un alumno
console.log('\n=== Obtener alumno ALU-1002 ===')
console.log(consulta.obtenerAlumno('ALU-1002'))

// Prueba 2: obtener apoderados
console.log('\n=== Obtener apoderados ALU-100 ===')
console.log(consulta.obtenerApoderados('ALU-100'))


titulo('FIN DEL TEST')