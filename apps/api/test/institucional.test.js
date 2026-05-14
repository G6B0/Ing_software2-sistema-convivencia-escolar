const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')

const datosInstitucionales = require('../src/data/institucional.json')
const {
  ErrorFuenteInstitucional,
  cargarDatosInstitucionales,
  rutaInstitucionalPorDefecto,
} = require('../src/lib/cargarDatosInstitucionales')
const ServicioInstitucional = require('../src/lib/servicioInstitucional')
const crearApp = require('../src/app')

test('Test 1: el JSON institucional contiene alumnos, apoderados y funcionarios', () => {
  assert.ok(Array.isArray(datosInstitucionales.alumnos))
  assert.ok(Array.isArray(datosInstitucionales.apoderados))
  assert.ok(Array.isArray(datosInstitucionales.funcionarios))
})

test('Test 2: cada alumno contiene sus campos minimos', () => {
  datosInstitucionales.alumnos.forEach((alumno) => {
    assert.ok(alumno.id)
    assert.ok(alumno.nombre)
    assert.ok(alumno.curso)
    assert.equal(typeof alumno.anioIngreso, 'number')
    assert.ok(Array.isArray(alumno.apoderados))
    assert.ok(alumno.apoderados.length >= 1)
  })
})

test('Test 3: cada apoderado contiene sus campos minimos', () => {
  datosInstitucionales.apoderados.forEach((apoderado) => {
    assert.ok(apoderado.id)
    assert.ok(apoderado.nombre)
    assert.ok(apoderado.correo)
    assert.ok(apoderado.telefono)
    assert.ok(apoderado.alumnoId)
    assert.ok(apoderado.relacion)
  })
})

test('Test 4: cada funcionario contiene sus campos minimos', () => {
  datosInstitucionales.funcionarios.forEach((funcionario) => {
    assert.ok(funcionario.id)
    assert.ok(funcionario.nombre)
    assert.ok(funcionario.correoInstitucional)
    assert.ok(funcionario.rol)
  })
})

test('CA2 y CA3: el JSON contiene entre 30 y 40 registros y alumnos con apoderados validos', () => {
  const totalRegistros =
    datosInstitucionales.alumnos.length +
    datosInstitucionales.apoderados.length +
    datosInstitucionales.funcionarios.length

  assert.ok(totalRegistros >= 30)
  assert.ok(totalRegistros <= 40)

  const idsApoderados = new Set(datosInstitucionales.apoderados.map((apoderado) => apoderado.id))

  datosInstitucionales.alumnos.forEach((alumno) => {
    alumno.apoderados.forEach((apoderadoId) => {
      assert.ok(idsApoderados.has(apoderadoId))
    })
  })
})

test('T02 Test 3: cada funcionario tiene un rol institucional permitido', () => {
  const rolesPermitidos = new Set([
    'profesor',
    'inspector',
    'orientador',
    'convivencia escolar',
    'administrador',
  ])

  datosInstitucionales.funcionarios.forEach((funcionario) => {
    assert.ok(rolesPermitidos.has(funcionario.rol))
  })
})

test('T02 Test 4: no existen identificadores duplicados dentro de cada tipo de entidad', () => {
  const entidades = [
    datosInstitucionales.alumnos,
    datosInstitucionales.apoderados,
    datosInstitucionales.funcionarios,
  ]

  entidades.forEach((registros) => {
    const ids = registros.map((registro) => registro.id)
    assert.equal(new Set(ids).size, ids.length)
  })
})

test('T03 Test 1: carga el JSON institucional correctamente para consulta', () => {
  const datos = cargarDatosInstitucionales(rutaInstitucionalPorDefecto)

  assert.ok(datos.alumnos.length > 0)
  assert.ok(datos.apoderados.length > 0)
  assert.ok(datos.funcionarios.length > 0)
})

test('T03 Test 2: informa un error controlado cuando el JSON institucional no existe', () => {
  const rutaInexistente = path.resolve(__dirname, 'fixtures/no-existe.json')

  assert.throws(
    () => cargarDatosInstitucionales(rutaInexistente),
    (error) =>
      error instanceof ErrorFuenteInstitucional &&
      error.message.includes('La fuente institucional no pudo ser leida')
  )
})

