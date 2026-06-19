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

    // Cursos con más incidencias (top 5)
    const cursosMap = {}
    incidentes.forEach((i) => {
      const cursos = new Set()
      ;(i.participantes || []).forEach((p) => {
        if (p.curso) cursos.add(p.curso)
      })
      cursos.forEach((curso) => {
        if (!cursosMap[curso]) {
          cursosMap[curso] = { curso, total: 0, leve: 0, moderado: 0, grave: 0 }
        }
        cursosMap[curso].total += 1
        if (i.gravedad === 'Leve') cursosMap[curso].leve += 1
        else if (i.gravedad === 'Moderado') cursosMap[curso].moderado += 1
        else if (i.gravedad === 'Grave') cursosMap[curso].grave += 1
      })
    })
    const cursosFrecuentes = Object.values(cursosMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    // Evolución mensual (últimos 6 meses)
    const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const mesMap = {}
    incidentes.forEach((i) => {
      const fecha = new Date(i.fecha)
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth()).padStart(2, '0')}`
      if (!mesMap[clave]) {
        mesMap[clave] = { mes: MESES[fecha.getMonth()], total: 0, _orden: clave }
      }
      mesMap[clave].total += 1
    })
    const evolucionMensual = Object.values(mesMap)
      .sort((a, b) => a._orden.localeCompare(b._orden))
      .slice(-6)
      .map(({ _orden, ...rest }) => rest)

    // Últimas 5 incidencias
    const ultimasIncidencias = [...incidentes]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5)

    return res.json({
      ok: true,
      data: { kpis, distribucionGravedad, tiposFrecuentes, ultimasIncidencias, cursosFrecuentes, evolucionMensual },
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

    const anioActual = new Date().getFullYear()

    // Generar estructura base de 12 meses con totales en 0
    const reporte = MESES.map((mes) => ({ mes, total: 0, leve: 0, moderado: 0, grave: 0 }))

    // Mezclar con los datos reales del año actual
    incidentes.forEach((i) => {
      const fecha = new Date(i.fecha)
      if (fecha.getFullYear() !== anioActual) return
      const mesIndex = fecha.getMonth()
      reporte[mesIndex].total += 1
      if (i.gravedad === 'Leve') reporte[mesIndex].leve += 1
      else if (i.gravedad === 'Moderado') reporte[mesIndex].moderado += 1
      else if (i.gravedad === 'Grave') reporte[mesIndex].grave += 1
    })

    return res.json({ ok: true, data: reporte })
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message })
  }
}

module.exports = { obtenerDashboard, obtenerRankingCursos, obtenerReporteMensual }
