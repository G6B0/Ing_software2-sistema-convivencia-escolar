const { ErrorValidacionSistema } = require('./erroresSistema')

class ServicioSeguimientos {
  constructor({ persistenciaSistema, servicioInstitucional }) {
    this.persistenciaSistema = persistenciaSistema
    this.servicioInstitucional = servicioInstitucional
  }

  async registrarSeguimiento(datosSeguimiento, funcionarioSesionId) {
    const funcionario = this.servicioInstitucional.consultarFuncionario(funcionarioSesionId)

    if (!funcionario) {
      throw new ErrorValidacionSistema('El funcionario responsable no existe.')
    }

    return this.persistenciaSistema.guardarSeguimiento({
      ...datosSeguimiento,
      funcionarioResponsableId: funcionario.id,
    })
  }
}

module.exports = ServicioSeguimientos
