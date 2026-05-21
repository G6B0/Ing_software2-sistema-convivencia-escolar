const fs = require('fs')
const path = require('path')
const ConsultaDatosInstitucionales = require('./componentes/consultaDatosInstitucionales')
const GestionIncidentes = require('./componentes/gestionIncidentes')
const SeguimientoReincidencia = require('./componentes/seguimientoReincidencia')
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
const seguimientoReincidencia = new SeguimientoReincidencia(persistencia, auditoria)

const usuario = funcionarios.find(f => f.id === 'FUN-3001')
const solicitud = {
  titulo: 'Agresion en patio',
  descripcion: 'El alumno protagonizo una agresion durante el recreo.',
  fecha: '2025-05-13',
}

titulo('TEST - Validacion de Incidente antes de Registrar Seguimiento')

// Registrar un incidente valido para usar en Test 2
const alumno = consultaInstitucional.obtenerAlumno('ALU-1001')
const incidente = gestionIncidentes.registrarIncidente(solicitud, alumno, usuario)

// --- Test 1: Rechazo por incidente inexistente ---
console.log('\n=== Test 1: Rechazo de registro por incidente inexistente ===')
try {
  gestionIncidentes.registrarSeguimiento('INC-999', 'Llamado de apoderado', usuario)
  console.log('FALLO: Se registro seguimiento en un incidente inexistente.')
} catch (error) {
  console.log('CORRECTO: El sistema rechazo el registro.')
  console.log('Mensaje:', error.message)
}

// --- Test 2: Validacion exitosa de incidente existente ---
console.log('\n=== Test 2: Validacion exitosa de incidente existente ===')
try {
  const incidenteValidado = gestionIncidentes.registrarSeguimiento(incidente.id, 'Llamado de apoderado', usuario)
  const seguimiento = seguimientoReincidencia.registrarAccion(incidenteValidado, 'Llamado de apoderado', usuario)
  console.log('CORRECTO: Validacion exitosa, seguimiento registrado.')
  console.log('Seguimiento:', seguimiento)
} catch (error) {
  console.log('FALLO:', error.message)
}

// --- Test 3: Identificador nulo o invalido ---
console.log('\n=== Test 3: Manejo de identificador nulo o invalido ===')
try {
  gestionIncidentes.registrarSeguimiento(null, 'Llamado de apoderado', usuario)
  console.log('FALLO: Se permitio un identificador nulo.')
} catch (error) {
  console.log('CORRECTO: El sistema bloqueo el registro antes de consultar la base de datos.')
  console.log('Mensaje:', error.message)
}

titulo('FIN DEL TEST')