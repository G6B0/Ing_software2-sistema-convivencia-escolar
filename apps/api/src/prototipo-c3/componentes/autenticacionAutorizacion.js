const { paso } = require('./impresora')

class AutenticacionAutorizacion {
  iniciarSesion(credenciales) {
    paso(
      'Autenticacion y Autorizacion',
      `Recibe credenciales institucionales de ${credenciales.email}.`
    )

    const usuario = {
      id: 'FUNC-001',
      nombre: 'Profesora Ana Morales',
      email: credenciales.email,
      rol: 'profesor',
      permisos: ['registrar_incidente', 'consultar_alumno', 'ver_reportes'],
    }

    paso(
      'Autenticacion y Autorizacion',
      `Credenciales validadas. Devuelve usuario con rol ${usuario.rol} a API REST.`
    )

    return usuario
  }

  verificarPermiso(usuario, permiso) {
    paso(
      'Autenticacion y Autorizacion',
      `Verifica si ${usuario.nombre} puede ejecutar "${permiso}".`
    )

    if (!usuario.permisos.includes(permiso)) {
      throw new Error(`El usuario no tiene el permiso ${permiso}.`)
    }

    paso(
      'Autenticacion y Autorizacion',
      'Permiso aprobado. La solicitud vuelve a API REST.'
    )
  }
}

module.exports = AutenticacionAutorizacion
