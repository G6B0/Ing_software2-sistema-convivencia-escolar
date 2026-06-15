const assert = require('node:assert/strict')
const test = require('node:test')

const crearApp = require('../src/app')
const ServicioAutorizacion = require('../src/lib/servicioAutorizacion')
const ServicioInstitucional = require('../src/lib/servicioInstitucional')
const { PersistenciaSistemaMemoria } = require('../src/lib/persistenciaSistema')
const { PERMISOS } = require('../src/lib/rolesPermisos')

function iniciarAppConAutorizacion() {
  const servicioInstitucional = new ServicioInstitucional()
  const persistenciaSistema = new PersistenciaSistemaMemoria()
  const servicioAutorizacion = new ServicioAutorizacion({
    servicioInstitucional,
    persistenciaSistema,
  })
  const app = crearApp({ servicioInstitucional, persistenciaSistema, servicioAutorizacion })
  const server = app.listen(0)

  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    server,
    servicioAutorizacion,
  }
}

test('US6 T03 Test 1: administrador consulta permisos de un rol', async () => {
  const { baseUrl, server } = iniciarAppConAutorizacion()

  try {
    const respuesta = await fetch(`${baseUrl}/roles/profesor/permisos`, {
      headers: { 'x-funcionario-id': 'FUN-3005' },
    })
    const body = await respuesta.json()

    assert.equal(respuesta.status, 200)
    assert.equal(body.data.rol, 'profesor')
    assert.ok(body.data.permisos.includes(PERMISOS.REGISTRAR_INCIDENTES))
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('US6 T03 Test 2: administrador modifica permisos de un rol', async () => {
  const { baseUrl, server, servicioAutorizacion } = iniciarAppConAutorizacion()
  const permisosActualizados = [
    PERMISOS.CONSULTAR_ALUMNOS,
    PERMISOS.REGISTRAR_INCIDENTES,
    PERMISOS.MODIFICAR_GRAVEDAD,
  ]

  try {
    const respuesta = await fetch(`${baseUrl}/roles/profesor/permisos`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-funcionario-id': 'FUN-3005',
      },
      body: JSON.stringify({ permisos: permisosActualizados }),
    })
    const body = await respuesta.json()

    assert.equal(respuesta.status, 200)
    assert.deepEqual(body.data.permisos, permisosActualizados)

    const autorizacionProfesor = servicioAutorizacion.verificarPermisoFuncionario(
      'FUN-3001',
      PERMISOS.MODIFICAR_GRAVEDAD
    )
    assert.equal(autorizacionProfesor.funcionario.rol, 'profesor')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('US6 T03 Test 3: usuario no administrador no puede gestionar permisos', async () => {
  const { baseUrl, server, servicioAutorizacion } = iniciarAppConAutorizacion()
  const permisosOriginales = servicioAutorizacion.obtenerPermisosRol('inspector')

  try {
    const respuesta = await fetch(`${baseUrl}/roles/inspector/permisos`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-funcionario-id': 'FUN-3001',
      },
      body: JSON.stringify({ permisos: [PERMISOS.CONSULTAR_ALUMNOS] }),
    })

    assert.equal(respuesta.status, 403)
    assert.deepEqual(servicioAutorizacion.obtenerPermisosRol('inspector'), permisosOriginales)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('US6 T03: rechaza permisos que no existen en la matriz', async () => {
  const { baseUrl, server } = iniciarAppConAutorizacion()

  try {
    const respuesta = await fetch(`${baseUrl}/roles/profesor/permisos`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-funcionario-id': 'FUN-3005',
      },
      body: JSON.stringify({ permisos: ['permiso_inexistente'] }),
    })

    assert.equal(respuesta.status, 400)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})
