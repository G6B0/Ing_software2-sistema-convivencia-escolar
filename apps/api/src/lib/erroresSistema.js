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

class ErrorAutorizacionSistema extends Error {
  constructor(message) {
    super(message)
    this.name = 'ErrorAutorizacionSistema'
  }
}

module.exports = {
  ErrorAutorizacionSistema,
  ErrorConfiguracionBaseDatos,
  ErrorValidacionSistema,
}
