const test = require('node:test')
const assert = require('node:assert/strict')


const { ErrorValidacionSistema } = require('../src/lib/erroresSistema')
const ServicioIncidentes = require('../src/lib/servicioIncidentes')
const ServicioInstitucional = require('../src/lib/servicioInstitucional')
const {
  PersistenciaSistemaMemoria,
} = require('../src/lib/persistenciaSistema')

function obtenerFechaFuturaISO() {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + 1)

  const yyyy = fecha.getFullYear()
  const mm = String(fecha.getMonth() + 1).padStart(2, '0')
  const dd = String(fecha.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

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
    gravedad: 'Grave',
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
    gravedad: 'Moderado',
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
  assert.equal(incidente.gravedad, 'Moderado')
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
    gravedad: 'Leve',
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
    gravedad: 'Grave',
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
    gravedad: 'Moderado',
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

test('US01: rechaza registrar incidentes con fecha futura', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional: new ServicioInstitucional(),
  })

  await assert.rejects(
    () =>
      servicioIncidentes.registrarIncidente({
        titulo: 'Incidente futuro',
        fecha: obtenerFechaFuturaISO(),
        descripcion: 'Fecha invalida para un incidente',
        gravedad: 'Leve',
        funcionarioResponsableId: 'FUN-3001',
        participantes: [
          {
            alumnoInstitucionalId: 'ALU-1001',
            rolEnIncidente: 'Involucrado',
          },
        ],
      }),
    /La fecha del incidente no puede estar en el futuro/
  )

  const incidentes = await persistenciaSistema.listarIncidentes()

  assert.equal(incidentes.length, 0)
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
    gravedad: 'Grave',
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
    gravedad: 'Grave',
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
        gravedad: 'Grave',

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


test('US02: T02 Test 1: guarda incidente con gravedad valida', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional: new ServicioInstitucional(),
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Pelea en recreo',
    fecha: '2025-05-20',
    descripcion: 'Descripcion valida del incidente',
    gravedad: 'Leve',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1001',
        rolEnIncidente: 'Agresor',
      },
    ],
  })

  assert.equal(incidente.gravedad, 'Leve')
})

test('US02: T02 Test 2: rechaza gravedad invalida', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional: new ServicioInstitucional(),
  })

  await assert.rejects(
    async () =>
      servicioIncidentes.registrarIncidente({
        titulo: 'Incidente invalido',
        fecha: '2025-05-23',
        descripcion: 'Descripcion valida del incidente',
        gravedad: 'Urgente',
        funcionarioResponsableId: 'FUN-3001',
        participantes: [
          {
            alumnoInstitucionalId: 'ALU-1001',
            rolEnIncidente: 'Agresor',
          },
        ],
      }),
    ErrorValidacionSistema
  )

  const incidentes = await persistenciaSistema.listarIncidentes()

  assert.equal(incidentes.length, 0)
})

test('US02: T02 Test 3: rechaza incidente sin gravedad', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional: new ServicioInstitucional(),
  })
  await assert.rejects(
    async () =>
      servicioIncidentes.registrarIncidente({
        titulo: 'Incidente sin gravedad',
        fecha: '2025-05-23',
        descripcion: 'Descripcion valida del incidente',
        funcionarioResponsableId: 'FUN-3001',
        participantes: [
          {
            alumnoInstitucionalId: 'ALU-1001',
            rolEnIncidente: 'Agresor',
          },
        ],
      }),
    ErrorValidacionSistema
  )

  const incidentes = await persistenciaSistema.listarIncidentes()

  assert.equal(incidentes.length, 0)
})

test('US02: T03 Test 1: asocia protocolo correcto al asignar gravedad leve', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioInstitucional = new ServicioInstitucional()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional,
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Empujon en pasillo',
    fecha: '2025-05-20',
    descripcion: 'Discusion entre alumnos',
    gravedad: 'Leve',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1001',
        rolEnIncidente: 'Agresor',
      },
    ],
  })

  assert.equal(incidente.protocolo, servicioInstitucional.consultarProtocolo('Leve'))
})

