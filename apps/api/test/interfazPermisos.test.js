const assert = require('node:assert/strict')
const test = require('node:test')

const crearApp = require('../src/app')
const { CLAVE_DEMO_FUNCIONARIOS } = require('../src/lib/servicioAutenticacion')

test('US6 T04: login entrega permisos efectivos para construir la interfaz', async () => {
  const app = crearApp()
  const server = app.listen(0)

  try {
    const { port } = server.address()
    const respuesta = await fetch(`http://127.0.0.1:${port}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        correoInstitucional: 'marta.leiva@colegio.cl',
        password: CLAVE_DEMO_FUNCIONARIOS,
      }),
    })
    const body = await respuesta.json()

    assert.equal(respuesta.status, 200)
    assert.ok(body.data.funcionario.permisos.includes('gestionar_roles_permisos'))
    assert.equal(body.data.funcionario.permisos.includes('registrar_incidentes'), false)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('US6 T04: login de profesor entrega permisos operativos basicos', async () => {
  const app = crearApp()
  const server = app.listen(0)

  try {
    const { port } = server.address()
    const respuesta = await fetch(`http://127.0.0.1:${port}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        correoInstitucional: 'ana.morales@colegio.cl',
        password: CLAVE_DEMO_FUNCIONARIOS,
      }),
    })
    const body = await respuesta.json()

    assert.ok(body.data.funcionario.permisos.includes('registrar_incidentes'))
    assert.equal(body.data.funcionario.permisos.includes('gestionar_roles_permisos'), false)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})
