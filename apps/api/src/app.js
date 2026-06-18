const express = require('express')
const cors = require('cors')
const ServicioInstitucional = require('./lib/servicioInstitucional')
const { ErrorAutorizacionSistema, ErrorValidacionSistema } = require('./lib/erroresSistema')
const { PersistenciaSistemaMemoria } = require('./lib/persistenciaSistema')
const ServicioIncidentes = require('./lib/servicioIncidentes')
const { ServicioAutenticacion } = require('./lib/servicioAutenticacion')
const ServicioAutorizacion = require('./lib/servicioAutorizacion')
const { PERMISOS } = require('./lib/rolesPermisos')
const seguimientoRoutes = require('./routes/seguimientoroutes')
const authRoutes = require('./routes/authRoutes')
const reportesRoutes = require('./routes/reportesRoutes')
const rolesPermisosRoutes = require('./routes/rolesPermisosRoutes')
const {
  autorizarPermisos,
  autorizarTodosLosPermisos,
} = require('./middleware/autorizacion')

const PERMISOS_CONSULTAR_INCIDENTES = [
  PERMISOS.CONSULTAR_INCIDENTES,
  PERMISOS.CONSULTAR_INCIDENTES_PROPIOS_O_GENERALES,
  PERMISOS.CONSULTAR_HISTORIAL,
  PERMISOS.REGISTRAR_SEGUIMIENTOS,
  PERMISOS.REGISTRAR_SEGUIMIENTOS_BASICOS,
  PERMISOS.MODIFICAR_GRAVEDAD,
  PERMISOS.GESTIONAR_ESTADOS_OPERATIVOS,
  PERMISOS.CAMBIAR_ESTADO_INCIDENTES,
  PERMISOS.GESTIONAR_INCIDENTES,
  PERMISOS.VISUALIZAR_REINCIDENCIA,
  PERMISOS.REVISAR_REPORTES,
  PERMISOS.CONSULTAR_REPORTES,
]

