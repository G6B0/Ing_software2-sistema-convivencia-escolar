const { paso } = require('./impresora')

class Notificaciones {
  notificarApoderados(incidente, apoderados) {
    paso(
      'Notificaciones',
      `Recibe incidente ${incidente.id} y lista de apoderados para preparar correos.`
    )

    apoderados.forEach((apoderado) => {
      paso(
        'Notificaciones',
        `Envia correo al Servicio de Email para ${apoderado.email}: incidente "${incidente.titulo}".`
      )
    })

    paso(
      'Notificaciones',
      'Servicio de Email confirma envio y Notificaciones informa resultado a API REST.'
    )
  }

  alertarEquipoConvivencia(resultadoReincidencia) {
    if (!resultadoReincidencia.superaUmbral) {
      paso(
        'Notificaciones',
        'No se genera alerta interna porque el alumno no supera el umbral de reincidencia.'
      )
      return
    }

    paso(
      'Notificaciones',
      `Genera alerta para orientadores y convivencia escolar por reincidencia de ${resultadoReincidencia.alumno.nombre}.`
    )
  }
}

module.exports = Notificaciones
