const assert = require('node:assert/strict')
const test = require('node:test')

const crearApp = require('../src/app')
const ServicioAutorizacion = require('../src/lib/servicioAutorizacion')
const ServicioInstitucional = require('../src/lib/servicioInstitucional')
const { PersistenciaSistemaMemoria } = require('../src/lib/persistenciaSistema')
const { PERMISOS } = require('../src/lib/rolesPermisos')

function iniciarAppConAuditoria() {
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
    persistenciaSistema,
    server,
    servicioAutorizacion,
  }
}

async function modificarPermisos(baseUrl, rol, permisos) {
  return fetch(`${baseUrl}/roles/${rol}/permisos`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      'x-funcionario-id': 'FUN-3005',
    },
    body: JSON.stringify({ permisos }),
  })
}

test('US6 T05 Test 1: registra auditoria al modificar permisos de un rol', async () => {
  const { baseUrl, persistenciaSistema, server } = iniciarAppConAuditoria()

  try {
    const respuesta = await modificarPermisos(baseUrl, 'profesor', [
      PERMISOS.CONSULTAR_ALUMNOS,
      PERMISOS.REGISTRAR_INCIDENTES,
    ])
    const auditorias = await persistenciaSistema.consultarAuditoriasPorRol('profesor')

    assert.equal(respuesta.status, 200)
    assert.equal(auditorias.length, 1)
    assert.equal(auditorias[0].accion, 'MODIFICAR_PERMISOS_ROL')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('US6 T05 Test 2: auditoria contiene los datos obligatorios del cambio', async () => {
  const { baseUrl, persistenciaSistema, server } = iniciarAppConAuditoria()
  const permisosNuevos = [PERMISOS.CONSULTAR_ALUMNOS]

  try {
    await modificarPermisos(baseUrl, 'profesor', permisosNuevos)
    const [auditoria] = await persistenciaSistema.consultarAuditoriasPorRol('profesor')

    assert.ok(Date.parse(auditoria.fecha))
    assert.equal(auditoria.funcionarioResponsableId, 'FUN-3005')
    assert.equal(auditoria.rolAfectado, 'profesor')
    assert.equal(auditoria.entidad, 'rol')
    assert.equal(auditoria.identificadorRelacionado, 'profesor')
    assert.equal(auditoria.accion, 'MODIFICAR_PERMISOS_ROL')
    assert.deepEqual(auditoria.permisosNuevos, permisosNuevos)
    assert.ok(auditoria.permisosAnteriores.includes(PERMISOS.REGISTRAR_INCIDENTES))
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('US6 T05 Test 3: no registra auditoria ni modifica permisos si la operacion falla', async () => {
  const { baseUrl, persistenciaSistema, server, servicioAutorizacion } =
    iniciarAppConAuditoria()
  const permisosOriginales = servicioAutorizacion.obtenerPermisosRol('profesor')

  try {
    const respuesta = await modificarPermisos(baseUrl, 'profesor', ['permiso_inexistente'])
    const auditorias = await persistenciaSistema.consultarAuditoriasPorRol('profesor')

    assert.equal(respuesta.status, 400)
    assert.equal(auditorias.length, 0)
    assert.deepEqual(servicioAutorizacion.obtenerPermisosRol('profesor'), permisosOriginales)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})
