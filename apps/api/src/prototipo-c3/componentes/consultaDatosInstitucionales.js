const { paso } = require('./impresora')
const ServicioInstitucional = require('../../lib/servicioInstitucional')

class ConsultaDatosInstitucionales {
  constructor(rutaFuenteInstitucional) {
    this.servicioInstitucional = new ServicioInstitucional(rutaFuenteInstitucional)
  }

  obtenerAlumno(alumnoId) {
    paso(
      'Consulta de Datos Institucionales',
      `Solicita alumno ${alumnoId} al Sistema de Datos Institucionales del Colegio.`
    )

    const alumno = this.servicioInstitucional.consultarAlumnoPorId(alumnoId)

    if (!alumno) {
      throw new Error(`Alumno ${alumnoId} no existe en la fuente institucional.`)
    }

    paso(
      'Consulta de Datos Institucionales',
      `Recibe datos oficiales de ${alumno.nombre}, curso ${alumno.curso}, y los envia a API REST.`
    )

    return {
      ...alumno,
      apoderados: this.obtenerApoderados(alumnoId, false),
    }
  }

  obtenerApoderados(alumnoId, registrarPaso = true) {
    const alumno = this.servicioInstitucional.consultarAlumnoPorId(alumnoId)
    const apoderados = this.servicioInstitucional.obtenerApoderadosDeAlumno(alumnoId)

    if (!alumno || !apoderados) {
      throw new Error(`Alumno ${alumnoId} no existe en la fuente institucional.`)
    }

    if (registrarPaso) {
      paso(
        'Consulta de Datos Institucionales',
        `Entrega apoderados de ${alumno.nombre} al componente Notificaciones.`
      )
    }

    return apoderados
  }

  obtenerFuncionario(funcionarioId) {
    paso(
      'Consulta de Datos Institucionales',
      `Solicita funcionario ${funcionarioId} al Sistema de Datos Institucionales del Colegio.`
    )

    const funcionario = this.servicioInstitucional.consultarFuncionario(funcionarioId)

    if (!funcionario) {
      throw new Error(`Funcionario ${funcionarioId} no existe en la fuente institucional.`)
    }

    return funcionario
  }
}

module.exports = ConsultaDatosInstitucionales
