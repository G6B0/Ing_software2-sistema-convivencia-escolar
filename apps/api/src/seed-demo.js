/**
 * Script para poblar base de datos con datos realistas para demo
 * Genera incidentes distribuidos de enero a junio 2026
 * Uso: node apps/api/src/seed-demo.js
 */

const path = require('path');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { crearClienteSupabase } = require('./lib/supabase');

const ALUMNOS = [
  'ALU-1001','ALU-1002','ALU-1003','ALU-1004','ALU-1005','ALU-1006',
  'ALU-1007','ALU-1008','ALU-1009','ALU-1010','ALU-1011','ALU-1012'
];
const FUNCIONARIOS = ['FUN-3001','FUN-3002','FUN-3006','FUN-3008','FUN-3009'];
const ROLES = ['Agresor','Victima','Testigo','Involucrado'];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(n, arr.length));
};

const plantillas = [
  { titulo: 'Conflicto entre pares', gravedad: 'Leve', desc: 'Discusion verbal entre alumnos durante el recreo. Se observo tension pero no hubo agresion fisica.' },
  { titulo: 'Agresion verbal', gravedad: 'Moderado', desc: 'Alumno profiere insultos hacia compañero durante la clase, afectando el clima del aula.' },
  { titulo: 'Agresion fisica', gravedad: 'Grave', desc: 'Alumno empujo a compañero causando caida y lesion menor. Testigos confirman que fue intencional.' },
  { titulo: 'Bullying', gravedad: 'Grave', desc: 'Alumno reporta ser molestado constantemente con burlas, generando malestar emocional sostenido.' },
  { titulo: 'Cyberbullying', gravedad: 'Grave', desc: 'Se detecta grupo de mensajeria donde se comparten memes ofensivos sobre un compañero.' },
  { titulo: 'Uso de celular no autorizado', gravedad: 'Leve', desc: 'Alumno sorprendido usando telefono durante clase, incumpliendo el reglamento interno.' },
  { titulo: 'Interrupcion de clases', gravedad: 'Leve', desc: 'Alumno interrumpe reiteradamente la clase con comentarios fuera de lugar.' },
  { titulo: 'Hurto o robo', gravedad: 'Moderado', desc: 'Alumno reporta desaparicion de pertenencias personales de su mochila durante clases.' },
  { titulo: 'Pelea entre alumnos', gravedad: 'Grave', desc: 'Dos alumnos se enfrentaron fisicamente en el patio. Intercambiaron golpes antes de ser separados.' },
  { titulo: 'Daño a propiedad escolar', gravedad: 'Moderado', desc: 'Se encontro mobiliario dañado intencionalmente en sala de clases.' },
  { titulo: 'Falta de respeto a funcionario', gravedad: 'Moderado', desc: 'Alumno responde de manera irrespetuosa a funcionario usando lenguaje inapropiado.' },
  { titulo: 'Discriminacion', gravedad: 'Grave', desc: 'Alumno reporta ser excluido de actividades grupales y recibir comentarios discriminatorios.' },
  { titulo: 'Accidente escolar', gravedad: 'Moderado', desc: 'Alumno sufre caida en escaleras durante cambio de hora, presenta dolor y dificultad para caminar.' },
  { titulo: 'Consumo de sustancias', gravedad: 'Grave', desc: 'Se detecto olor a tabaco en sector de baños, alumno fue identificado por inspector.' },
  { titulo: 'Copia en evaluacion', gravedad: 'Leve', desc: 'Alumno fue sorprendido copiando durante prueba de matematicas, profesor retiro la evaluacion.' },
  { titulo: 'Inasistencia reiterada', gravedad: 'Leve', desc: 'Alumno acumula inasistencias injustificadas durante las ultimas semanas.' },
  { titulo: 'Deterioro de material didactico', gravedad: 'Leve', desc: 'Se encontraron libros de biblioteca con paginas arrancadas, alumno identificado por registro de prestamo.' },
  { titulo: 'Amenazas entre alumnos', gravedad: 'Grave', desc: 'Alumno amenaza verbalmente a compañero con hacerle daño fuera del colegio.' },
];

