const assert = require('node:assert/strict')
const test = require('node:test')

const { esquemaSistema, tablasDelSistema } = require('../src/db/esquemaSistema')
const { ErrorConfiguracionBaseDatos, ErrorValidacionSistema } = require('../src/lib/erroresSistema')
const { PersistenciaSistemaMemoria } = require('../src/lib/persistenciaSistema')
const crearPersistenciaSistema = require('../src/lib/crearPersistenciaSistema')
const PersistenciaSistemaSupabase = require('../src/lib/persistenciaSistemaSupabase')
const ServicioIncidentes = require('../src/lib/servicioIncidentes')
const ServicioInstitucional = require('../src/lib/servicioInstitucional')
const { crearClienteSupabase, obtenerConfigSupabase } = require('../src/lib/supabase')
const crearApp = require('../src/app')

function crearPersistenciaConIncidente() {
  const persistencia = new PersistenciaSistemaMemoria()

  return persistencia.guardarIncidente({
    titulo: 'Agresion verbal en recreo',
    fecha: '2026-05-14T10:00:00.000Z',
    descripcion: 'Alumno reporta agresion verbal durante el recreo.',
    gravedad: 'Moderado',
    estado: 'Abierto',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Victima' },
      { alumnoInstitucionalId: 'ALU-1002', rolEnIncidente: 'Agresor' },
    ],
  }).then((incidente) => ({ persistencia, incidente }))
}

test('T01 Test 1: existe una tabla o coleccion para almacenar incidentes', () => {
  assert.ok(tablasDelSistema.includes('incidentes'))
  assert.ok(esquemaSistema.incidentes)
})

test('T01 Test 1b: existe una tabla para participantes de incidentes', () => {
  assert.ok(tablasDelSistema.includes('incidenteParticipantes'))
  assert.equal(
    esquemaSistema.incidenteParticipantes.campos.alumnoInstitucionalId.referencia,
    'Base de Datos Institucionales.alumnos.id'
  )
  assert.equal(esquemaSistema.incidenteParticipantes.campos.incidenteId.referencia, 'incidentes.id')
})

test('T01 Test 2: existe una tabla o coleccion para seguimientos asociados a incidentes', () => {
  assert.ok(tablasDelSistema.includes('seguimientos'))
  assert.equal(esquemaSistema.seguimientos.campos.incidenteId.referencia, 'incidentes.id')
  assert.equal(esquemaSistema.seguimientos.campos.evolucionCaso.requerido, true)
})

test('T01 Test 3: existe una tabla o coleccion para auditorias del sistema', () => {
  assert.ok(tablasDelSistema.includes('auditorias'))
  assert.ok(esquemaSistema.auditorias.campos.identificadorRelacionado)
})

test('T01 Test 4: la base del sistema solo guarda referencias institucionales necesarias', () => {
  const camposIncidente = Object.keys(esquemaSistema.incidentes.campos)
  const camposParticipante = Object.keys(esquemaSistema.incidenteParticipantes.campos)

  assert.ok(camposIncidente.includes('funcionarioResponsableId'))
  assert.ok(camposParticipante.includes('alumnoInstitucionalId'))
  assert.ok(camposParticipante.includes('rolEnIncidente'))
  assert.equal(camposIncidente.includes('alumnoInstitucionalId'), false)
  assert.equal(camposIncidente.includes('nombreAlumno'), false)
  assert.equal(camposParticipante.includes('nombreAlumno'), false)
  assert.equal(camposParticipante.includes('apoderados'), false)
  assert.equal(camposIncidente.includes('correoInstitucionalFuncionario'), false)
})

test('T02 Test 1: incidentes permite almacenar todos los campos obligatorios', () => {
  const campos = esquemaSistema.incidentes.campos

  ;[
    'titulo',
    'fecha',
    'descripcion',
    'gravedad',
    'estado',
    'funcionarioResponsableId',
  ].forEach((campo) => {
    assert.equal(campos[campo].requerido, true)
  })

  assert.equal(esquemaSistema.incidenteParticipantes.campos.alumnoInstitucionalId.requerido, true)
  assert.equal(esquemaSistema.incidenteParticipantes.campos.rolEnIncidente.requerido, true)
})

