const { ErrorAutorizacionSistema, ErrorValidacionSistema } = require('./erroresSistema')
const {
  MATRIZ_ROLES_PERMISOS,
  PERMISOS,
  TODOS_LOS_PERMISOS,
  normalizarRol,
} = require('./rolesPermisos')

class ServicioAutorizacion {
  constructor({ servicioInstitucional, persistenciaSistema }) {
    this.servicioInstitucional = servicioInstitucional
    this.persistenciaSistema = persistenciaSistema
    this.permisosPorRol = new Map(
      Object.entries(MATRIZ_ROLES_PERMISOS).map(([rol, permisos]) => [rol, [...permisos]])
    )
  }

  verificarPermisoFuncionario(funcionarioId, permisosRequeridos) {
    const funcionario = this.servicioInstitucional.consultarFuncionario(funcionarioId)

    if (!funcionario) {
      throw new ErrorAutorizacionSistema('Funcionario no autorizado o no encontrado.')
    }

    const permisos = this.obtenerPermisosRol(funcionario.rol)
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

  consultarPermisosRol(funcionarioId, rol) {
    this.verificarPermisoFuncionario(funcionarioId, PERMISOS.GESTIONAR_ROLES_PERMISOS)

    const rolNormalizado = this.validarRolExistente(rol)

    return {
      rol: rolNormalizado,
      permisos: this.obtenerPermisosRol(rolNormalizado),
    }
  }

  async actualizarPermisosRol(funcionarioId, rol, permisos) {
    this.verificarPermisoFuncionario(funcionarioId, PERMISOS.GESTIONAR_ROLES_PERMISOS)

    const rolNormalizado = this.validarRolExistente(rol)
    const permisosValidados = this.validarPermisos(permisos)
    const permisosAnteriores = this.obtenerPermisosRol(rolNormalizado)

    if (!this.persistenciaSistema) {
      throw new Error('No existe una persistencia configurada para registrar la auditoria.')
    }

    await this.persistenciaSistema.guardarAuditoria({
      accion: 'MODIFICAR_PERMISOS_ROL',
      fecha: new Date().toISOString(),
      funcionarioResponsableId: funcionarioId,
      entidad: 'rol',
      identificadorRelacionado: rolNormalizado,
      rolAfectado: rolNormalizado,
      permisosAnteriores,
      permisosNuevos: [...permisosValidados],
    })

    this.permisosPorRol.set(rolNormalizado, permisosValidados)

    return {
      rol: rolNormalizado,
      permisos: [...permisosValidados],
    }
  }

  obtenerPermisosRol(rol) {
    return [...(this.permisosPorRol.get(normalizarRol(rol)) || [])]
  }

  validarRolExistente(rol) {
    const rolNormalizado = normalizarRol(rol)

    if (!this.permisosPorRol.has(rolNormalizado)) {
      throw new ErrorValidacionSistema('El rol indicado no existe.')
    }

    return rolNormalizado
  }

  validarPermisos(permisos) {
    if (!Array.isArray(permisos)) {
      throw new ErrorValidacionSistema('Los permisos deben enviarse como una lista.')
    }

    const permisosInvalidos = permisos.filter((permiso) => !TODOS_LOS_PERMISOS.includes(permiso))

    if (permisosInvalidos.length > 0) {
      throw new ErrorValidacionSistema(
        `Existen permisos no validos: ${permisosInvalidos.join(', ')}.`
      )
    }

    return [...new Set(permisos)]
  }
}

module.exports = ServicioAutorizacion
