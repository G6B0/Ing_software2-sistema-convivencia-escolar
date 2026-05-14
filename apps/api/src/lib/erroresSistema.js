class ErrorValidacionSistema extends Error {
  constructor(message) {
    super(message)
    this.name = 'ErrorValidacionSistema'
  }
}

class ErrorConfiguracionBaseDatos extends Error {
  constructor(message) {
    super(message)
    this.name = 'ErrorConfiguracionBaseDatos'
  }
}

module.exports = {
  ErrorConfiguracionBaseDatos,
  ErrorValidacionSistema,
}