test('T02 Test 2: un incidente guardado queda asociado a un identificador unico', async () => {
  const { persistencia } = await crearPersistenciaConIncidente()
  const segundoIncidente = await persistencia.guardarIncidente({
    titulo: 'Conflicto en sala',
    fecha: '2026-05-14T11:00:00.000Z',
    descripcion: 'Discusion entre estudiantes durante la clase.',
    gravedad: 'Leve',
    estado: 'Abierto',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [{ alumnoInstitucionalId: 'ALU-1002', rolEnIncidente: 'Involucrado' }],
  })

  const incidentes = await persistencia.listarIncidentes()

  assert.ok(segundoIncidente.id)
  assert.equal(new Set(incidentes.map((incidente) => incidente.id)).size, incidentes.length)
})

test('T02 Test 3: incidentes soporta estados Abierto, Cerrado y Reabierto', () => {
  assert.deepEqual(esquemaSistema.incidentes.campos.estado.valoresPermitidos, [
    'Abierto',
    'Cerrado',
    'Reabierto',
  ])
})

test('T02 Test 4: participantes soporta roles de agresor, victima, testigo e involucrado', () => {
  assert.deepEqual(esquemaSistema.incidenteParticipantes.campos.rolEnIncidente.valoresPermitidos, [
    'Agresor',
    'Victima',
    'Testigo',
    'Involucrado',
  ])
})

test('T03 Test 1: crea cliente de base de datos con variables de entorno validas', () => {
  const llamadas = []
  const cliente = crearClienteSupabase({
    env: {
      SUPABASE_URL: 'proyecto-prueba',
      SUPABASE_SECRET_KEY: 'clave-configurada-en-env',
    },
    createClientImpl: (url, key, options) => {
      llamadas.push({ url, key, options })
      return { conectado: true }
    },
  })

  assert.deepEqual(cliente, { conectado: true })
  assert.equal(llamadas[0].url, 'https://proyecto-prueba.supabase.co')
  assert.equal(llamadas[0].key, 'clave-configurada-en-env')
})

test('T03 Test 2: rechaza configuracion invalida sin exponer credenciales', () => {
  assert.throws(
    () => crearClienteSupabase({ env: { SUPABASE_SECRET_KEY: 'secreto-no-expuesto' } }),
    (error) =>
      error instanceof ErrorConfiguracionBaseDatos &&
      error.message.includes('SUPABASE_URL') &&
      !error.message.includes('secreto-no-expuesto')
  )
})

test('T03 Test 3: la configuracion obtiene credenciales desde variables de entorno', () => {
  const config = obtenerConfigSupabase({
    SUPABASE_URL: 'https://db.example.test',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-desde-env',
  })

  assert.equal(config.supabaseUrl, 'https://db.example.test')
  assert.equal(config.supabaseKey, 'service-role-desde-env')
})

test('T03 Test 4: el backend selecciona Supabase cuando SISTEMA_DB_ADAPTER=supabase', () => {
  const persistencia = crearPersistenciaSistema({
    env: {
      SISTEMA_DB_ADAPTER: 'supabase',
      SUPABASE_URL: 'proyecto-prueba',
      SUPABASE_SECRET_KEY: 'clave-configurada-en-env',
    },
    createClientImpl: () => ({ from: () => {} }),
  })

  assert.ok(persistencia instanceof PersistenciaSistemaSupabase)
})

test('T04 Test 1: guarda un incidente valido para un alumno institucional existente', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()
  const servicio = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional: new ServicioInstitucional(),
  })

  const incidente = await servicio.registrarIncidente({
    titulo: 'Agresion verbal en recreo',
    fecha: '2026-05-14T10:00:00.000Z',
    descripcion: 'Alumno reporta agresion verbal durante el recreo.',
    gravedad: 'Moderado',
    estado: 'Abierto',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Victima' },
      { alumnoInstitucionalId: 'ALU-1002', rolEnIncidente: 'Agresor' },
    ],
  })

  assert.ok(incidente.id)
  assert.equal((await persistenciaSistema.listarIncidentes()).length, 1)
})

test('T04 Test 2 y CA5: consulta un incidente guardado por identificador', async () => {
  const { persistencia, incidente } = await crearPersistenciaConIncidente()

  const incidenteConsultado = await persistencia.consultarIncidentePorId(incidente.id)

  assert.deepEqual(incidenteConsultado, incidente)
})

test('T04 Test 3: rechaza incidente incompleto y no lo almacena', async () => {
  const persistencia = new PersistenciaSistemaMemoria()

  await assert.rejects(
    () =>
      persistencia.guardarIncidente({
        titulo: 'Registro incompleto',
        fecha: '2026-05-14T10:00:00.000Z',
      }),
    ErrorValidacionSistema
  )

  assert.equal((await persistencia.listarIncidentes()).length, 0)
})

