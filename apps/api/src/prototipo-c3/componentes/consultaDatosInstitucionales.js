const { paso } = require('./impresora')
const fs = require('fs') // ← agrega esta línea al inicio
const path = require('path') // ← esta también, para la ruta del JSON

class ConsultaDatosInstitucionales {
  constructor() {
    const datos = JSON.parse(
      fs.readFileSync(path.join(__dirname, './alumnos.json'), 'utf-8')
    )
    this.alumnos = datos.alumnos
  }

  obtenerAlumno(alumnoId) {
    paso(
      'Consulta de Datos Institucionales',
      `Solicita alumno ${alumnoId} al Sistema de Datos Institucionales del Colegio.`
    )

    const alumno = this.alumnos[alumnoId]

    if (!alumno) {
      throw new Error(`Alumno ${alumnoId} no existe en la fuente institucional.`)
    }

    paso(
      'Consulta de Datos Institucionales',
      `Recibe datos oficiales de ${alumno.nombre}, curso ${alumno.curso}, y los envia a API REST.`
    )

    return alumno
  }

  obtenerApoderados(alumnoId) {
    const alumno = this.obtenerAlumno(alumnoId)

    paso(
      'Consulta de Datos Institucionales',
      `Entrega apoderados de ${alumno.nombre} al componente Notificaciones.`
    )

    return alumno.apoderados
  }
}

module.exports = ConsultaDatosInstitucionales