test('T03 Test 3: rechaza un JSON institucional mal formado con mensaje controlado', () => {
  const rutaMalformada = path.resolve(__dirname, 'fixtures/institucional-malformado.json')

  assert.throws(
    () => cargarDatosInstitucionales(rutaMalformada),
    (error) =>
      error instanceof ErrorFuenteInstitucional &&
      error.message.includes('La fuente institucional no pudo ser procesada')
  )
})

test('T04 Test 1 y Test 3: consulta un alumno existente con datos basicos, curso y anio de ingreso', () => {
  const servicio = new ServicioInstitucional()

  const alumno = servicio.consultarAlumnoPorId('ALU-1001')

  assert.deepEqual(alumno, {
    id: 'ALU-1001',
    nombre: 'Camila Rojas',
    curso: '8B',
    anioIngreso: 2022,
  })
})

test('T04 Test 2: retorna null cuando el alumno no existe', () => {
  const servicio = new ServicioInstitucional()

  assert.equal(servicio.consultarAlumnoPorId('ALU-9999'), null)
})

test('T05 Test 1 y Test 2: retorna apoderados asociados con datos de contacto', () => {
  const servicio = new ServicioInstitucional()

  const apoderados = servicio.obtenerApoderadosDeAlumno('ALU-1001')

  assert.equal(apoderados.length, 2)
  apoderados.forEach((apoderado) => {
    assert.ok(apoderado.nombre)
    assert.ok(apoderado.correo)
    assert.ok(apoderado.telefono)
  })
})

test('T05 Test 3: retorna null al consultar apoderados de un alumno inexistente', () => {
  const servicio = new ServicioInstitucional()

  assert.equal(servicio.obtenerApoderadosDeAlumno('ALU-9999'), null)
})

test('T06 Test 1 y Test 2: consulta funcionario por id o correo y retorna su rol institucional', () => {
  const servicio = new ServicioInstitucional()

  const funcionarioPorId = servicio.consultarFuncionario('FUN-3001')
  const funcionarioPorCorreo = servicio.consultarFuncionario('ana.morales@colegio.cl')

  assert.equal(funcionarioPorId.nombre, 'Ana Morales')
  assert.equal(funcionarioPorId.rol, 'profesor')
  assert.deepEqual(funcionarioPorCorreo, funcionarioPorId)
})

test('T06 Test 3: retorna null cuando el funcionario no existe', () => {
  const servicio = new ServicioInstitucional()

  assert.equal(servicio.consultarFuncionario('FUN-9999'), null)
})

test('API institucional: expone consultas reales de alumnos, apoderados y funcionarios', async () => {
  const app = crearApp()
  const server = app.listen(0)

  try {
    const { port } = server.address()
    const baseUrl = `http://127.0.0.1:${port}`

    const respuestaAlumno = await fetch(`${baseUrl}/institucional/alumnos/ALU-1001`)
    const alumno = await respuestaAlumno.json()

    assert.equal(respuestaAlumno.status, 200)
    assert.equal(alumno.data.nombre, 'Camila Rojas')

    const respuestaApoderados = await fetch(
      `${baseUrl}/institucional/alumnos/ALU-1001/apoderados`
    )
    const apoderados = await respuestaApoderados.json()

    assert.equal(respuestaApoderados.status, 200)
    assert.equal(apoderados.data.length, 2)

    const respuestaFuncionario = await fetch(`${baseUrl}/institucional/funcionarios/FUN-3001`)
    const funcionario = await respuestaFuncionario.json()

    assert.equal(respuestaFuncionario.status, 200)
    assert.equal(funcionario.data.rol, 'profesor')

    const respuestaNoEncontrada = await fetch(`${baseUrl}/institucional/alumnos/ALU-9999`)
    const noEncontrada = await respuestaNoEncontrada.json()

    assert.equal(respuestaNoEncontrada.status, 404)
    assert.equal(noEncontrada.ok, false)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})
