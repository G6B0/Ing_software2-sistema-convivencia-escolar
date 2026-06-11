/**
 * Script para poblar base de datos con datos realistas para Sprint Review
 * Incluye incidentes en diferentes estados y con seguimientos completos
 * Uso: node apps/api/src/seed-demo.js
 */

const API_URL = 'http://localhost:3001';

const incidentes = [
  // === CERRADOS (casos resueltos) ===
  {
    titulo: 'Conflicto entre pares',
    fecha: '2026-05-10',
    descripcion: 'Discusion verbal entre dos alumnos durante el recreo por un juego de futbol. Se observo tension pero no llego a agresion fisica.',
    gravedad: 'Leve',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1006', rolEnIncidente: 'Involucrado' },
      { alumnoInstitucionalId: 'ALU-1010', rolEnIncidente: 'Involucrado' }
    ],
    estado: 'Cerrado',
    seguimientos: [
      {
        accion: 'Dialogo con ambos alumnos',
        descripcion: 'Se converso con Lucas Herrera y Tomas Navarro inmediatamente despues del incidente. Ambos explicaron su version de los hechos. Se trataba de un malentendido sobre las reglas del juego.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-10'
      },
      {
        accion: 'Mediacion escolar',
        descripcion: 'La orientadora Elena Vargas realizo sesion de mediacion donde los alumnos se disculparon mutuamente y acordaron respetar las reglas establecidas en los juegos.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-13'
      },
      {
        accion: 'Cierre del caso',
        descripcion: 'Tras una semana de observacion, los alumnos retomaron su amistad con normalidad. No se registraron nuevos conflictos. Se cierra el caso con resultado positivo.',
        evolucionCaso: 'Resuelto',
        fecha: '2026-05-17'
      }
    ]
  },
  {
    titulo: 'Uso de celular no autorizado',
    fecha: '2026-05-08',
    descripcion: 'Alumna fue sorprendida usando su telefono celular durante la clase de matematicas, lo cual esta prohibido segun el reglamento interno.',
    gravedad: 'Leve',
    funcionarioResponsableId: 'FUN-3006',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1011', rolEnIncidente: 'Involucrado' }
    ],
    estado: 'Cerrado',
    seguimientos: [
      {
        accion: 'Retencion del dispositivo',
        descripcion: 'El profesor Javier Campos retuvo el celular de Florencia Diaz segun protocolo. Se registro la falta en el libro de clases y se cito al apoderado.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-08'
      },
      {
        accion: 'Reunion con apoderado',
        descripcion: 'Natalia Diaz (madre) asistio para retirar el dispositivo. Se le informo sobre la normativa y firmo acta de compromiso. La alumna mostro disposicion a respetar la regla.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-09'
      },
      {
        accion: 'Seguimiento y cierre',
        descripcion: 'Durante dos semanas se verifico que la alumna no volviera a usar el celular en clases. Cumplimiento satisfactorio. Se cierra el caso.',
        evolucionCaso: 'Resuelto',
        fecha: '2026-05-22'
      }
    ]
  },
  {
    titulo: 'Bullying',
    fecha: '2026-04-15',
    descripcion: 'Alumna reporta que un compañero la molesta constantemente con burlas sobre su apariencia fisica, generandole malestar emocional. Situacion se ha repetido durante varias semanas.',
    gravedad: 'Grave',
    funcionarioResponsableId: 'FUN-3004',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1007', rolEnIncidente: 'Victima' },
      { alumnoInstitucionalId: 'ALU-1008', rolEnIncidente: 'Agresor' }
    ],
    estado: 'Cerrado',
    seguimientos: [
      {
        accion: 'Activacion de protocolo de acoso escolar',
        descripcion: 'Ricardo Pizarro (encargado de convivencia) activo el protocolo de acoso. Se entrevisto a Sofia Araya quien relato situacion de burlas sistematicas por parte de Benjamin Castillo.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-04-15'
      },
      {
        accion: 'Recopilacion de testimonios',
        descripcion: 'Se entrevisto a 4 compañeros del curso. Tres confirmaron haber presenciado las burlas. Se documento todo en informe formal para el comite de convivencia.',
        evolucionCaso: 'Empeorando',
        fecha: '2026-04-16'
      },
      {
        accion: 'Citacion urgente a apoderados',
        descripcion: 'Se cito a Daniela Araya (madre de Sofia) y Cristian Castillo (padre de Benjamin). Se informo la gravedad del caso y las medidas disciplinarias correspondientes.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-04-17'
      },
      {
        accion: 'Medidas disciplinarias y plan de reparacion',
        descripcion: 'El comite determino suspension de 3 dias para Benjamin con plan de reincorporacion. Se inicio plan de acompañamiento psicologico para Sofia y derivacion externa para Benjamin.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-04-18'
      },
      {
        accion: 'Sesion de reparacion',
        descripcion: 'Bajo supervision de la psicologa, Benjamin ofrecio disculpas formales a Sofia. Se firmo compromiso de no repetir conducta y respeto mutuo.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-04-25'
      },
      {
        accion: 'Seguimiento psicosocial',
        descripcion: 'Durante un mes se realizo seguimiento semanal con ambos alumnos. Sofia reporta sentirse mejor y mas segura. Benjamin muestra cambio positivo en su conducta.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-15'
      },
      {
        accion: 'Cierre del protocolo de acoso',
        descripcion: 'Tras 4 semanas sin nuevos incidentes y evaluacion positiva del psicologo, el comite cierra el caso. Se mantiene monitoreo preventivo durante el resto del semestre.',
        evolucionCaso: 'Resuelto',
        fecha: '2026-05-20'
      }
    ]
  },

  // === EN SEGUIMIENTO (casos activos con avances) ===
  {
    titulo: 'Agresion fisica',
    fecha: '2026-05-22',
    descripcion: 'Durante el recreo, un alumno empujo fuertemente a otro estudiante causandole caida y lesion menor en la rodilla. Testigos indican que fue intencional.',
    gravedad: 'Grave',
    funcionarioResponsableId: 'FUN-3002',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1004', rolEnIncidente: 'Agresor' },
      { alumnoInstitucionalId: 'ALU-1005', rolEnIncidente: 'Victima' },
      { alumnoInstitucionalId: 'ALU-1009', rolEnIncidente: 'Testigo' }
    ],
    estado: 'En seguimiento',
    seguimientos: [
      {
        accion: 'Intervencion inmediata y primeros auxilios',
        descripcion: 'El inspector Pedro Salinas intervino de inmediato. Se llevo a Antonia Fuentes a enfermeria donde se limpio y vendó la herida. No requirio atencion medica externa. Se separo a Diego Morales.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-22'
      },
      {
        accion: 'Registro de testimonios',
        descripcion: 'Se entrevisto a Isidora Vega (testigo) y otros 2 compañeros presentes. Todos confirman que Diego empujo a Antonia sin provocacion aparente. Se registro en libro de clases.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-22'
      },
      {
        accion: 'Notificacion a apoderados',
        descripcion: 'Se contacto telefonicamente a Paula Morales (madre de Diego) y Claudia Fuentes (madre de Antonia). Ambas fueron informadas y citadas para reunion urgente al dia siguiente.',
        evolucionCaso: 'Empeorando',
        fecha: '2026-05-22'
      },
      {
        accion: 'Reunion con apoderados y equipo directivo',
        descripcion: 'Se reunieron ambos apoderados con el director, inspector y encargado de convivencia. Se informaron las medidas disciplinarias y el plan de seguimiento. Diego sera suspendido 2 dias.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-23'
      },
      {
        accion: 'Inicio de acompañamiento psicosocial',
        descripcion: 'La orientadora Patricia Munoz inicio sesiones con Diego para trabajar control de impulsos. Antonia tambien recibio apoyo emocional. Se programan sesiones semanales.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  },
  {
    titulo: 'Agresion verbal',
    fecha: '2026-05-20',
    descripcion: 'Alumno profiere insultos y palabras ofensivas hacia compañera durante la clase de historia, afectando el clima del aula y generando malestar en la victima.',
    gravedad: 'Moderado',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1002', rolEnIncidente: 'Agresor' },
      { alumnoInstitucionalId: 'ALU-1003', rolEnIncidente: 'Victima' }
    ],
    estado: 'En seguimiento',
    seguimientos: [
      {
        accion: 'Intervencion en aula',
        descripcion: 'La profesora Ana Morales detuvo la clase e intervino inmediatamente. Separo a Martin Soto y registro el incidente. Se envio al alumno a inspeccion general.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-20'
      },
      {
        accion: 'Entrevistas individuales',
        descripcion: 'Se entrevisto por separado a Martin y Valentina. Martin admitio haber insultado a Valentina por frustracion con una nota. Valentina relato sentirse humillada frente al curso.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-20'
      },
      {
        accion: 'Contacto con apoderados',
        descripcion: 'Se llamo a Carolina Soto y Jorge Perez. Carolina se mostro preocupada por la conducta repetitiva de Martin. Jorge solicito reunion presencial para conocer medidas.',
        evolucionCaso: 'Empeorando',
        fecha: '2026-05-21'
      },
      {
        accion: 'Mediacion y compromiso de reparacion',
        descripcion: 'La orientadora Elena Vargas facilito sesion de mediacion. Martin ofrecio disculpas a Valentina. Se firmo compromiso y se inscribio a Martin en taller de manejo de emociones.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-24'
      }
    ]
  },
  {
    titulo: 'Cyberbullying',
    fecha: '2026-05-18',
    descripcion: 'Alumna reporta que compañeros crearon un grupo de WhatsApp para burlarse de ella, compartiendo memes ofensivos sobre su apariencia. La situacion afecta su salud emocional.',
    gravedad: 'Grave',
    funcionarioResponsableId: 'FUN-3003',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Victima' },
      { alumnoInstitucionalId: 'ALU-1012', rolEnIncidente: 'Agresor' },
      { alumnoInstitucionalId: 'ALU-1004', rolEnIncidente: 'Agresor' }
    ],
    estado: 'En seguimiento',
    seguimientos: [
      {
        accion: 'Denuncia formal y activacion de protocolo',
        descripcion: 'La apoderada Marcela Rojas presento denuncia formal con capturas de pantalla del grupo. La orientadora Elena Vargas activo protocolo de ciberacoso escolar.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-18'
      },
      {
        accion: 'Recopilacion de evidencia digital',
        descripcion: 'Se solicitaron los celulares de Mateo Aguilera y Diego Morales. Se documentaron los mensajes ofensivos y se identifico a otros 3 participantes del grupo.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-19'
      },
      {
        accion: 'Citacion urgente a todos los apoderados',
        descripcion: 'Se cito a los apoderados de los 5 alumnos involucrados. Se les informo la gravedad del ciberacoso y las consecuencias legales y disciplinarias que contempla el reglamento.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-20'
      },
      {
        accion: 'Situacion se agrava - nuevo grupo creado',
        descripcion: 'Se detecto que los agresores crearon un nuevo grupo con otros compañeros. Camila reporta aumento de ansiedad y solicito no asistir a clases. La situacion escalo a pesar de las medidas.',
        evolucionCaso: 'Empeorando',
        fecha: '2026-05-21'
      },
      {
        accion: 'Medidas disciplinarias reforzadas',
        descripcion: 'El comite determino suspension de 5 dias para los agresores y cambio de curso para dos de ellos. Se programo charla sobre ciberacoso para todo el nivel. Derivacion a OPD comunal.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-22'
      },
      {
        accion: 'Apoyo psicologico intensivo a la victima',
        descripcion: 'Camila Rojas inicio sesiones con psicologa externa dos veces por semana. En el colegio recibe acompañamiento diario de la orientadora. Se monitorea su estado emocional constantemente.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-25'
      }
    ]
  },
  {
    titulo: 'Falta de respeto a funcionario',
    fecha: '2026-05-24',
    descripcion: 'Alumno responde de manera irrespetuosa al inspector cuando este le llama la atencion por correr en el pasillo, usando lenguaje inapropiado y actitud desafiante.',
    gravedad: 'Moderado',
    funcionarioResponsableId: 'FUN-3008',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1010', rolEnIncidente: 'Agresor' }
    ],
    estado: 'En seguimiento',
    seguimientos: [
      {
        accion: 'Registro inmediato del incidente',
        descripcion: 'El inspector Sebastian Torres registro la falta grave en el libro de clases. Se llevo a Tomas Navarro a la oficina del encargado de convivencia.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-24'
      },
      {
        accion: 'Entrevista con el alumno',
        descripcion: 'Ricardo Pizarro converso con Tomas sobre el respeto a la autoridad escolar. El alumno mostro arrepentimiento y explico que estaba frustrado por problemas familiares.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-24'
      },
      {
        accion: 'Citacion al apoderado',
        descripcion: 'Se cito a Hector Navarro para informar la situacion. El apoderado confirmo dificultades familiares recientes. Se acordo trabajo conjunto entre familia y colegio.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      },
      {
        accion: 'Seguimiento semanal - conducta sin variacion',
        descripcion: 'Tras una semana de monitoreo, Tomas mantiene actitud similar. No hay nuevos incidentes graves pero tampoco mejoria notable en su trato con funcionarios. Situacion familiar sigue compleja.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-29'
      }
    ]
  },

  // === ABIERTOS (casos recientes) ===
  {
    titulo: 'Hurto o robo',
    fecha: '2026-05-28',
    descripcion: 'Alumno reporta la desaparicion de su estuche con utiles escolares de su mochila durante la clase de educacion fisica. Otros compañeros tambien reportan perdidas similares en dias anteriores.',
    gravedad: 'Moderado',
    funcionarioResponsableId: 'FUN-3002',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1006', rolEnIncidente: 'Victima' }
    ],
    estado: 'Abierto',
    seguimientos: [
      {
        accion: 'Registro inicial de la denuncia',
        descripcion: 'Lucas Herrera reporto al inspector Pedro Salinas la perdida de su estuche. Se registro el incidente y se inicio investigacion. Se consulto si otros alumnos notaron algo inusual.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-28'
      },
      {
        accion: 'Revision de camaras de seguridad',
        descripcion: 'Se solicito al equipo de seguridad revisar las grabaciones del pasillo cerca del camarín. Se identificaron los momentos en que los alumnos dejaron sus pertenencias.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-28'
      },
      {
        accion: 'Investigacion sin avances',
        descripcion: 'Las camaras no capturaron el momento del hurto debido a angulo de vision. Se entrevisto a compañeros pero nadie vio nada sospechoso. No hay nuevas pistas sobre el responsable.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-30'
      }
    ]
  },
  {
    titulo: 'Pelea entre alumnos',
    fecha: '2026-05-27',
    descripcion: 'Dos alumnos se enfrentaron fisicamente en el patio durante el almuerzo. Intercambiaron golpes antes de que funcionarios pudieran separarlos. Uno de ellos presenta hematoma en el rostro.',
    gravedad: 'Grave',
    funcionarioResponsableId: 'FUN-3002',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1008', rolEnIncidente: 'Agresor' },
      { alumnoInstitucionalId: 'ALU-1012', rolEnIncidente: 'Agresor' },
      { alumnoInstitucionalId: 'ALU-1011', rolEnIncidente: 'Testigo' }
    ],
    estado: 'Abierto',
    seguimientos: [
      {
        accion: 'Separacion de los involucrados',
        descripcion: 'El inspector Pedro Salinas y la profesora Ana Morales separaron a Benjamin Castillo y Mateo Aguilera. Se verifico que Benjamin presentara hematoma en pomulo derecho.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-27'
      },
      {
        accion: 'Atencion de primeros auxilios',
        descripcion: 'Se llevo a Benjamin a enfermeria donde se aplico hielo. Se contacto a su apoderado Cristian Castillo quien autorizo que fuera llevado al servicio de urgencia para descarte.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-27'
      },
      {
        accion: 'Entrevistas iniciales',
        descripcion: 'Se entrevisto por separado a ambos alumnos y a la testigo Florencia Diaz. Versiones contradictorias sobre quien inicio la agresion. Se requiere mas investigacion.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-27'
      }
    ]
  },
  {
    titulo: 'Discriminacion',
    fecha: '2026-05-29',
    descripcion: 'Alumna extranjera reporta que compañeros la excluyen de actividades grupales y hacen comentarios xenofobicos sobre su nacionalidad. Situacion se repite desde hace dos semanas.',
    gravedad: 'Grave',
    funcionarioResponsableId: 'FUN-3004',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1009', rolEnIncidente: 'Victima' }
    ],
    estado: 'Abierto',
    seguimientos: [
      {
        accion: 'Recepcion de la denuncia',
        descripcion: 'Fernanda Vega (madre de Isidora) se presento en el colegio para reportar la situacion de discriminacion que afecta a su hija. Ricardo Pizarro registro la denuncia formalmente.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-29'
      },
      {
        accion: 'Entrevistas con compañeros del curso',
        descripcion: 'Se entrevisto a varios compañeros de Isidora. Algunos confirmaron comentarios inadecuados pero minimizaron su gravedad. Se identifico a tres alumnos como principales responsables.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-30'
      }
    ]
  },
  {
    titulo: 'Interrupcion de clases',
    fecha: '2026-05-29',
    descripcion: 'Alumno interrumpe constantemente la clase de lenguaje con bromas y comentarios fuera de lugar, impidiendo el normal desarrollo de la actividad pedagogica.',
    gravedad: 'Leve',
    funcionarioResponsableId: 'FUN-3006',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1004', rolEnIncidente: 'Involucrado' }
    ],
    estado: 'Abierto',
    seguimientos: []
  },
  {
    titulo: 'Daño a propiedad escolar',
    fecha: '2026-05-30',
    descripcion: 'Se encontro rayado con marcador permanente en la pared del baño de varones. El mensaje contiene lenguaje inapropiado. Se identifico a alumno sospechoso mediante revision de camaras.',
    gravedad: 'Moderado',
    funcionarioResponsableId: 'FUN-3008',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1002', rolEnIncidente: 'Sospechoso' }
    ],
    estado: 'Abierto',
    seguimientos: [
      {
        accion: 'Constatacion del daño',
        descripcion: 'El inspector Sebastian Torres constato el rayado en el baño del segundo piso. Se tomo fotografia como evidencia. Se estima que el daño ocurrio durante la jornada de la mañana.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-30'
      }
    ]
  },
  {
    titulo: 'Accidente escolar',
    fecha: '2026-05-30',
    descripcion: 'Alumna sufre caida en las escaleras durante el cambio de hora. Presenta dolor en tobillo derecho y dificultad para caminar. Se activa protocolo de accidente escolar.',
    gravedad: 'Moderado',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1007', rolEnIncidente: 'Victima' }
    ],
    estado: 'Abierto',
    seguimientos: [
      {
        accion: 'Atencion inmediata',
        descripcion: 'La profesora Ana Morales auxilio a Sofia Araya tras la caida. Se llevo a enfermeria donde se inmovilizo el tobillo. Se lleno formulario de accidente escolar.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-30'
      },
      {
        accion: 'Traslado a centro asistencial',
        descripcion: 'Se contacto a Daniela Araya (madre) quien autorizo traslado al hospital. El inspector acompaño a la alumna al servicio de urgencia para atencion con seguro escolar.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-30'
      }
    ]
  }
];

