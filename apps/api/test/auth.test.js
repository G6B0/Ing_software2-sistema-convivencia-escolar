const assert = require('node:assert/strict')
const test = require('node:test')

const crearApp = require('../src/app')
const { CLAVE_DEMO_FUNCIONARIOS, ServicioAutenticacion } = require('../src/lib/servicioAutenticacion')
const ServicioInstitucional = require('../src/lib/servicioInstitucional')
const { PersistenciaSistemaMemoria } = require('../src/lib/persistenciaSistema')
const { ErrorValidacionSistema } = require('../src/lib/erroresSistema')

test('T_Login Test 1: autentica funcionario autorizado con credenciales validas', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()
  const servicio = new ServicioAutenticacion({
    persistenciaSistema,
    servicioInstitucional: new ServicioInstitucional(),
  })

  const sesion = await servicio.iniciarSesion({
    correoInstitucional: 'ana.morales@colegio.cl',
    password: CLAVE_DEMO_FUNCIONARIOS,
  })

  assert.ok(sesion.token)
  assert.equal(sesion.funcionario.id, 'FUN-3001')
  assert.equal(sesion.funcionario.correoInstitucional, 'ana.morales@colegio.cl')
  assert.equal(Object.hasOwn(sesion.funcionario, 'claveAcceso'), false)
})

test('T_Login Test 2: rechaza credenciales invalidas', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()
  const servicio = new ServicioAutenticacion({
    persistenciaSistema,
    servicioInstitucional: new ServicioInstitucional(),
  })

  await assert.rejects(
    () =>
      servicio.iniciarSesion({
        correoInstitucional: 'ana.morales@colegio.cl',
        password: 'incorrecta',
      }),
    ErrorValidacionSistema
  )
})

test('T_Login Test 3: registra auditoria de login exitoso', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()
  const servicio = new ServicioAutenticacion({
    persistenciaSistema,
    servicioInstitucional: new ServicioInstitucional(),
  })

  await servicio.iniciarSesion({
    correoInstitucional: 'pedro.salinas@colegio.cl',
    password: CLAVE_DEMO_FUNCIONARIOS,
  })

  const auditorias = Array.from(persistenciaSistema.auditorias.values())

  assert.equal(auditorias.length, 1)
  assert.equal(auditorias[0].accion, 'LOGIN_EXITOSO')
  assert.equal(auditorias[0].funcionarioResponsableId, 'FUN-3002')
})

test('T_Login Test 4: endpoint POST /auth/login entrega sesion del funcionario', async () => {
  const app = crearApp()
  const server = app.listen(0)

  try {
    const { port } = server.address()
    const respuesta = await fetch(`http://127.0.0.1:${port}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        correoInstitucional: 'elena.vargas@colegio.cl',
        password: CLAVE_DEMO_FUNCIONARIOS,
      }),
    })
    const body = await respuesta.json()

    assert.equal(respuesta.status, 200)
    assert.equal(body.ok, true)
    assert.ok(body.data.token)
    assert.equal(body.data.funcionario.id, 'FUN-3003')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('T_Login Test 5: endpoint POST /auth/login rechaza accesos no validos', async () => {
  const app = crearApp()
  const server = app.listen(0)

  try {
    const { port } = server.address()
    const respuesta = await fetch(`http://127.0.0.1:${port}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        correoInstitucional: 'noexiste@colegio.cl',
        password: CLAVE_DEMO_FUNCIONARIOS,
      }),
    })
    const body = await respuesta.json()

    assert.equal(respuesta.status, 401)
    assert.equal(body.ok, false)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})
