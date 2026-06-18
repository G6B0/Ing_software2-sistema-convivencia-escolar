const assert = require('node:assert/strict')
const test = require('node:test')

const crearApp = require('../src/app')
const { PersistenciaSistemaMemoria } = require('../src/lib/persistenciaSistema')
const ServicioAutorizacion = require('../src/lib/servicioAutorizacion')
const ServicioInstitucional = require('../src/lib/servicioInstitucional')
const { PERMISOS } = require('../src/lib/rolesPermisos')

function iniciarSistema() {
  const servicioInstitucional = new ServicioInstitucional()
  const persistenciaSistema = new PersistenciaSistemaMemoria()
  const servicioAutorizacion = new ServicioAutorizacion({
    servicioInstitucional,
    persistenciaSistema,
  })
  const app = crearApp({
    servicioInstitucional,
    persistenciaSistema,
    servicioAutorizacion,
  })
  const server = app.listen(0)

  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    persistenciaSistema,
    server,
  }
}

async function cambiarPermisos(baseUrl, permisos) {
  return fetch(`${baseUrl}/roles/profesor/permisos`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      'x-funcionario-id': 'FUN-3005',
    },
    body: JSON.stringify({ permisos }),
  })
}

async function registrarIncidente(baseUrl, funcionarioId = 'FUN-3001') {
  const respuesta = await fetch(`${baseUrl}/incidentes`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-funcionario-id': funcionarioId,
    },
    body: JSON.stringify({
      titulo: 'Incidente para validar permisos',
      fecha: '2026-06-10T10:00:00.000Z',
      descripcion: 'Incidente usado para probar permisos efectivos.',
      gravedad: 'Leve',
      funcionarioResponsableId: 'FUN-3002',
      participantes: [
        {
          alumnoInstitucionalId: 'ALU-1001',
          rolEnIncidente: 'Involucrado',
        },
      ],
    }),
  })

  return {
    respuesta,
    body: await respuesta.json(),
  }
}

test('US6 bug fix: quitar consultar alumnos bloquea la consulta institucional', async () => {
  const { baseUrl, server } = iniciarSistema()

  try {
    const cambio = await cambiarPermisos(baseUrl, [
      PERMISOS.CONSULTAR_INCIDENTES_PROPIOS_O_GENERALES,
      PERMISOS.REGISTRAR_SEGUIMIENTOS_BASICOS,
    ])
    assert.equal(cambio.status, 200)

    const consulta = await fetch(`${baseUrl}/institucional/alumnos/ALU-1001`, {
      headers: { 'x-funcionario-id': 'FUN-3001' },
    })

    assert.equal(consulta.status, 403)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('US6 bug fix: conceder y revocar modificar gravedad cambia la autorizacion real', async () => {
  const { baseUrl, persistenciaSistema, server } = iniciarSistema()

  try {
    const { respuesta, body } = await registrarIncidente(baseUrl)
    assert.equal(respuesta.status, 201)
    assert.equal(body.data.funcionarioResponsableId, 'FUN-3001')

    const permisosConGravedad = [
      PERMISOS.CONSULTAR_ALUMNOS,
      PERMISOS.REGISTRAR_INCIDENTES,
      PERMISOS.CONSULTAR_INCIDENTES_PROPIOS_O_GENERALES,
      PERMISOS.REGISTRAR_SEGUIMIENTOS_BASICOS,
      PERMISOS.MODIFICAR_GRAVEDAD,
    ]
    assert.equal((await cambiarPermisos(baseUrl, permisosConGravedad)).status, 200)

    const permitida = await fetch(`${baseUrl}/incidentes/${body.data.id}/gravedad`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'x-funcionario-id': 'FUN-3001',
      },
      body: JSON.stringify({ gravedad: 'Moderado' }),
    })
    assert.equal(permitida.status, 200)

    const permisosSinGravedad = permisosConGravedad.filter(
      (permiso) => permiso !== PERMISOS.MODIFICAR_GRAVEDAD
    )
    assert.equal((await cambiarPermisos(baseUrl, permisosSinGravedad)).status, 200)

    const rechazada = await fetch(`${baseUrl}/incidentes/${body.data.id}/gravedad`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'x-funcionario-id': 'FUN-3001',
      },
      body: JSON.stringify({ gravedad: 'Grave' }),
    })
    const incidente = await persistenciaSistema.consultarIncidentePorId(body.data.id)

    assert.equal(rechazada.status, 403)
    assert.equal(incidente.gravedad, 'Moderado')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('US6 bug fix: permisos de sesion reflejan la configuracion vigente', async () => {
  const { baseUrl, server } = iniciarSistema()

  try {
    const permisosActualizados = [
      PERMISOS.CONSULTAR_ALUMNOS,
      PERMISOS.REGISTRAR_INCIDENTES,
      PERMISOS.MODIFICAR_GRAVEDAD,
    ]
    assert.equal((await cambiarPermisos(baseUrl, permisosActualizados)).status, 200)

    const respuesta = await fetch(`${baseUrl}/auth/permisos`, {
      headers: { 'x-funcionario-id': 'FUN-3001' },
    })
    const body = await respuesta.json()

    assert.equal(respuesta.status, 200)
    assert.deepEqual(body.data.permisos, permisosActualizados)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('US6 bug fix: rechaza configuraciones incoherentes de permisos', async () => {
  const { baseUrl, server } = iniciarSistema()

  try {
    const respuesta = await cambiarPermisos(baseUrl, [
      PERMISOS.REGISTRAR_INCIDENTES,
    ])
    const body = await respuesta.json()

    assert.equal(respuesta.status, 400)
    assert.match(body.mensaje, /requiere tambien el permiso de consultar alumnos/)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('US6 bug fix: director conserva acceso total y no puede ser degradado', async () => {
  const { baseUrl, server } = iniciarSistema()

  try {
    const respuesta = await fetch(`${baseUrl}/roles/director/permisos`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-funcionario-id': 'FUN-3005',
      },
      body: JSON.stringify({ permisos: [PERMISOS.CONSULTAR_ALUMNOS] }),
    })
    const body = await respuesta.json()

    assert.equal(respuesta.status, 400)
    assert.match(body.mensaje, /debe conservar acceso total/)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('US6 bug fix: administrador conserva permisos internos al actualizar su rol', async () => {
  const { baseUrl, server } = iniciarSistema()

  try {
    const respuesta = await fetch(`${baseUrl}/roles/administrador/permisos`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-funcionario-id': 'FUN-3005',
      },
      body: JSON.stringify({
        permisos: [
          PERMISOS.GESTIONAR_ROLES_PERMISOS,
          PERMISOS.CONSULTAR_REPORTES,
        ],
      }),
    })
    const body = await respuesta.json()

    assert.equal(respuesta.status, 200)
    assert.ok(body.data.permisos.includes(PERMISOS.ACCEDER_CONFIGURACION))
    assert.ok(body.data.permisos.includes(PERMISOS.AUDITAR_CAMBIOS))
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})