async function seed() {
  console.log('=== INICIANDO SEED DE DATOS DEMO ===\n');

  let totalIncidentes = 0;
  let totalSeguimientos = 0;
  let errores = 0;

  for (const inc of incidentes) {
    try {
      const seguimientos = inc.seguimientos || [];
      delete inc.seguimientos;

      // Crear incidente
      const resIncidente = await fetch(`${API_URL}/incidentes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inc)
      });

      if (!resIncidente.ok) {
        const err = await resIncidente.json().catch(() => ({}));
        console.log(`❌ Error creando "${inc.titulo}": ${err.mensaje || resIncidente.status}`);
        errores++;
        continue;
      }

      const dataIncidente = await resIncidente.json();
      const incidenteId = dataIncidente.data.id;
      console.log(`✅ Incidente creado: ${inc.titulo} (${incidenteId}) - Estado: ${inc.estado}`);
      totalIncidentes++;

      // Actualizar estado si no es "Abierto"
      if (inc.estado !== 'Abierto') {
        await fetch(`${API_URL}/incidentes/${incidenteId}/estado`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-funcionario-id': inc.funcionarioResponsableId
          },
          body: JSON.stringify({ estado: inc.estado })
        });
      }

      // Crear seguimientos
      for (const seg of seguimientos) {
        const resSeg = await fetch(`${API_URL}/incidentes/${incidenteId}/seguimientos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-funcionario-id': inc.funcionarioResponsableId
          },
          body: JSON.stringify(seg)
        });

        if (resSeg.ok) {
          totalSeguimientos++;
          console.log(`   📝 Seguimiento: ${seg.accion}`);
        } else {
          const err = await resSeg.json().catch(() => ({}));
          console.log(`   ❌ Error en seguimiento: ${err.error || resSeg.status}`);
          errores++;
        }
      }

      console.log('');
    } catch (error) {
      console.log(`❌ Error procesando "${inc.titulo}": ${error.message}`);
      errores++;
    }
  }

  console.log('\n=== RESUMEN ===');
  console.log(`Incidentes creados: ${totalIncidentes}`);
  console.log(`Seguimientos creados: ${totalSeguimientos}`);
  console.log(`Errores: ${errores}`);
  console.log('\nDistribucion por estado:');
  console.log(`  • Cerrados: ${incidentes.filter(i => i.estado === 'Cerrado').length}`);
  console.log(`  • En seguimiento: ${incidentes.filter(i => i.estado === 'En seguimiento').length}`);
  console.log(`  • Abiertos: ${incidentes.filter(i => i.estado === 'Abierto').length}`);
}

seed();
