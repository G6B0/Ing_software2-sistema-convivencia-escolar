const assert = require('node:assert/strict')
const test = require('node:test')

const crearApp = require('../src/app')
const { ErrorAutorizacionSistema } = require('../src/lib/erroresSistema')
const { PersistenciaSistemaMemoria } = require('../src/lib/persistenciaSistema')
const ServicioAutorizacion = require('../src/lib/servicioAutorizacion')
const ServicioInstitucional = require('../src/lib/servicioInstitucional')
const { PERMISOS } = require('../src/lib/rolesPermisos')

function crearPayloadIncidente(funcionarioResponsableId = 'FUN-3002') {
  return {
    titulo: 'Conflicto en recreo',
    fecha: '2026-05-14T10:00:00.000Z',
    descripcion: 'Se registra conflicto entre estudiantes durante el recreo.',
    gravedad: 'Moderado',
    funcionarioResponsableId,
    participantes: [{ alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Involucrado' }],
  }
}

test('US6 T02 Test 1: permite accion cuando el rol tiene permiso', () => {
  const servicioAutorizacion = new ServicioAutorizacion({
    servicioInstitucional: new ServicioInstitucional(),
  })

  const resultado = servicioAutorizacion.verificarPermisoFuncionario(
    'FUN-3002',
    PERMISOS.MODIFICAR_GRAVEDAD
  )

  assert.equal(resultado.funcionario.rol, 'inspector')
})

test('US6 T02 Test 2: rechaza accion cuando el rol no tiene permiso', () => {
  const servicioAutorizacion = new ServicioAutorizacion({
    servicioInstitucional: new ServicioInstitucional(),
  })

  assert.throws(
    () =>
      servicioAutorizacion.verificarPermisoFuncionario(
        'FUN-3001',
        PERMISOS.MODIFICAR_GRAVEDAD
      ),
    ErrorAutorizacionSistema
  )
})

test('US6 T02 Test 3: no ejecuta cambios si falla la autorizacion', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()
  const app = crearApp({ persistenciaSistema })
  const server = app.listen(0)

  try {
    const { port } = server.address()
    const baseUrl = `http://127.0.0.1:${port}`

    const respuestaCreacion = await fetch(`${baseUrl}/incidentes`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-funcionario-id': 'FUN-3002',
      },
      body: JSON.stringify(crearPayloadIncidente()),
    })
    const creacion = await respuestaCreacion.json()

    const respuestaRechazada = await fetch(`${baseUrl}/incidentes/${creacion.data.id}/gravedad`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'x-funcionario-id': 'FUN-3001',
      },
      body: JSON.stringify({ gravedad: 'Grave' }),
    })
    const rechazo = await respuestaRechazada.json()

    assert.equal(respuestaRechazada.status, 403)
    assert.match(rechazo.error, /permisos suficientes/)

    const incidenteConsultado = await persistenciaSistema.consultarIncidentePorId(creacion.data.id)
    assert.equal(incidenteConsultado.gravedad, 'Moderado')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('US6 T02 Test 4: bloquea registro de incidente para rol sin permiso', async () => {
  const persistenciaSistema = new PersistenciaSistemaMemoria()
  const app = crearApp({ persistenciaSistema })
  const server = app.listen(0)

  try {
    const { port } = server.address()
    const baseUrl = `http://127.0.0.1:${port}`

    const respuesta = await fetch(`${baseUrl}/incidentes`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-funcionario-id': 'FUN-3003',
      },
      body: JSON.stringify(crearPayloadIncidente('FUN-3003')),
    })

    assert.equal(respuesta.status, 403)
    assert.equal((await persistenciaSistema.listarIncidentes()).length, 0)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})
