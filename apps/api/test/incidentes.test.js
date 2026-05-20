const test = require('node:test')
const assert = require('node:assert/strict')

const { ErrorValidacionSistema } = require('../src/lib/erroresSistema')
const ServicioIncidentes = require('../src/lib/servicioIncidentes')
const ServicioInstitucional = require('../src/lib/servicioInstitucional')
const {
  PersistenciaSistemaMemoria,
} = require('../src/lib/persistenciaSistema')

test('US01: T03 Test 1: registra un incidente correctamente asociado a un alumno valido', async () => {

  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioInstitucional = new ServicioInstitucional()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional,
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Pelea en recreo',
    fecha: '2026-05-15',
    descripcion: 'Discusion entre alumnos',
    gravedad: 'Alta',
    estado: 'Abierto',
    funcionarioResponsableId: 'FUN-3002',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1001',
        rolEnIncidente: 'Involucrado',
      },
    ],
  })

  assert.ok(incidente.id)

  assert.equal(incidente.titulo, 'Pelea en recreo')

  assert.equal(
    incidente.participantes[0].alumnoInstitucionalId,
    'ALU-1001'
  )
})

test('US01: T03 Test 2: guarda todos los datos obligatorios del incidente', async () => {

  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioInstitucional = new ServicioInstitucional()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional,
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Insulto en sala',
    fecha: '2026-05-15',
    descripcion: 'Alumno insulta a companero',
    gravedad: 'Media',
    estado: 'Abierto',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1002',
        rolEnIncidente: 'Agresor',
      },
    ],
  })

  assert.equal(incidente.titulo, 'Insulto en sala')
  assert.equal(incidente.fecha, '2026-05-15')
  assert.equal(incidente.descripcion, 'Alumno insulta a companero')
  assert.equal(incidente.gravedad, 'Media')
})

test('US01: T03 Test 3: el incidente queda disponible para consulta', async () => {

  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioInstitucional = new ServicioInstitucional()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional,
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Empujon en pasillo',
    fecha: '2026-05-15',
    descripcion: 'Empujon entre estudiantes',
    gravedad: 'Baja',
    estado: 'Abierto',
    funcionarioResponsableId: 'FUN-3003',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1003',
        rolEnIncidente: 'Involucrado',
      },
    ],
  })

  const incidenteConsultado =
    await servicioIncidentes.consultarIncidentePorId(incidente.id)

  assert.ok(incidenteConsultado)

  assert.equal(incidenteConsultado.id, incidente.id)

  assert.equal(
    incidenteConsultado.participantes[0].alumnoInstitucionalId,
    'ALU-1003'
  )
})

test('US01: T05 Test 1: asigna estado inicial Abierto automaticamente', async () => {

  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioInstitucional = new ServicioInstitucional()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional,
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Pelea en recreo',
    fecha: '2026-05-15',
    descripcion: 'Discusion entre alumnos',
    gravedad: 'Alta',
    funcionarioResponsableId: 'FUN-3002',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1001',
        rolEnIncidente: 'Involucrado',
      },
    ],
  })

  assert.equal(incidente.estado, 'Abierto')
})

test('US01: T05 Test 2: incidente queda disponible para gestion posterior', async () => {

  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioInstitucional = new ServicioInstitucional()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional,
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Empujon',
    fecha: '2026-05-15',
    descripcion: 'Empujon entre alumnos',
    gravedad: 'Media',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1002',
        rolEnIncidente: 'Agresor',
      },
    ],
  })

  const incidentes = await persistenciaSistema.listarIncidentes()

  assert.ok(incidentes.length > 0)

  assert.equal(incidentes[0].estado, 'Abierto')

  assert.equal(incidentes[0].id, incidente.id)
})
test('US01: T06 Test 1: registra auditoria al crear incidente', async () => {
  const persistencia = new PersistenciaSistemaMemoria()
  const servicioInstitucional = new ServicioInstitucional()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema: persistencia,
    servicioInstitucional,
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Pelea en recreo',
    fecha: '2026-05-14',
    descripcion: 'Discusion entre alumnos',
    gravedad: 'Alta',
    funcionarioResponsableId: 'FUN-3002',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1001',
        rolEnIncidente: 'Involucrado',
      },
    ],
  })

  const auditorias = await persistencia.consultarAuditoriasPorIncidente(incidente.id)

  assert.equal(auditorias.length, 1)
})

test('US01: T06 Test 2: guarda los datos minimos de auditoria', async () => {
  const persistencia = new PersistenciaSistemaMemoria()
  const servicioInstitucional = new ServicioInstitucional()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema: persistencia,
    servicioInstitucional,
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Pelea en recreo',
    fecha: '2026-05-14',
    descripcion: 'Discusion entre alumnos',
    gravedad: 'Alta',
    funcionarioResponsableId: 'FUN-3002',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1001',
        rolEnIncidente: 'Involucrado',
      },
    ],
  })

  const auditorias = await persistencia.consultarAuditoriasPorIncidente(incidente.id)

  const auditoria = auditorias[0]

  assert.equal(auditoria.accion, 'CREAR_INCIDENTE')
  assert.ok(auditoria.fecha)
  assert.equal(auditoria.funcionarioResponsableId, 'FUN-3002')
  assert.equal(auditoria.identificadorRelacionado, incidente.id)
})

test('US01: T06 Test 3: no registra auditoria si el incidente es invalido', async () => {
  const persistencia = new PersistenciaSistemaMemoria()
  const servicioInstitucional = new ServicioInstitucional()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema: persistencia,
    servicioInstitucional,
  })

  await assert.rejects(
    () =>
      servicioIncidentes.registrarIncidente({
        titulo: 'Pelea en recreo',
        fecha: '2026-05-14',
        descripcion: 'Discusion entre alumnos',
        gravedad: 'Alta',

        // funcionario invalido
        funcionarioResponsableId: 'FUN-9999',

        participantes: [
          {
            alumnoInstitucionalId: 'ALU-1001',
            rolEnIncidente: 'Involucrado',
          },
        ],
      }),
    ErrorValidacionSistema
  )

  const auditorias = Array.from(persistencia.auditorias.values())

  assert.equal(auditorias.length, 0)
})