const accionesSeg = [
  { accion: 'Intervencion inmediata', desc: 'Funcionario intervino de inmediato, separando a los involucrados y registrando los hechos.' },
  { accion: 'Entrevista con alumno', desc: 'Se entrevisto al alumno involucrado para conocer su version de los hechos y motivaciones.' },
  { accion: 'Dialogo con ambos alumnos', desc: 'Se converso con los alumnos involucrados para mediar y buscar solucion al conflicto.' },
  { accion: 'Contacto con apoderado', desc: 'Se contacto telefonicamente al apoderado para informar la situacion y coordinar acciones.' },
  { accion: 'Reunion con apoderado', desc: 'Apoderado asistio al colegio para reunion presencial. Se informaron medidas y se firmo compromiso.' },
  { accion: 'Mediacion escolar', desc: 'Orientador realizo sesion de mediacion donde los alumnos dialogaron y acordaron compromisos.' },
  { accion: 'Derivacion a orientacion', desc: 'Se derivo al alumno a orientacion para evaluacion y acompañamiento psicosocial.' },
  { accion: 'Seguimiento semanal', desc: 'Se realizo seguimiento durante la semana observando mejoria en la conducta del alumno.' },
  { accion: 'Cierre del caso', desc: 'Tras periodo de observacion sin nuevos incidentes, se cierra el caso con resultado positivo.' },
  { accion: 'Aplicacion de medida disciplinaria', desc: 'Se aplico medida disciplinaria segun reglamento interno. Se informo a apoderado.' },
  { accion: 'Sesion de reparacion', desc: 'Se realizo sesion supervisada donde el alumno ofrecio disculpas y se comprometio a mejorar.' },
  { accion: 'Recopilacion de testimonios', desc: 'Se entrevisto a testigos presenciales para documentar los hechos con mayor precision.' },
];

const evoluciones = ['Sin cambios','Mejorando','Empeorando','En progreso','Resuelto'];

