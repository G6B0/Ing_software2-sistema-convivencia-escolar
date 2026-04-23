const { paso } = require('./impresora')

class ConsultaDatosInstitucionales {
  constructor() {
    this.alumnos = {
      'ALU-1001': {
        id: 'ALU-1001',
        nombre: 'Camila Rojas',
        curso: '8B',
        anioIngreso: 2022,
        apoderados: [
          { nombre: 'Marcela Rojas', email: 'marcela.rojas@correo.cl' },
          { nombre: 'Luis Rojas', email: 'luis.rojas@correo.cl' },
        ],
      },
    }
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