test('US02: T03 Test 2: asocia protocolo correcto al asignar gravedad grave', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioInstitucional = new ServicioInstitucional()
  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional,
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Pelea grave',
    fecha: '2025-05-20',
    descripcion: 'Agresion fisica fuerte',
    gravedad: 'Grave',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1001',
        rolEnIncidente: 'Agresor',
      },
    ],
  })

  assert.equal(incidente.protocolo, servicioInstitucional.consultarProtocolo('Grave'))
})

test('US02: T03 Test 3: actualiza protocolo al modificar gravedad', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioInstitucional = new ServicioInstitucional()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional,
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Conflicto menor',
    fecha: '2025-05-20',
    descripcion: 'Discusion',
    gravedad: 'Leve',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1001',
        rolEnIncidente: 'Agresor',
      },
    ],
  })

  const incidenteActualizado =
    await servicioIncidentes.actualizarGravedadIncidente(
    incidente.id,
    'Grave',
    'FUN-3001'
  )

  assert.equal(incidenteActualizado.gravedad, 'Grave')
  assert.equal(incidenteActualizado.protocolo, servicioInstitucional.consultarProtocolo('Grave'))
})

test('US02: T04 Test 1: actualiza gravedad y protocolo correctamente', async () => {

  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioInstitucional = new ServicioInstitucional()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional,
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Conflicto',
    fecha: '2025-05-20',
    descripcion: 'Discusion',
    gravedad: 'Leve',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1001',
        rolEnIncidente: 'Agresor',
      },
    ],
  })

  const actualizado =
    await servicioIncidentes.actualizarGravedadIncidente(
      incidente.id,
      'Grave',
      'FUN-3001'
    )

  assert.equal(actualizado.gravedad, 'Grave')

  assert.equal(
    actualizado.protocolo,
    servicioInstitucional.consultarProtocolo('Grave')
  )
})

test('US02: T04 Test 2: rechaza gravedad invalida', async () => {

  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioInstitucional = new ServicioInstitucional()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional,
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Conflicto',
    fecha: '2025-05-20',
    descripcion: 'Discusion',
    gravedad: 'Leve',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1001',
        rolEnIncidente: 'Agresor',
      },
    ],
  })

  await assert.rejects(
    () =>
      servicioIncidentes.actualizarGravedadIncidente(
        incidente.id,
        'Urgente',
        'FUN-3001'
      ),
    ErrorValidacionSistema
  )
})

test('US02: T05 Test 1: registra evento de cambio de gravedad en auditoria', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional: new ServicioInstitucional(),
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Conflicto',
    fecha: '2025-05-20',
    descripcion: 'Discusion entre alumnos',
    gravedad: 'Leve',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1001',
        rolEnIncidente: 'Agresor',
      },
    ],
  })

  await servicioIncidentes.actualizarGravedadIncidente(
    incidente.id,
    'Grave',
    'FUN-3001'
  )

  const auditorias =
    await persistenciaSistema.consultarAuditoriasPorIncidente(
      incidente.id
    )

  const auditoria = auditorias.find(
    (a) => a.accion === 'CAMBIO_GRAVEDAD'
  )

  assert.ok(auditoria)
  assert.equal(auditoria.gravedadAnterior, 'Leve')
  assert.equal(auditoria.gravedadNueva, 'Grave')
  assert.equal(
    auditoria.funcionarioResponsableId,
    'FUN-3001'
  )
})

test('US02: T05 Test 2: no registra auditoria si la gravedad no cambia', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()

  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional: new ServicioInstitucional(),
  })

  const incidente = await servicioIncidentes.registrarIncidente({
    titulo: 'Conflicto',
    fecha: '2025-05-20',
    descripcion: 'Discusion entre alumnos',
    gravedad: 'Leve',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      {
        alumnoInstitucionalId: 'ALU-1001',
        rolEnIncidente: 'Agresor',
      },
    ],
  })

  await servicioIncidentes.actualizarGravedadIncidente(
    incidente.id,
    'Leve',
    'FUN-3001'
  )

  const auditorias =
    await persistenciaSistema.consultarAuditoriasPorIncidente(
      incidente.id
    )

  const cambiosGravedad = auditorias.filter(
    (a) => a.accion === 'CAMBIO_GRAVEDAD'
  )

  assert.equal(cambiosGravedad.length, 0)
})