function generarFecha(mes, maxDia) {
  const dia = Math.floor(Math.random() * maxDia) + 1;
  return `2026-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
}

function sumarDias(fecha, dias) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  if (d > new Date('2026-12-28')) return '2026-12-28';
  return d.toISOString().slice(0, 10);
}

function generarSeguimientos(fecha, estado) {
  const segs = [];
  const numSegs = estado === 'Cerrado' ? 3 + Math.floor(Math.random() * 3)
    : estado === 'En seguimiento' ? 2 + Math.floor(Math.random() * 3)
    : Math.floor(Math.random() * 2);

  let fechaSeg = fecha;
  for (let i = 0; i < numSegs; i++) {
    const seg = accionesSeg[Math.min(i, accionesSeg.length - 1)];
    const isLast = i === numSegs - 1;
    let evol;
    if (estado === 'Cerrado' && isLast) evol = 'Resuelto';
    else if (i === 0) evol = 'Sin cambios';
    else evol = pick(['Mejorando','Sin cambios','En progreso']);

    segs.push({
      accion: accionesSeg[i % accionesSeg.length].accion,
      descripcion: accionesSeg[i % accionesSeg.length].desc,
      evolucionCaso: evol,
      fecha: fechaSeg
    });
    fechaSeg = sumarDias(fechaSeg, 1 + Math.floor(Math.random() * 5));
  }
  return segs;
}

function generarParticipantes(numAlumnos) {
  const alumnos = pickN(ALUMNOS, numAlumnos);
  return alumnos.map((id, i) => ({
    alumnoInstitucionalId: id,
    rolEnIncidente: i === 0 ? pick(['Agresor','Involucrado']) : i === 1 ? 'Victima' : pick(['Testigo','Involucrado'])
  }));
}

// Distribución de incidentes por mes (enero a diciembre)
const distribucion = [
  { mes: 1, cantidad: 3, maxDia: 28 },
  { mes: 2, cantidad: 4, maxDia: 28 },
  { mes: 3, cantidad: 6, maxDia: 28 },
  { mes: 4, cantidad: 8, maxDia: 28 },
  { mes: 5, cantidad: 12, maxDia: 28 },
  { mes: 6, cantidad: 10, maxDia: 25 },
  { mes: 7, cantidad: 5, maxDia: 28 },
  { mes: 8, cantidad: 7, maxDia: 28 },
  { mes: 9, cantidad: 9, maxDia: 28 },
  { mes: 10, cantidad: 11, maxDia: 28 },
  { mes: 11, cantidad: 8, maxDia: 28 },
  { mes: 12, cantidad: 4, maxDia: 20 },
];

const incidentes = [];

for (const { mes, cantidad, maxDia } of distribucion) {
  for (let i = 0; i < cantidad; i++) {
    const plantilla = plantillas[Math.floor(Math.random() * plantillas.length)];
    const fecha = generarFecha(mes, maxDia);
    const estado = mes <= 6 ? 'Cerrado'
      : mes <= 9 ? pick(['Cerrado','Cerrado','En seguimiento'])
      : mes <= 11 ? pick(['Cerrado','En seguimiento','En seguimiento','Abierto'])
      : pick(['Abierto','Abierto','En seguimiento','En seguimiento','Cerrado']);

    incidentes.push({
      titulo: plantilla.titulo,
      fecha,
      descripcion: plantilla.desc,
      gravedad: plantilla.gravedad,
      funcionarioResponsableId: pick(FUNCIONARIOS),
      participantes: generarParticipantes(1 + Math.floor(Math.random() * 3)),
      estado,
      seguimientos: generarSeguimientos(fecha, estado)
    });
  }
}

// Ordenar cronológicamente
incidentes.sort((a, b) => a.fecha.localeCompare(b.fecha));

async function limpiarBaseDeDatos() {
  console.log('=== LIMPIANDO BASE DE DATOS ===\n');
  const supabase = crearClienteSupabase();
  const tablas = ['notificaciones', 'auditorias', 'seguimientos', 'incidente_participantes', 'incidentes'];
  for (const tabla of tablas) {
    const { error } = await supabase.from(tabla).delete().neq('id', '');
    if (error) console.log(`  ❌ Error limpiando ${tabla}: ${error.message}`);
    else console.log(`  ✅ ${tabla} limpiada`);
  }
  console.log('');
}

function crearId(prefijo, fecha) {
  if (prefijo === 'INC') {
    const d = new Date(fecha);
    const yyyymmdd = d.getFullYear().toString()
      + String(d.getMonth() + 1).padStart(2, '0')
      + String(d.getDate()).padStart(2, '0');
    return `${prefijo}-${yyyymmdd}-${randomUUID().slice(0, 6)}`;
  }
  return `${prefijo}-${randomUUID().slice(0, 8)}`;
}

async function seed() {
  const supabase = crearClienteSupabase();
  await limpiarBaseDeDatos();
  console.log('=== INICIANDO SEED (insercion directa Supabase) ===\n');
  console.log(`Total de incidentes a crear: ${incidentes.length}\n`);

  const DIRECTOR_ID = 'FUN-3009';
  let totalIncidentes = 0;
  let totalSeguimientos = 0;
  let totalNotificaciones = 0;
  let errores = 0;

  for (const inc of incidentes) {
    try {
      const seguimientos = inc.seguimientos || [];
      const incidenteId = crearId('INC', inc.fecha);

      // Insertar incidente
      const { error: errInc } = await supabase.from('incidentes').insert({
        id: incidenteId,
        titulo: inc.titulo,
        fecha: `${inc.fecha}T10:00:00Z`,
        descripcion: inc.descripcion,
        gravedad: inc.gravedad,
        estado: inc.estado,
        funcionario_responsable_id: inc.funcionarioResponsableId,
        creado_en: new Date().toISOString(),
      });

      if (errInc) {
        console.log(`❌ Error "${inc.titulo}": ${errInc.message}`);
        errores++;
        continue;
      }

      // Insertar participantes
      for (const p of inc.participantes) {
        const { error: errPar } = await supabase.from('incidente_participantes').insert({
          id: crearId('PAR'),
          incidente_id: incidenteId,
          alumno_institucional_id: p.alumnoInstitucionalId,
          rol_en_incidente: p.rolEnIncidente,
        });
        if (errPar) {
          console.log(`   ❌ Participante error: ${errPar.message}`);
          errores++;
        }
      }

      // Insertar seguimientos
      for (const seg of seguimientos) {
        const { error: errSeg } = await supabase.from('seguimientos').insert({
          id: crearId('SEG'),
          incidente_id: incidenteId,
          accion: seg.accion,
          evolucion_caso: seg.evolucionCaso,
          fecha: `${seg.fecha}T10:00:00Z`,
          funcionario_responsable_id: inc.funcionarioResponsableId,
        });
        if (errSeg) {
          console.log(`   ❌ Seg error: ${errSeg.message}`);
          errores++;
        } else {
          totalSeguimientos++;
        }
      }

      // Insertar notificacion para director si es grave
      if (inc.gravedad === 'Grave') {
        const { error: errNot } = await supabase.from('notificaciones').insert({
          id: crearId('NOT'),
          titulo: `Incidente grave: ${inc.titulo}`,
          incidente_id: incidenteId,
          fecha_creacion: `${inc.fecha}T10:00:00Z`,
          leida: false,
          destinatario_id: DIRECTOR_ID,
        });
        if (!errNot) totalNotificaciones++;
      }

      console.log(`✅ ${inc.fecha} | ${inc.titulo} (${inc.gravedad}) → ${inc.estado}`);
      totalIncidentes++;
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      errores++;
    }
  }

  console.log('\n=== RESUMEN ===');
  console.log(`Incidentes creados: ${totalIncidentes}`);
  console.log(`Seguimientos creados: ${totalSeguimientos}`);
  console.log(`Notificaciones creadas: ${totalNotificaciones}`);
  console.log(`Errores: ${errores}`);

  const porMes = {};
  incidentes.forEach(i => {
    const m = parseInt(i.fecha.split('-')[1]);
    porMes[m] = (porMes[m] || 0) + 1;
  });
  const MESES = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  console.log('\nDistribucion por mes:');
  Object.entries(porMes).sort((a,b) => a[0]-b[0]).forEach(([m, n]) => {
    console.log(`  ${MESES[m]}: ${n}`);
  });
}

seed();