test('T04 Test 4: guarda referencias a alumnos participantes y no copia datos institucionales completos', async () => {
  const { persistencia, incidente } = await crearPersistenciaConIncidente()
  const incidenteGuardado = await persistencia.consultarIncidentePorId(incidente.id)

  assert.equal(incidenteGuardado.participantes.length, 2)
  assert.deepEqual(
    incidenteGuardado.participantes.map((participante) => ({
      alumnoInstitucionalId: participante.alumnoInstitucionalId,
      rolEnIncidente: participante.rolEnIncidente,
    })),
    [
      { alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Victima' },
      { alumnoInstitucionalId: 'ALU-1002', rolEnIncidente: 'Agresor' },
    ]
  )
  assert.equal(Object.hasOwn(incidenteGuardado, 'alumnoInstitucionalId'), false)
  assert.equal(Object.hasOwn(incidenteGuardado, 'alumno'), false)
  assert.equal(Object.hasOwn(incidenteGuardado, 'nombreAlumno'), false)
  assert.equal(Object.hasOwn(incidenteGuardado, 'apoderados'), false)
  assert.equal(Object.hasOwn(incidenteGuardado.participantes[0], 'nombreAlumno'), false)
  assert.equal(Object.hasOwn(incidenteGuardado.participantes[0], 'curso'), false)
})

test('T05 Test 1: guarda auditoria correctamente', async () => {
  const { persistencia, incidente } = await crearPersistenciaConIncidente()
  const auditoria = await persistencia.guardarAuditoria({
    accion: 'CAMBIAR_ESTADO',
    fecha: '2026-05-14T12:00:00.000Z',
    funcionarioResponsableId: 'FUN-3001',
    entidad: 'incidente',
    identificadorRelacionado: incidente.id,
  })

  assert.ok(auditoria.id)
  assert.equal(auditoria.accion, 'CAMBIAR_ESTADO')
  assert.equal(auditoria.identificadorRelacionado, incidente.id)
})

test('T05 Test 2: consulta auditorias asociadas a un incidente', async () => {
  const { persistencia, incidente } = await crearPersistenciaConIncidente()
  await persistencia.guardarAuditoria({
    accion: 'CREAR_INCIDENTE',
    fecha: '2026-05-14T12:00:00.000Z',
    funcionarioResponsableId: 'FUN-3001',
    entidad: 'incidente',
    identificadorRelacionado: incidente.id,
  })

  const auditorias = await persistencia.consultarAuditoriasPorIncidente(incidente.id)

  assert.equal(auditorias.length, 1)
  assert.equal(auditorias[0].accion, 'CREAR_INCIDENTE')
})

test('T05 Test 3: rechaza auditoria sin accion asociada', async () => {
  const persistencia = new PersistenciaSistemaMemoria()

  await assert.rejects(
    () =>
      persistencia.guardarAuditoria({
        fecha: '2026-05-14T12:00:00.000Z',
        funcionarioResponsableId: 'FUN-3001',
        entidad: 'incidente',
        identificadorRelacionado: 'INC-1',
      }),
    ErrorValidacionSistema
  )
})

test('T06 Test 1: guarda seguimiento asociado a incidente existente', async () => {
  const { persistencia, incidente } = await crearPersistenciaConIncidente()
  const seguimiento = await persistencia.guardarSeguimiento({
    incidenteId: incidente.id,
    accion: 'Entrevista con estudiante',
    evolucionCaso: 'El estudiante reconoce lo ocurrido y se agenda nueva revision.',
    fecha: '2026-05-14T13:00:00.000Z',
    funcionarioResponsableId: 'FUN-3002',
  })

  assert.ok(seguimiento.id)
  assert.equal(seguimiento.incidenteId, incidente.id)
})

test('T06 Test 2: rechaza seguimiento para incidente inexistente', async () => {
  const persistencia = new PersistenciaSistemaMemoria()

  await assert.rejects(
    () =>
      persistencia.guardarSeguimiento({
        incidenteId: 'INC-INEXISTENTE',
        accion: 'Seguimiento no permitido',
        evolucionCaso: 'No corresponde guardar seguimiento.',
        fecha: '2026-05-14T13:00:00.000Z',
        funcionarioResponsableId: 'FUN-3002',
      }),
    ErrorValidacionSistema
  )

  assert.equal((await persistencia.consultarSeguimientosPorIncidente('INC-INEXISTENTE')).length, 0)
})

test('T06 Test 3: consulta seguimientos de un incidente', async () => {
  const { persistencia, incidente } = await crearPersistenciaConIncidente()
  await persistencia.guardarSeguimiento({
    incidenteId: incidente.id,
    accion: 'Entrevista con estudiante',
    evolucionCaso: 'El caso muestra avances positivos.',
    fecha: '2026-05-14T13:00:00.000Z',
    funcionarioResponsableId: 'FUN-3002',
  })

  const seguimientos = await persistencia.consultarSeguimientosPorIncidente(incidente.id)

  assert.equal(seguimientos.length, 1)
  assert.equal(seguimientos[0].accion, 'Entrevista con estudiante')
})

test('US03 Task: Test 1 guarda seguimiento con todos los campos requeridos', async () => {
  const { persistencia, incidente } = await crearPersistenciaConIncidente()
  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema: persistencia,
    servicioInstitucional: new ServicioInstitucional(),
  })

  const seguimiento = await servicioIncidentes.registrarSeguimiento(
    incidente.id,
    {
      fecha: '2026-05-15T09:30:00.000Z',
      accion: 'Entrevista con apoderado y estudiante',
      evolucionCaso: 'Se observa disposicion a reparar el conflicto.',
    },
    'FUN-3002'
  )

  const seguimientos = await persistencia.consultarSeguimientosPorIncidente(incidente.id)

  assert.ok(seguimiento.id)
  assert.equal(seguimientos.length, 1)
  assert.deepEqual(seguimientos[0], seguimiento)
  assert.equal(seguimiento.funcionarioResponsableId, 'FUN-3002')
})

