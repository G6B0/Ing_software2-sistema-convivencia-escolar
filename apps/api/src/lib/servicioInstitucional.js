const { cargarDatosInstitucionales } = require('./cargarDatosInstitucionales')

class ServicioInstitucional {
  constructor(rutaFuenteInstitucional) {
    const datosInstitucionales = cargarDatosInstitucionales(rutaFuenteInstitucional)

    this.alumnos = new Map(datosInstitucionales.alumnos.map((alumno) => [alumno.id, alumno]))
    this.apoderados = new Map(
      datosInstitucionales.apoderados.map((apoderado) => [apoderado.id, apoderado])
    )
    this.funcionariosPorId = new Map(
      datosInstitucionales.funcionarios.map((funcionario) => [funcionario.id, funcionario])
    )
    this.funcionariosPorCorreo = new Map(
      datosInstitucionales.funcionarios.map((funcionario) => [
        funcionario.correoInstitucional.toLowerCase(),
        funcionario,
      ])
    )
    this.protocolos = datosInstitucionales.protocolos
  }

  consultarAlumnoPorId(alumnoId) {
    const alumno = this.alumnos.get(alumnoId)

    if (!alumno) {
      return null
    }

    return {
      id: alumno.id,
      nombre: alumno.nombre,
      curso: alumno.curso,
      anioIngreso: alumno.anioIngreso,
    }
  }

  obtenerApoderadosDeAlumno(alumnoId) {
    const alumno = this.alumnos.get(alumnoId)

    if (!alumno) {
      return null
    }

    return alumno.apoderados
      .map((apoderadoId) => this.apoderados.get(apoderadoId))
      .filter(Boolean)
  }

  consultarFuncionario(identificadorOCorreo) {
    const funcionario =
      this.funcionariosPorId.get(identificadorOCorreo) ||
      this.funcionariosPorCorreo.get(String(identificadorOCorreo).toLowerCase())

    return funcionario || null
  }
  consultarProtocolo(gravedad) {
    return this.protocolos[gravedad] || null
  }
}

module.exports = ServicioInstitucional
