const express = require('express')
const cors = require('cors')
const ServicioInstitucional = require('./lib/servicioInstitucional')
const { ErrorValidacionSistema } = require('./lib/erroresSistema')
const { PersistenciaSistemaMemoria } = require('./lib/persistenciaSistema')
const ServicioIncidentes = require('./lib/servicioIncidentes')
const seguimientoRoutes = require('./routes/seguimientoroutes')

function crearApp({
  servicioInstitucional = new ServicioInstitucional(),
  persistenciaSistema = new PersistenciaSistemaMemoria(),
  servicioIncidentes = new ServicioIncidentes({ persistenciaSistema, servicioInstitucional }),
} = {}) {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.locals.servicioIncidentes = servicioIncidentes
  app.use('/', seguimientoRoutes)

  app.get('/institucional/alumnos/:alumnoId', (req, res) => {
    const alumno = servicioInstitucional.consultarAlumnoPorId(req.params.alumnoId)

    if (!alumno) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Alumno no encontrado en la fuente institucional.',
      })
    }

    return res.json({ ok: true, data: alumno })
  })

  app.get('/institucional/alumnos/:alumnoId/apoderados', (req, res) => {
    const apoderados = servicioInstitucional.obtenerApoderadosDeAlumno(req.params.alumnoId)

    if (!apoderados) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Alumno no encontrado en la fuente institucional.',
      })
    }

    return res.json({ ok: true, data: apoderados })
  })

  app.get('/institucional/funcionarios/:identificador', (req, res) => {
    const funcionario = servicioInstitucional.consultarFuncionario(req.params.identificador)

    if (!funcionario) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Funcionario no encontrado en la fuente institucional.',
      })
    }

    return res.json({ ok: true, data: funcionario })
  })

  app.post('/incidentes', async (req, res) => {
    try {
      const incidente = await servicioIncidentes.registrarIncidente(req.body)
      return res.status(201).json({ ok: true, data: incidente })
    } catch (error) {
      if (error instanceof ErrorValidacionSistema) {
        return res.status(400).json({ ok: false, mensaje: error.message })
      }

      return res.status(500).json({ ok: false, mensaje: 'No se pudo registrar el incidente.' })
    }
  })

  app.get('/incidentes', async (req, res) => {
    try {
      const incidentes = await servicioIncidentes.listarIncidentes()
      return res.json({ ok: true, data: incidentes })
    } catch (error) {
      return res.status(500).json({ ok: false, mensaje: 'No se pudieron obtener los incidentes.' })
    }
  })

  app.get('/incidentes/:incidenteId', async (req, res) => {
    const incidente = await servicioIncidentes.consultarIncidentePorId(req.params.incidenteId)

    if (!incidente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Incidente no encontrado.',
      })
    }

    return res.json({ ok: true, data: incidente })
  })

  app.get('/test-supabase', async (_req, res) => {
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
