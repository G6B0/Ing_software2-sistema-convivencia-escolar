async function obtenerDashboard(req, res) {
  try {
    const servicioIncidentes = req.app.locals.servicioIncidentes

    const incidentes = await servicioIncidentes.listarIncidentes()

    // KPIs
    const ahora = new Date()
    const mesActual = ahora.getMonth()
    const anioActual = ahora.getFullYear()

    const incidenciasMes = incidentes.filter((i) => {
      const fecha = new Date(i.fecha)
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual
    }).length

    const graves = incidentes.filter((i) => i.gravedad === 'Grave').length

    const enSeguimiento = incidentes.filter((i) => i.estado === 'Reabierto').length

    // Alumnos reincidentes: alumnos que aparecen en más de 1 incidente
    const alumnosPorIncidente = {}
    incidentes.forEach((i) => {
      (i.participantes || []).forEach((p) => {
        if (!alumnosPorIncidente[p.alumnoInstitucionalId]) {
          alumnosPorIncidente[p.alumnoInstitucionalId] = new Set()
        }
        alumnosPorIncidente[p.alumnoInstitucionalId].add(i.id)
      })
    })
    const reincidentes = Object.values(alumnosPorIncidente).filter((set) => set.size > 1).length

    const kpis = { incidenciasMes, graves, enSeguimiento, reincidentes }

    // Distribución por gravedad
    const distribucionGravedad = [
      { gravedad: 'Leve', cantidad: incidentes.filter((i) => i.gravedad === 'Leve').length },
      { gravedad: 'Moderado', cantidad: incidentes.filter((i) => i.gravedad === 'Moderado').length },
      { gravedad: 'Grave', cantidad: incidentes.filter((i) => i.gravedad === 'Grave').length },
    ]

    // Tipos más frecuentes
    const conteoTipos = {}
    incidentes.forEach((i) => {
      const tipo = i.titulo || 'Sin tipo'
      conteoTipos[tipo] = (conteoTipos[tipo] || 0) + 1
    })
    const tiposFrecuentes = Object.entries(conteoTipos)
      .map(([tipo, cantidad]) => ({ tipo, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)

    // Últimas 5 incidencias
    const ultimasIncidencias = [...incidentes]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5)

    return res.json({
      ok: true,
      data: { kpis, distribucionGravedad, tiposFrecuentes, ultimasIncidencias },
    })
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message })
  }
}

async function obtenerRankingCursos(req, res) {
  try {
    const servicioIncidentes = req.app.locals.servicioIncidentes

    const incidentes = await servicioIncidentes.listarIncidentes()

    // Agrupar por curso usando los participantes
    const cursoMap = {}
    incidentes.forEach((i) => {
      const cursos = new Set()
      ;(i.participantes || []).forEach((p) => {
        if (p.curso) cursos.add(p.curso)
      })
      cursos.forEach((curso) => {
        if (!cursoMap[curso]) {
          cursoMap[curso] = { curso, total: 0, leve: 0, moderado: 0, grave: 0 }
        }
        cursoMap[curso].total += 1
        if (i.gravedad === 'Leve') cursoMap[curso].leve += 1
        else if (i.gravedad === 'Moderado') cursoMap[curso].moderado += 1
        else if (i.gravedad === 'Grave') cursoMap[curso].grave += 1
      })
    })

    const ranking = Object.values(cursoMap).sort((a, b) => b.total - a.total)

    return res.json({ ok: true, data: ranking })
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message })
  }
}

async function obtenerReporteMensual(req, res) {
  try {
    const servicioIncidentes = req.app.locals.servicioIncidentes

    const incidentes = await servicioIncidentes.listarIncidentes()

    const MESES = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ]

    // Agrupar por año-mes
    const mesMap = {}
    incidentes.forEach((i) => {
      const fecha = new Date(i.fecha)
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth()).padStart(2, '0')}`
      if (!mesMap[clave]) {
        mesMap[clave] = { mes: MESES[fecha.getMonth()], total: 0, leve: 0, moderado: 0, grave: 0, _orden: clave }
      }
      mesMap[clave].total += 1
      if (i.gravedad === 'Leve') mesMap[clave].leve += 1
      else if (i.gravedad === 'Moderado') mesMap[clave].moderado += 1
      else if (i.gravedad === 'Grave') mesMap[clave].grave += 1
    })

    const reporte = Object.values(mesMap)
      .sort((a, b) => a._orden.localeCompare(b._orden))
      .map(({ _orden, ...rest }) => rest)

    return res.json({ ok: true, data: reporte })
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message })
  }
}

module.exports = { obtenerDashboard, obtenerRankingCursos, obtenerReporteMensual }