test('US03 Task: Test 2 vincula automaticamente al funcionario activo', async () => {
  const { persistencia, incidente } = await crearPersistenciaConIncidente()
  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema: persistencia,
    servicioInstitucional: new ServicioInstitucional(),
  })

  const payload = {
    fecha: '2026-05-15T10:00:00.000Z',
    accion: 'Registro de compromiso de convivencia',
    evolucionCaso: 'El estudiante acepta seguimiento semanal.',
  }

  const seguimiento = await servicioIncidentes.registrarSeguimiento(incidente.id, payload, 'FUN-3003')

  assert.equal(Object.hasOwn(payload, 'funcionarioResponsableId'), false)
  assert.equal(seguimiento.funcionarioResponsableId, 'FUN-3003')
})

test('US03 Task: Test 3 mantiene integridad de los datos almacenados', async () => {
  const { persistencia, incidente } = await crearPersistenciaConIncidente()
  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema: persistencia,
    servicioInstitucional: new ServicioInstitucional(),
  })

  const payload = {
    fecha: '2026-05-15T11:15:00.000Z',
    accion: 'Derivacion a orientacion',
    evolucionCaso: 'El caso queda en observacion por orientacion.',
  }

  await servicioIncidentes.registrarSeguimiento(incidente.id, payload, 'FUN-3001')

  const [seguimientoGuardado] = await persistencia.consultarSeguimientosPorIncidente(incidente.id)

  assert.equal(seguimientoGuardado.incidenteId, incidente.id)
  assert.equal(seguimientoGuardado.fecha, payload.fecha)
  assert.equal(seguimientoGuardado.accion, payload.accion)
  assert.equal(seguimientoGuardado.evolucionCaso, payload.evolucionCaso)
  assert.equal(seguimientoGuardado.funcionarioResponsableId, 'FUN-3001')
})

test('API incidentes: permite guardar y consultar un incidente posteriormente', async () => {
  const app = crearApp()
  const server = app.listen(0)

  try {
    const { port } = server.address()
    const baseUrl = `http://127.0.0.1:${port}`

    const respuestaCreacion = await fetch(`${baseUrl}/incidentes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        titulo: 'Agresion verbal en recreo',
        fecha: '2026-05-14T10:00:00.000Z',
        descripcion: 'Alumno reporta agresion verbal durante el recreo.',
        gravedad: 'Moderado',
        estado: 'Abierto',
        funcionarioResponsableId: 'FUN-3001',
        participantes: [
          { alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Victima' },
          { alumnoInstitucionalId: 'ALU-1002', rolEnIncidente: 'Agresor' },
        ],
      }),
    })
    const creacion = await respuestaCreacion.json()

    assert.equal(respuestaCreacion.status, 201)
    assert.equal(creacion.data.participantes.length, 2)
    assert.equal(creacion.data.participantes[0].alumnoInstitucionalId, 'ALU-1001')

    const respuestaConsulta = await fetch(`${baseUrl}/incidentes/${creacion.data.id}`)
    const consulta = await respuestaConsulta.json()

    assert.equal(respuestaConsulta.status, 200)
    assert.deepEqual(consulta.data, creacion.data)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})
