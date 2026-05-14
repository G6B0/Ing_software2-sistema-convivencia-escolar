const express = require('express')
const cors = require('cors')
const ServicioInstitucional = require('./lib/servicioInstitucional')

function crearApp({ servicioInstitucional = new ServicioInstitucional() } = {}) {
  const app = express()

  app.use(cors())
  app.use(express.json())

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

  app.get('/test-supabase', async (_req, res) => {
    try {
      const supabase = require('./lib/supabase')
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
