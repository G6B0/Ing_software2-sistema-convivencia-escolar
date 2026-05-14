const fs = require('node:fs')
const path = require('node:path')

const rutaInstitucionalPorDefecto = path.resolve(__dirname, '../data/institucional.json')

class ErrorFuenteInstitucional extends Error {
  constructor(message, cause) {
    super(message)
    this.name = 'ErrorFuenteInstitucional'
    this.cause = cause
  }
}

function cargarDatosInstitucionales(rutaArchivo = rutaInstitucionalPorDefecto) {
  let contenido

  try {
    contenido = fs.readFileSync(rutaArchivo, 'utf8')
  } catch (error) {
    throw new ErrorFuenteInstitucional(
      `La fuente institucional no pudo ser leida desde ${rutaArchivo}.`,
      error
    )
  }

  let datos

  try {
    datos = JSON.parse(contenido)
  } catch (error) {
    throw new ErrorFuenteInstitucional(
      'La fuente institucional no pudo ser procesada porque el JSON esta mal formado.',
      error
    )
  }

  validarEstructuraInstitucional(datos)

  return datos
}

function validarEstructuraInstitucional(datos) {
  const secciones = ['alumnos', 'apoderados', 'funcionarios']

  const tieneEstructuraValida =
    datos &&
    typeof datos === 'object' &&
    secciones.every((seccion) => Array.isArray(datos[seccion]))

  if (!tieneEstructuraValida) {
    throw new ErrorFuenteInstitucional(
      'La fuente institucional no pudo ser procesada porque no contiene una estructura valida.'
    )
  }
}

module.exports = {
  ErrorFuenteInstitucional,
  cargarDatosInstitucionales,
  rutaInstitucionalPorDefecto,
}
