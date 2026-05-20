const fs = require('fs')
const path = require('path')
const ConsultaDatosInstitucionales = require('./componentes/consultaDatosInstitucionales')
const GestionIncidentes = require('./componentes/gestionIncidentes')
const Persistencia = require('./componentes/persistencia')
const AuditoriaTrazabilidad = require('./componentes/auditoriaTrazabilidad')
const { titulo } = require('./componentes/impresora')

// Carga funcionarios desde institucional.json
const { funcionarios } = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/institucional.json'), 'utf-8')
)

// Setup
const persistencia = new Persistencia()
const auditoria = new AuditoriaTrazabilidad(persistencia)
const consultaInstitucional = new ConsultaDatosInstitucionales()
const gestionIncidentes = new GestionIncidentes(persistencia, auditoria)

const usuario = funcionarios.find(f => f.id === 'FUN-3001')
const solicitud = {
  titulo: 'Agresion en patio',
  descripcion: 'El alumno protagonizo una agresion durante el recreo.',
  fecha: '2025-05-13',
}

titulo('TEST - Funcionario Responsable en Incidente')

// --- CA1: Registrar funcionario responsable al crear incidente ---
console.log('\n=== CA1: El incidente queda asociado al funcionario que lo registró ===')
try {
  const alumno = consultaInstitucional.obtenerAlumno('ALU-1001')
  const incidente = gestionIncidentes.registrarIncidente(solicitud, alumno, usuario)

  if (incidente.funcionarioResponsable?.nombre === usuario.nombre) {
    console.log(`CORRECTO: Incidente ${incidente.id} asociado a "${incidente.funcionarioResponsable.nombre}" (${incidente.funcionarioResponsable.rol})`)
  } else {
    console.log('FALLO: El incidente no quedo asociado al funcionario responsable.')
  }

  // --- CA2: Consultar detalle y verificar que se mantiene la información ---
  console.log('\n=== CA2: El sistema mantiene la información del funcionario en el detalle ===')
  const detalle = gestionIncidentes.obtenerDetalle(incidente.id)

  if (detalle.funcionarioResponsable?.nombre === usuario.nombre) {
    console.log(`CORRECTO: Detalle del incidente ${detalle.id} mantiene al funcionario "${detalle.funcionarioResponsable.nombre}".`)
    console.log('   Informacion completa del funcionario:', detalle.funcionarioResponsable)
  } else {
    console.log('FALLO: El detalle no mantiene la informacion del funcionario responsable.')
  }

} catch (error) {
  console.error('ERROR INESPERADO:', error.message)
}

titulo('FIN DEL TEST')