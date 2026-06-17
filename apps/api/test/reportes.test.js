const test = require('node:test')
const assert = require('node:assert/strict')

const crearApp = require('../src/app')
const { PersistenciaSistemaMemoria } = require('../src/lib/persistenciaSistema')
const ServicioIncidentes = require('../src/lib/servicioIncidentes')
const ServicioInstitucional = require('../src/lib/servicioInstitucional')

function crearAppConIncidentes(incidentesData = []) {
  const persistenciaSistema = new PersistenciaSistemaMemoria()
  const servicioInstitucional = new ServicioInstitucional()
  const servicioIncidentes = new ServicioIncidentes({
    persistenciaSistema,
    servicioInstitucional,
  })

  const app = crearApp({ servicioInstitucional, persistenciaSistema, servicioIncidentes })

  // Registrar incidentes de prueba
  const setup = async () => {
    for (const datos of incidentesData) {
      await servicioIncidentes.registrarIncidente(datos)
    }
  }

  return { app, setup }
}

function incidenteBase(overrides = {}) {
  return {
    titulo: 'Conducta disruptiva',
    fecha: '2026-06-05T10:00:00.000Z',
    descripcion: 'Descripcion del incidente de prueba.',
    gravedad: 'Leve',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Involucrado' },
    ],
    ...overrides,
  }
}

async function iniciarServidor(app) {
  const server = app.listen(0)
  const { port } = server.address()
  const baseUrl = `http://127.0.0.1:${port}`
  return { server, baseUrl }
}

