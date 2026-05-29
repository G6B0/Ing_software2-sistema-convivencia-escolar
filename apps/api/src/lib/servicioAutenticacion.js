const { randomUUID } = require('node:crypto')
const { ErrorValidacionSistema } = require('./erroresSistema')

const CLAVE_DEMO_FUNCIONARIOS = 'convivencia2026'

class ServicioAutenticacion {
  constructor({ servicioInstitucional, persistenciaSistema }) {
    this.servicioInstitucional = servicioInstitucional
    this.persistenciaSistema = persistenciaSistema
  }

  async iniciarSesion({ correoInstitucional, password }) {
    if (!correoInstitucional || !password) {
      throw new ErrorValidacionSistema('Correo institucional y contrasena son obligatorios.')
    }

    const funcionario = this.servicioInstitucional.consultarFuncionario(correoInstitucional)

    if (!funcionario || !this.credencialesValidas(funcionario, password)) {
      await this.registrarIntentoFallido(funcionario)
      throw new ErrorValidacionSistema('Credenciales invalidas o funcionario no autorizado.')
    }

    await this.persistenciaSistema.guardarAuditoria({
      accion: 'LOGIN_EXITOSO',
      fecha: new Date().toISOString(),
      funcionarioResponsableId: funcionario.id,
      entidad: 'funcionario',
      identificadorRelacionado: funcionario.id,
    })

    return {
      token: `sesion-${randomUUID()}`,
      funcionario: {
        id: funcionario.id,
        nombre: funcionario.nombre,
        correoInstitucional: funcionario.correoInstitucional,
        rol: funcionario.rol,
      },
    }
  }

  credencialesValidas(funcionario, password) {
    return password === (funcionario.claveAcceso || CLAVE_DEMO_FUNCIONARIOS)
  }

  async registrarIntentoFallido(funcionario) {
    if (!funcionario) {
      return
    }

    await this.persistenciaSistema.guardarAuditoria({
      accion: 'LOGIN_FALLIDO',
      fecha: new Date().toISOString(),
      funcionarioResponsableId: funcionario.id,
      entidad: 'funcionario',
      identificadorRelacionado: funcionario.id,
    })
  }
}

module.exports = {
  CLAVE_DEMO_FUNCIONARIOS,
  ServicioAutenticacion,
}