function crearApp({
  servicioInstitucional = new ServicioInstitucional(),
  persistenciaSistema = new PersistenciaSistemaMemoria(),
  servicioIncidentes = new ServicioIncidentes({ persistenciaSistema, servicioInstitucional }),
  servicioAutorizacion = new ServicioAutorizacion({
    servicioInstitucional,
    persistenciaSistema,
  }),
  servicioAutenticacion = new ServicioAutenticacion({
    persistenciaSistema,
    servicioInstitucional,
    servicioAutorizacion,
  }),
} = {}) {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.locals.servicioIncidentes = servicioIncidentes
  app.locals.servicioAutenticacion = servicioAutenticacion
  app.locals.servicioAutorizacion = servicioAutorizacion
  app.use('/', authRoutes)
  app.use('/', rolesPermisosRoutes)
  app.use('/', seguimientoRoutes)
  app.use('/', reportesRoutes)

  app.get(
    '/institucional/alumnos/:alumnoId',
    autorizarPermisos(PERMISOS.CONSULTAR_ALUMNOS),
    (req, res) => {
    const alumno = servicioInstitucional.consultarAlumnoPorId(req.params.alumnoId)

    if (!alumno) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Alumno no encontrado en la fuente institucional.',
      })
    }

    return res.json({ ok: true, data: alumno })
    }
  )

  app.get(
    '/institucional/alumnos/:alumnoId/apoderados',
    autorizarPermisos(PERMISOS.CONSULTAR_ALUMNOS),
    (req, res) => {
    const apoderados = servicioInstitucional.obtenerApoderadosDeAlumno(req.params.alumnoId)

    if (!apoderados) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Alumno no encontrado en la fuente institucional.',
      })
    }

    return res.json({ ok: true, data: apoderados })
    }
  )

  app.get(
    '/institucional/funcionarios/:identificador',
    autorizarPermisos(PERMISOS.ACCEDER_CONFIGURACION),
    (req, res) => {
    const funcionario = servicioInstitucional.consultarFuncionario(req.params.identificador)

    if (!funcionario) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Funcionario no encontrado en la fuente institucional.',
      })
    }

    return res.json({ ok: true, data: funcionario })
    }
  )

  app.get('/institucional/cursos', autorizarPermisos(PERMISOS.CONSULTAR_ALUMNOS), (req, res) => {
    const cursos = servicioInstitucional.listarCursos()
    return res.json({ ok: true, data: cursos })
  })

  app.get(
    '/institucional/cursos/:curso/alumnos',
    autorizarPermisos(PERMISOS.CONSULTAR_ALUMNOS),
    (req, res) => {
    const alumnos = servicioInstitucional.listarAlumnosPorCurso(req.params.curso)
    return res.json({ ok: true, data: alumnos })
    }
  )

  app.get('/institucional/protocolos', autorizarPermisos([
    PERMISOS.REGISTRAR_INCIDENTES,
    PERMISOS.MODIFICAR_GRAVEDAD,
    PERMISOS.GESTIONAR_INCIDENTES,
  ]), (req, res) => {
    return res.json({ ok: true, data: servicioInstitucional.protocolos })
  })

  app.post('/incidentes', autorizarTodosLosPermisos([
    PERMISOS.REGISTRAR_INCIDENTES,
    PERMISOS.CONSULTAR_ALUMNOS,
  ]), async (req, res) => {
    try {
      const funcionarioSesionId = req.header('x-funcionario-id')
      const incidente = await servicioIncidentes.registrarIncidente({
        ...req.body,
        funcionarioResponsableId: funcionarioSesionId,
      })
      return res.status(201).json({ ok: true, data: incidente })
    } catch (error) {
      if (error instanceof ErrorAutorizacionSistema) {
        return res.status(403).json({ ok: false, mensaje: error.message })
      }

      if (error instanceof ErrorValidacionSistema) {
        return res.status(400).json({ ok: false, mensaje: error.message })
      }
      console.error(error)
      return res.status(500).json({ ok: false, mensaje: 'No se pudo registrar el incidente.' })
    }
  })

  app.get('/incidentes', autorizarPermisos(PERMISOS_CONSULTAR_INCIDENTES), async (req, res) => {
    try {
      const incidentes = await servicioIncidentes.listarIncidentes()
      return res.json({ ok: true, data: incidentes })
    } catch (error) {
      return res.status(500).json({ ok: false, mensaje: 'No se pudieron obtener los incidentes.' })
    }
  })

  app.get(
    '/incidentes/:incidenteId',
    autorizarPermisos(PERMISOS_CONSULTAR_INCIDENTES),
    async (req, res) => {
    const incidente = await servicioIncidentes.consultarIncidentePorId(req.params.incidenteId)

    if (!incidente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Incidente no encontrado.',
      })
    }

      return res.json({ ok: true, data: incidente })
    }
  )
  
  app.get('/notificaciones', autorizarPermisos(PERMISOS.VISUALIZAR_ALERTAS), async (req, res) => {
    try {
      const destinatarioId = req.header('x-funcionario-id')
      if (!destinatarioId) {
        return res.status(400).json({ ok: false, mensaje: 'Falta el header x-funcionario-id' })
      }
      const limit = parseInt(req.query.limit) || 5
      const offset = parseInt(req.query.offset) || 0
      const { notificaciones, total } = await persistenciaSistema.consultarNotificacionesPorDestinatario(destinatarioId, limit, offset)
      return res.json({ ok: true, data: notificaciones, total })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ ok: false, mensaje: 'No se pudieron obtener las notificaciones.' })
    }
  })
  app.patch(
    '/notificaciones/:notificacionId/leida',
    autorizarPermisos(PERMISOS.VISUALIZAR_ALERTAS),
    async (req, res) => {
    try {
      const notificacion = await persistenciaSistema.marcarNotificacionLeida(req.params.notificacionId)

      if (!notificacion) {
        return res.status(404).json({ ok: false, mensaje: 'Notificación no encontrada.' })
      }

      return res.json({ ok: true, data: notificacion })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ ok: false, mensaje: 'No se pudo marcar la notificación como leída.' })
    }
    }
  )
  app.get(
    '/notificaciones/contador',
    autorizarPermisos(PERMISOS.VISUALIZAR_ALERTAS),
    async (req, res) => {
    try {
      const destinatarioId = req.header('x-funcionario-id')
      if (!destinatarioId) {
        return res.status(400).json({ ok: false, mensaje: 'Falta el header x-funcionario-id' })
      }
      const noLeidas = await persistenciaSistema.contarNotificacionesNoLeidas(destinatarioId)
      return res.json({ ok: true, noLeidas })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ ok: false, mensaje: 'No se pudo obtener el contador.' })
    }
    }
  )

  app.get('/test-supabase', autorizarPermisos(PERMISOS.ACCEDER_CONFIGURACION), async (_req, res) => {
    try {
      const { crearClienteSupabase } = require('./lib/supabase')
      const supabase = crearClienteSupabase()
      const { data, error } = await supabase.from('incidentes').select('*').limit(5)

      if (error) {
        return res.status(500).json({ ok: false, error: error.message })
      }

      return res.json({ ok: true, data })
    } catch (error) {
      return res.status(500).json({ ok: false, error: error.message })
    }
  })

  return app
}

module.exports = crearApp