// ═══════════════════════════════════════════════════════════════════
// T1.1: GET /reportes/dashboard retorna status 200 y estructura correcta
// ═══════════════════════════════════════════════════════════════════
test('US07 T1.1: GET /reportes/dashboard retorna status 200 y estructura { ok, data: { kpis, distribucionGravedad, tiposFrecuentes, ultimasIncidencias } }', async () => {
  const { app, setup } = crearAppConIncidentes([
    incidenteBase(),
  ])
  await setup()

  const { server, baseUrl } = await iniciarServidor(app)

  try {
    const res = await fetch(`${baseUrl}/reportes/dashboard`)
    const body = await res.json()

    assert.equal(res.status, 200)
    assert.equal(body.ok, true)
    assert.ok(body.data.kpis !== undefined)
    assert.ok(body.data.distribucionGravedad !== undefined)
    assert.ok(body.data.tiposFrecuentes !== undefined)
    assert.ok(body.data.ultimasIncidencias !== undefined)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

// ═══════════════════════════════════════════════════════════════════
// T1.2: kpis contiene campos numéricos >= 0
// ═══════════════════════════════════════════════════════════════════
test('US07 T1.2: GET /reportes/dashboard → kpis contiene incidenciasMes, graves, enSeguimiento, reincidentes con valores numericos >= 0', async () => {
  const { app, setup } = crearAppConIncidentes([
    incidenteBase({ gravedad: 'Grave' }),
    incidenteBase({ gravedad: 'Leve', participantes: [{ alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Involucrado' }] }),
  ])
  await setup()

  const { server, baseUrl } = await iniciarServidor(app)

  try {
    const res = await fetch(`${baseUrl}/reportes/dashboard`)
    const body = await res.json()

    const { kpis } = body.data

    assert.equal(typeof kpis.incidenciasMes, 'number')
    assert.equal(typeof kpis.graves, 'number')
    assert.equal(typeof kpis.enSeguimiento, 'number')
    assert.equal(typeof kpis.reincidentes, 'number')

    assert.ok(kpis.incidenciasMes >= 0)
    assert.ok(kpis.graves >= 0)
    assert.ok(kpis.enSeguimiento >= 0)
    assert.ok(kpis.reincidentes >= 0)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

// ═══════════════════════════════════════════════════════════════════
// T1.3: ultimasIncidencias retorna máximo 5 registros ordenados por fecha desc
// ═══════════════════════════════════════════════════════════════════
test('US07 T1.3: GET /reportes/dashboard → ultimasIncidencias retorna maximo 5 registros ordenados por fecha descendente', async () => {
  const incidentes = []
  for (let i = 1; i <= 7; i++) {
    incidentes.push(incidenteBase({
      titulo: `Incidente ${i}`,
      fecha: `2026-06-${String(i).padStart(2, '0')}T10:00:00.000Z`,
    }))
  }

  const { app, setup } = crearAppConIncidentes(incidentes)
  await setup()

  const { server, baseUrl } = await iniciarServidor(app)

  try {
    const res = await fetch(`${baseUrl}/reportes/dashboard`)
    const body = await res.json()

    const { ultimasIncidencias } = body.data

    assert.ok(ultimasIncidencias.length <= 5)

    // Verificar orden descendente por fecha
    for (let i = 0; i < ultimasIncidencias.length - 1; i++) {
      const fechaActual = new Date(ultimasIncidencias[i].fecha)
      const fechaSiguiente = new Date(ultimasIncidencias[i + 1].fecha)
      assert.ok(fechaActual >= fechaSiguiente)
    }
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

// ═══════════════════════════════════════════════════════════════════
// T1.4: distribucionGravedad contiene exactamente 3 entradas
// ═══════════════════════════════════════════════════════════════════
test('US07 T1.4: GET /reportes/dashboard → distribucionGravedad contiene exactamente 3 entradas (Leve, Moderado, Grave) con valores numericos', async () => {
  const { app, setup } = crearAppConIncidentes([
    incidenteBase({ gravedad: 'Leve' }),
    incidenteBase({ gravedad: 'Moderado' }),
    incidenteBase({ gravedad: 'Grave' }),
  ])
  await setup()

  const { server, baseUrl } = await iniciarServidor(app)

  try {
    const res = await fetch(`${baseUrl}/reportes/dashboard`)
    const body = await res.json()

    const { distribucionGravedad } = body.data

    assert.equal(distribucionGravedad.length, 3)

    const gravedades = distribucionGravedad.map((d) => d.gravedad)
    assert.ok(gravedades.includes('Leve'))
    assert.ok(gravedades.includes('Moderado'))
    assert.ok(gravedades.includes('Grave'))

    distribucionGravedad.forEach((d) => {
      assert.equal(typeof d.cantidad, 'number')
      assert.ok(d.cantidad >= 0)
    })
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

// ═══════════════════════════════════════════════════════════════════
// T1.5: GET /reportes/ranking-cursos retorna array ordenado por total desc
// ═══════════════════════════════════════════════════════════════════
test('US07 T1.5: GET /reportes/ranking-cursos retorna status 200 y un array de cursos ordenado de mayor a menor por campo total', async () => {
  const { app, setup } = crearAppConIncidentes([
    incidenteBase({ participantes: [{ alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Involucrado' }] }),
    incidenteBase({ participantes: [{ alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Involucrado' }] }),
    incidenteBase({ participantes: [{ alumnoInstitucionalId: 'ALU-1002', rolEnIncidente: 'Involucrado' }] }),
  ])
  await setup()

  const { server, baseUrl } = await iniciarServidor(app)

  try {
    const res = await fetch(`${baseUrl}/reportes/ranking-cursos`)
    const body = await res.json()

    assert.equal(res.status, 200)
    assert.equal(body.ok, true)
    assert.ok(Array.isArray(body.data))

    // Verificar orden descendente por total
    for (let i = 0; i < body.data.length - 1; i++) {
      assert.ok(body.data[i].total >= body.data[i + 1].total)
    }
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

// ═══════════════════════════════════════════════════════════════════
// T1.6: cada curso contiene campos correctos y la suma cuadra
// ═══════════════════════════════════════════════════════════════════
test('US07 T1.6: GET /reportes/ranking-cursos → cada curso contiene curso, total, leve, moderado, grave y leve + moderado + grave === total', async () => {
  const { app, setup } = crearAppConIncidentes([
    incidenteBase({ gravedad: 'Leve', participantes: [{ alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Involucrado' }] }),
    incidenteBase({ gravedad: 'Moderado', participantes: [{ alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Involucrado' }] }),
    incidenteBase({ gravedad: 'Grave', participantes: [{ alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Involucrado' }] }),
  ])
  await setup()

  const { server, baseUrl } = await iniciarServidor(app)

  try {
    const res = await fetch(`${baseUrl}/reportes/ranking-cursos`)
    const body = await res.json()

    body.data.forEach((curso) => {
      assert.ok(curso.curso !== undefined)
      assert.equal(typeof curso.total, 'number')
      assert.equal(typeof curso.leve, 'number')
      assert.equal(typeof curso.moderado, 'number')
      assert.equal(typeof curso.grave, 'number')
      assert.equal(curso.leve + curso.moderado + curso.grave, curso.total)
    })
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

// ═══════════════════════════════════════════════════════════════════
// T1.7: GET /reportes/mensual retorna array con campos correctos
// ═══════════════════════════════════════════════════════════════════
test('US07 T1.7: GET /reportes/mensual retorna status 200 y un array de meses con campos mes, total, leve, moderado, grave', async () => {
  const { app, setup } = crearAppConIncidentes([
    incidenteBase({ fecha: '2026-03-10T10:00:00.000Z', gravedad: 'Leve' }),
    incidenteBase({ fecha: '2026-04-15T10:00:00.000Z', gravedad: 'Moderado' }),
    incidenteBase({ fecha: '2026-04-20T10:00:00.000Z', gravedad: 'Grave' }),
  ])
  await setup()

  const { server, baseUrl } = await iniciarServidor(app)

  try {
    const res = await fetch(`${baseUrl}/reportes/mensual`)
    const body = await res.json()

    assert.equal(res.status, 200)
    assert.equal(body.ok, true)
    assert.ok(Array.isArray(body.data))

    body.data.forEach((mes) => {
      assert.ok(mes.mes !== undefined)
      assert.equal(typeof mes.total, 'number')
      assert.equal(typeof mes.leve, 'number')
      assert.equal(typeof mes.moderado, 'number')
      assert.equal(typeof mes.grave, 'number')
    })
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

// ═══════════════════════════════════════════════════════════════════
// T1.8: los meses están ordenados cronológicamente
// ═══════════════════════════════════════════════════════════════════
test('US07 T1.8: GET /reportes/mensual → los meses estan ordenados cronologicamente', async () => {
  const { app, setup } = crearAppConIncidentes([
    incidenteBase({ fecha: '2026-06-01T10:00:00.000Z' }),
    incidenteBase({ fecha: '2026-03-10T10:00:00.000Z' }),
    incidenteBase({ fecha: '2026-01-05T10:00:00.000Z' }),
    incidenteBase({ fecha: '2026-04-15T10:00:00.000Z' }),
  ])
  await setup()

  const { server, baseUrl } = await iniciarServidor(app)

  try {
    const res = await fetch(`${baseUrl}/reportes/mensual`)
    const body = await res.json()

    const MESES_ORDEN = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ]

    const indices = body.data.map((m) => MESES_ORDEN.indexOf(m.mes))

    for (let i = 0; i < indices.length - 1; i++) {
      assert.ok(indices[i] <= indices[i + 1], `${body.data[i].mes} deberia estar antes de ${body.data[i + 1].mes}`)
    }
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

// ═══════════════════════════════════════════════════════════════════
// T1.9: Los 3 endpoints retornan { ok: false, error } con status 500 ante fallo
// ═══════════════════════════════════════════════════════════════════
test('US07 T1.9: Los 3 endpoints retornan { ok: false, error } con status 500 ante un fallo de base de datos', async () => {
  // Crear un servicioIncidentes que falle al listar
  const servicioIncidentesFallido = {
    listarIncidentes: async () => {
      throw new Error('Error de conexion a la base de datos')
    },
  }

  const app = crearApp({
    servicioIncidentes: servicioIncidentesFallido,
  })

  const server = app.listen(0)
  const { port } = server.address()
  const baseUrl = `http://127.0.0.1:${port}`

  try {
    // Dashboard
    const resDash = await fetch(`${baseUrl}/reportes/dashboard`)
    const bodyDash = await resDash.json()
    assert.equal(resDash.status, 500)
    assert.equal(bodyDash.ok, false)
    assert.ok(bodyDash.error)

    // Ranking cursos
    const resRanking = await fetch(`${baseUrl}/reportes/ranking-cursos`)
    const bodyRanking = await resRanking.json()
    assert.equal(resRanking.status, 500)
    assert.equal(bodyRanking.ok, false)
    assert.ok(bodyRanking.error)

    // Mensual
    const resMensual = await fetch(`${baseUrl}/reportes/mensual`)
    const bodyMensual = await resMensual.json()
    assert.equal(resMensual.status, 500)
    assert.equal(bodyMensual.ok, false)
    assert.ok(bodyMensual.error)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})
