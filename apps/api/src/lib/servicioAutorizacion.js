const { ErrorAutorizacionSistema } = require('./erroresSistema')
const { obtenerPermisosPorRol } = require('./rolesPermisos')

class ServicioAutorizacion {
  constructor({ servicioInstitucional }) {
    this.servicioInstitucional = servicioInstitucional
  }

  verificarPermisoFuncionario(funcionarioId, permisosRequeridos) {
    const funcionario = this.servicioInstitucional.consultarFuncionario(funcionarioId)

    if (!funcionario) {
      throw new ErrorAutorizacionSistema('Funcionario no autorizado o no encontrado.')
    }

    const permisos = obtenerPermisosPorRol(funcionario.rol)
    const requeridos = Array.isArray(permisosRequeridos)
      ? permisosRequeridos
      : [permisosRequeridos]

    const autorizado = requeridos.some((permiso) => permisos.includes(permiso))

    if (!autorizado) {
      throw new ErrorAutorizacionSistema('El usuario no tiene permisos suficientes.')
    }

    return {
      funcionario,
      permisos,
    }
  }
}

module.exports = ServicioAutorizacion
