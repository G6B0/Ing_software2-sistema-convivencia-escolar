/**
 * Script para poblar seguimientos de ejemplo en TODOS los incidentes existentes.
 * Uso: node apps/api/src/seed-seguimientos.js
 */

const API_URL = 'http://localhost:3001';

const seguimientosPorIncidente = [
  // === 1. Agresion verbal en recreo (Moderado) - Camila Rojas victima, Martin Soto agresor ===
  {
    incidenteId: 'INC-98f4e53f-ecbe-4e25-83b0-2f7bb9668218',
    funcionarioId: 'FUN-3001',
    seguimientos: [
      {
        accion: 'Entrevista inicial con la alumna afectada',
        descripcion: 'Se converso con Camila Rojas en la oficina de orientacion. La alumna relato que durante el recreo Martin Soto le dirigio insultos frente a otros compañeros. Se le brindo contencion emocional y se registro su testimonio.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-14'
      },
      {
        accion: 'Entrevista con el alumno agresor',
        descripcion: 'Se cito a Martin Soto a la oficina del inspector. El alumno reconocio parcialmente los hechos, indicando que fue una discusion mutua. Se le explico la gravedad de la agresion verbal y las consecuencias en el reglamento interno.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-15'
      },
      {
        accion: 'Citacion a apoderados de ambos alumnos',
        descripcion: 'Se contacto telefonicamente a los apoderados de ambos estudiantes. La madre de Camila (Marcela Rojas) asistio el mismo dia. La madre de Martin (Carolina Soto) confirmo asistencia para el dia siguiente. Se informo sobre el protocolo de convivencia escolar.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-16'
      },
      {
        accion: 'Mediacion escolar entre los alumnos',
        descripcion: 'Se realizo sesion de mediacion con ambos estudiantes en presencia de la orientadora Elena Vargas. Martin ofrecio disculpas a Camila. Ambos firmaron compromiso de respeto mutuo. Se programo seguimiento en dos semanas.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-20'
      }
    ]
  },

  // === 2. La kaori le pego al profesor (Grave) - Tomas Navarro agresor ===
  {
    incidenteId: 'INC-20260520-d4b19a',
    funcionarioId: 'FUN-3003',
    seguimientos: [
      {
        accion: 'Reporte inmediato a direccion',
        descripcion: 'Se informo a la direccion del establecimiento sobre la agresion fisica de Tomas Navarro hacia un funcionario docente. Se activo el protocolo de agresion grave segun el reglamento interno. El alumno fue retirado de la sala de clases.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-20'
      },
      {
        accion: 'Citacion urgente al apoderado',
        descripcion: 'Se contacto a Hector Navarro (padre) quien se presento en el establecimiento el mismo dia. Se le informo la situacion y las medidas disciplinarias correspondientes. El apoderado se comprometio a reforzar conducta en el hogar.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-20'
      },
      {
        accion: 'Evaluacion psicosocial del alumno',
        descripcion: 'La orientadora Patricia Munoz realizo una evaluacion del contexto del alumno. Se identificaron factores de estres familiar que podrian estar influyendo en la conducta agresiva. Se recomendo derivacion a apoyo psicologico externo.',
        evolucionCaso: 'Sin cambios',
        fecha: '2026-05-22'
      },
      {
        accion: 'Reunion del comite de convivencia escolar',
        descripcion: 'El comite de convivencia analizo el caso y determino aplicar suspension de 3 dias con plan de reincorporacion. Se establecio un plan de acompañamiento con sesiones semanales con el orientador y compromiso de asistencia a taller de manejo de emociones.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-23'
      },
      {
        accion: 'Inicio del plan de reincorporacion',
        descripcion: 'Tomas Navarro se reincorporo a clases. Se realizo sesion de acogida con el profesor jefe y la orientadora. El alumno mostro disposicion a mejorar su conducta. Se inicio el plan de acompañamiento semanal.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 3. Pelea en recreo - Grave (Camila Rojas) ===
  {
    incidenteId: 'INC-ace0f7d8-af19-4764-8ea7-6ca22cbda2ac',
    funcionarioId: 'FUN-3002',
    seguimientos: [
      {
        accion: 'Separacion de los involucrados y primeros auxilios',
        descripcion: 'El inspector Pedro Salinas intervino para separar a los alumnos involucrados en la pelea. Se verifico que no hubiera lesiones que requirieran atencion medica. Se llevo a los estudiantes a inspeccion general para registro del incidente.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-14'
      },
      {
        accion: 'Recopilacion de testimonios de testigos',
        descripcion: 'Se entrevisto a 3 compañeros que presenciaron los hechos. Los testimonios coinciden en que la discusion comenzo por un malentendido durante un juego. Se documento toda la informacion en el libro de clases.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-15'
      },
      {
        accion: 'Reunion con apoderado de Camila Rojas',
        descripcion: 'Se reunio con Marcela Rojas (madre) para informar la situacion. La apoderada manifesto preocupacion y solicito que se tomen medidas para evitar que se repita. Se acordo un plan de seguimiento conjunto.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-16'
      }
    ]
  },

  // === 4. El Enzo le pego al Don Flojera (Moderado) - Martin Soto agresor, Valentina Perez victima ===
  {
    incidenteId: 'INC-20260526-575bca',
    funcionarioId: 'FUN-3001',
    seguimientos: [
      {
        accion: 'Registro del incidente y entrevista inicial',
        descripcion: 'Se registro el incidente en el sistema de convivencia escolar. Se entrevisto por separado a Martin Soto y Valentina Perez para obtener ambas versiones de los hechos. Valentina presenta molestia emocional por la agresion recibida.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-26'
      },
      {
        accion: 'Notificacion al inspector y contacto con apoderados',
        descripcion: 'Se notifico al inspector Pedro Salinas segun protocolo de gravedad moderada. Se contacto a los apoderados de ambos alumnos via telefonica. Carolina Soto (madre de Martin) fue informada de la situacion. Jorge Perez (padre de Valentina) solicito reunion presencial.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-26'
      },
      {
        accion: 'Reunion con apoderados y compromisos',
        descripcion: 'Se realizo reunion con ambos apoderados en la oficina de convivencia escolar. Se firmo acta de compromiso donde Martin se compromete a no repetir la conducta y a participar en taller de resolucion de conflictos. Se programo control en una semana.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 5. Le pego al otro niño (Leve) - Camila Rojas ===
  {
    incidenteId: 'INC-20260520-b57232',
    funcionarioId: 'FUN-3002',
    seguimientos: [
      {
        accion: 'Observacion preventiva y dialogo con la alumna',
        descripcion: 'Se dialogo con Camila Rojas sobre lo ocurrido. La alumna explico que fue un empujon accidental durante el juego. Se le recordaron las normas de convivencia y se registro la observacion preventiva.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-20'
      },
      {
        accion: 'Seguimiento preventivo en aula',
        descripcion: 'El profesor jefe Javier Campos realizo seguimiento en el aula durante la semana. No se observaron nuevos incidentes. La alumna muestra buena disposicion y relacion con sus compañeros.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-23'
      },
      {
        accion: 'Cierre del seguimiento preventivo',
        descripcion: 'Tras una semana de observacion sin nuevos incidentes, se determina que la situacion fue aislada. Se cierra el seguimiento preventivo con nota positiva. Se mantiene registro para referencia futura.',
        evolucionCaso: 'Resuelto',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 6. Ignacio le pego a Don Flojera (Leve) - Martin Soto victima ===
  {
    incidenteId: 'INC-20260526-98a5cd',
    funcionarioId: 'FUN-3002',
    seguimientos: [
      {
        accion: 'Dialogo con el alumno afectado',
        descripcion: 'Se converso con Martin Soto para conocer su version de los hechos. El alumno indico que recibio un empujon leve de un compañero. No presenta lesiones ni malestar significativo.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-26'
      },
      {
        accion: 'Registro de observacion y seguimiento',
        descripcion: 'Se registro la observacion en el sistema y se informo al profesor jefe del curso. Se mantendra observacion durante la semana para verificar que no se repita la situacion entre los alumnos involucrados.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 7. No trajo la flauta (Grave) - Martin Soto ===
  {
    incidenteId: 'INC-20260520-74083b',
    funcionarioId: 'FUN-3002',
    seguimientos: [
      {
        accion: 'Conversacion con el alumno sobre responsabilidad',
        descripcion: 'Se converso con Martin Soto sobre la importancia de cumplir con los materiales escolares. El alumno indico que olvido el instrumento en su casa. Se le recordo la normativa del establecimiento.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-21'
      },
      {
        accion: 'Contacto con apoderado',
        descripcion: 'Se contacto a Carolina Soto (madre) para informar sobre la situacion reiterada del alumno con sus materiales. La apoderada se compromete a supervisar que el alumno prepare su mochila la noche anterior.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-22'
      },
      {
        accion: 'Verificacion de cumplimiento',
        descripcion: 'Durante la semana siguiente, Martin trajo todos sus materiales a clase. El profesor de musica confirmo que el alumno participo normalmente en las actividades. Se mantendra en observacion.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 8. Test conflicto (Moderado) - Antonia Fuentes victima ===
  {
    incidenteId: 'INC-4f17bfa4-664e-49c0-b9c7-5ea3219a6227',
    funcionarioId: 'FUN-3001',
    seguimientos: [
      {
        accion: 'Evaluacion inicial del conflicto',
        descripcion: 'Se evaluo la situacion con Antonia Fuentes y los demas involucrados. Se identifico un conflicto interpersonal originado por diferencias en un trabajo grupal. Se registro la informacion para seguimiento.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-19'
      },
      {
        accion: 'Mediacion entre los alumnos involucrados',
        descripcion: 'La orientadora Elena Vargas facilito una sesion de mediacion donde los alumnos pudieron expresar sus puntos de vista. Se llego a acuerdos sobre como distribuir las tareas del trabajo grupal de manera equitativa.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-21'
      },
      {
        accion: 'Seguimiento post-mediacion',
        descripcion: 'Se verifico con la profesora del ramo que el grupo de trabajo esta funcionando correctamente. Antonia reporta sentirse mas comoda con la dinamica del grupo. No se han presentado nuevos conflictos.',
        evolucionCaso: 'Resuelto',
        fecha: '2026-05-26'
      }
    ]
  },

  // === 9. rogelio le pego al gabriel (Grave) - Martin Soto victima ===
  {
    incidenteId: 'INC-20260526-abd516',
    funcionarioId: 'FUN-3001',
    seguimientos: [
      {
        accion: 'Atencion inmediata al alumno agredido',
        descripcion: 'Se atendio a Martin Soto quien presento un golpe leve en el brazo. Se aplico hielo y se verifico que no requiriera atencion medica adicional. Se registro el incidente y se notifico a inspeccion general.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-26'
      },
      {
        accion: 'Activacion de protocolo de agresion grave',
        descripcion: 'Dado que se trata de una agresion fisica clasificada como grave, se activo el protocolo correspondiente. Se separo a los involucrados y se cito a los apoderados para reunion urgente al dia siguiente.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-26'
      },
      {
        accion: 'Reunion con apoderados y equipo de convivencia',
        descripcion: 'Se realizo reunion con los apoderados de ambos alumnos y el equipo de convivencia escolar. Se informaron las medidas disciplinarias y el plan de acompañamiento. Los apoderados firmaron los compromisos correspondientes.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 10. El Enzo le pego al Don Flojera (Moderado) - Martin Soto agresor, Valentina Perez victima ===
  {
    incidenteId: 'INC-20260526-25067b',
    funcionarioId: 'FUN-3001',
    seguimientos: [
      {
        accion: 'Entrevista con ambos alumnos por separado',
        descripcion: 'Se entrevisto a Martin Soto y Valentina Perez en la oficina de convivencia. Martin admitio haber empujado a Valentina durante una discusion. Valentina relato sentirse intimidada. Se registro ambos testimonios.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-26'
      },
      {
        accion: 'Llamada telefonica a apoderados',
        descripcion: 'Se contacto a Carolina Soto y Jorge Perez para informar sobre el incidente. Ambos apoderados fueron notificados del protocolo de gravedad moderada y se les cito a reunion presencial.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-26'
      },
      {
        accion: 'Sesion de mediacion y firma de compromisos',
        descripcion: 'Se llevo a cabo una mediacion guiada por la orientadora Elena Vargas. Martin pidio disculpas y ambos alumnos acordaron respetar limites. Se firmo acta de compromiso con fecha de revision en una semana.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 11. El Enzo le pego al Don Flojera (Moderado) - Martin Soto agresor, Valentina Perez victima ===
  {
    incidenteId: 'INC-20260526-998d1c',
    funcionarioId: 'FUN-3001',
    seguimientos: [
      {
        accion: 'Registro en libro de clases y entrevista',
        descripcion: 'Se dejo constancia en el libro de clases del curso de Martin Soto. Se entrevisto al alumno quien reconocio su conducta inadecuada. Se le aplico amonestacion verbal y se le explico las consecuencias de reincidir.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-26'
      },
      {
        accion: 'Contacto con apoderada y compromiso escrito',
        descripcion: 'Carolina Soto (madre de Martin) asistio al establecimiento. Se le presento el registro del incidente y firmo compromiso de apoyo al proceso formativo. Se acordo que Martin asistira a taller de habilidades sociales.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 12. El Enzo le pego al Don Flojera (Moderado) - Martin Soto agresor ===
  {
    incidenteId: 'INC-20260526-b1877b',
    funcionarioId: 'FUN-3001',
    seguimientos: [
      {
        accion: 'Intervencion del inspector en el momento',
        descripcion: 'El inspector Pedro Salinas intervino al momento del incidente. Se separo a los alumnos y se llevo a Martin Soto a inspeccion general. Se le aplico amonestacion y se registro en su hoja de vida.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-26'
      },
      {
        accion: 'Citacion a apoderado y plan correctivo',
        descripcion: 'Se cito a Carolina Soto para el dia siguiente. Se informo sobre el patron de conducta del alumno y se diseño un plan correctivo que incluye acompañamiento semanal con orientacion.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-27'
      },
      {
        accion: 'Primera sesion de acompañamiento',
        descripcion: 'Martin asistio a su primera sesion con la orientadora Elena Vargas. Se trabajo en identificacion de emociones y estrategias para resolver conflictos sin violencia. El alumno mostro buena disposicion.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 13. El Enzo le pego al Don Flojera (Moderado) - Martin Soto agresor ===
  {
    incidenteId: 'INC-20260526-d4b736',
    funcionarioId: 'FUN-3001',
    seguimientos: [
      {
        accion: 'Anotacion en hoja de vida del alumno',
        descripcion: 'Se registro la anotacion negativa en la hoja de vida de Martin Soto por agresion fisica leve hacia un compañero. Se notifico al profesor jefe del curso 7° Basico A.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-26'
      },
      {
        accion: 'Dialogo formativo con el alumno',
        descripcion: 'El encargado de convivencia Ricardo Pizarro sostuvo una conversacion formativa con Martin sobre las consecuencias de la violencia. El alumno reflexiono sobre su conducta y se mostro arrepentido.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 14. El Enzo le pego al Don Flojera (Moderado) - Martin Soto agresor ===
  {
    incidenteId: 'INC-20260526-12e35f',
    funcionarioId: 'FUN-3001',
    seguimientos: [
      {
        accion: 'Registro del incidente e intervencion inmediata',
        descripcion: 'Se registro el incidente y se realizo intervencion inmediata con Martin Soto. El alumno fue llevado a la oficina de inspeccion donde se le informaron las consecuencias de su comportamiento.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-26'
      },
      {
        accion: 'Notificacion a apoderado via telefonica',
        descripcion: 'Se llamo a Carolina Soto para informar del incidente. La apoderada se mostro preocupada por la reiteracion de la conducta y solicito una reunion con el equipo de convivencia.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-26'
      },
      {
        accion: 'Reunion con equipo de convivencia y apoderada',
        descripcion: 'Se realizo reunion con Carolina Soto, la orientadora Elena Vargas y el inspector Pedro Salinas. Se acordo un plan de intervencion intensivo con seguimiento bisemanal y derivacion a psicologo externo.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 15. le pego a rogelio (Moderado) - Valentina Perez agresor ===
  {
    incidenteId: 'INC-20260526-3b3d87',
    funcionarioId: 'FUN-3001',
    seguimientos: [
      {
        accion: 'Entrevista con Valentina Perez',
        descripcion: 'Se converso con Valentina Perez en la oficina de orientacion. La alumna indico que la agresion fue en respuesta a provocaciones verbales previas. Se le explico que la violencia no es una respuesta aceptable bajo ninguna circunstancia.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-27'
      },
      {
        accion: 'Contacto con apoderado Jorge Perez',
        descripcion: 'Se contacto a Jorge Perez (padre de Valentina) para informar el incidente. El apoderado agradecio la informacion y se comprometio a conversar con su hija en el hogar sobre manejo de conflictos.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-27'
      },
      {
        accion: 'Seguimiento en aula por profesor jefe',
        descripcion: 'El profesor jefe del curso 6° Basico C realizo observacion en aula. Valentina se integro normalmente a las actividades y no se observaron nuevas situaciones conflictivas con sus compañeros.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 16. Incidente prueba seguimiento (Leve) - Camila Rojas involucrado ===
  {
    incidenteId: 'INC-20260527-157a36',
    funcionarioId: 'FUN-3001',
    seguimientos: [
      {
        accion: 'Registro preventivo y dialogo con la alumna',
        descripcion: 'Se registro el incidente de forma preventiva. Se converso con Camila Rojas para conocer su perspectiva de los hechos. La alumna coopero y no se detectaron señales de conflicto mayor.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-27'
      },
      {
        accion: 'Observacion en recreos durante la semana',
        descripcion: 'Se solicito al inspector Sebastian Torres monitorear la situacion durante los recreos. No se reportaron nuevos incidentes ni conductas preocupantes. La alumna mantiene buena relacion con sus pares.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 17. douuuuuuuuuuuuu (Moderado) - Martin Soto agresor ===
  {
    incidenteId: 'INC-20260526-b4824a',
    funcionarioId: 'FUN-3003',
    seguimientos: [
      {
        accion: 'Evaluacion inicial por orientadora',
        descripcion: 'La orientadora Elena Vargas evaluo la situacion con Martin Soto. Se identifico que el alumno presenta dificultades para controlar impulsos en situaciones de frustracion. Se recomendo estrategias de contencion.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-25'
      },
      {
        accion: 'Derivacion a taller de habilidades socioemocionales',
        descripcion: 'Se inscribio a Martin Soto en el taller de habilidades socioemocionales que se realiza los miercoles. El alumno asistio a su primera sesion y participo activamente en las dinamicas grupales.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-26'
      },
      {
        accion: 'Informe de progreso al apoderado',
        descripcion: 'Se envio informe a Carolina Soto detallando las acciones tomadas y el progreso de Martin en el taller. La apoderada respondio positivamente y confirmo que en el hogar tambien se observan mejoras en el manejo emocional.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 18. douuuuuuuuuuuuu (Moderado) - Martin Soto agresor ===
  {
    incidenteId: 'INC-20260526-81e188',
    funcionarioId: 'FUN-3003',
    seguimientos: [
      {
        accion: 'Intervencion inmediata y contencion',
        descripcion: 'Se intervino inmediatamente para detener la situacion. Se aplico contencion emocional a Martin Soto y se le traslado a un espacio seguro. El alumno logro calmarse despues de 15 minutos.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-25'
      },
      {
        accion: 'Reunion con profesor jefe del curso',
        descripcion: 'Se reunio con el profesor jefe de 7° Basico A para analizar el contexto del incidente. El docente informo que Martin ha tenido dificultades academicas recientes que podrian estar generando frustracion.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-26'
      },
      {
        accion: 'Plan de apoyo academico y emocional',
        descripcion: 'Se diseño un plan integral que combina reforzamiento academico en las asignaturas con dificultad y sesiones de acompañamiento emocional. Carolina Soto firmo la autorizacion para el plan.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 19. Pelea en recreo (Moderado) - Camila Rojas involucrado ===
  {
    incidenteId: 'INC-3b00d474-7fdf-4e00-90ab-56f24198f59e',
    funcionarioId: 'FUN-3002',
    seguimientos: [
      {
        accion: 'Registro del incidente y atencion a involucrados',
        descripcion: 'El inspector Pedro Salinas registro el incidente. Se verifico el estado de Camila Rojas y los demas involucrados. Ninguno presento lesiones. Se llevo a los alumnos a inspeccion para declaraciones.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-14'
      },
      {
        accion: 'Entrevista con los alumnos involucrados',
        descripcion: 'Se entrevisto individualmente a cada alumno. Las versiones coinciden en que la pelea fue provocada por un malentendido durante un partido de futbol. Los alumnos reconocen que la situacion se salio de control.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-15'
      },
      {
        accion: 'Citacion a apoderados y acuerdos',
        descripcion: 'Se cito a Marcela Rojas (madre de Camila). La apoderada fue informada del incidente y de las medidas preventivas. Se firmo acta de compromiso y se acordo supervision durante los recreos.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-16'
      },
      {
        accion: 'Seguimiento semanal sin nuevos incidentes',
        descripcion: 'Tras dos semanas de observacion, no se registraron nuevos conflictos entre los involucrados. Los alumnos retomaron su relacion con normalidad. Se cierra el seguimiento activo.',
        evolucionCaso: 'Resuelto',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 20. Pelea en recreo (Leve) - Camila Rojas involucrado ===
  {
    incidenteId: 'INC-a7248739-4336-4755-8fd8-098d8b703219',
    funcionarioId: 'FUN-3002',
    seguimientos: [
      {
        accion: 'Dialogo con los involucrados en el momento',
        descripcion: 'Se converso con Camila Rojas y los demas involucrados inmediatamente despues del incidente. Se trato de una discusion menor que no llego a agresion fisica. Los alumnos se disculparon mutuamente.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-14'
      },
      {
        accion: 'Registro preventivo y monitoreo',
        descripcion: 'Se registro el incidente como preventivo en el sistema. Se solicito al inspector Sebastian Torres realizar monitoreo durante los recreos de la semana. No se observaron situaciones similares.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-16'
      },
      {
        accion: 'Cierre de caso por resolucion satisfactoria',
        descripcion: 'Despues de una semana de monitoreo sin novedades, se cierra el caso. Los alumnos involucrados mantienen buena convivencia. Se archiva como incidente leve resuelto.',
        evolucionCaso: 'Resuelto',
        fecha: '2026-05-21'
      }
    ]
  },

  // === 21. Pelea en recreo (Grave) - Camila Rojas involucrado ===
  {
    incidenteId: 'INC-20260520-c27ff7',
    funcionarioId: 'FUN-3002',
    seguimientos: [
      {
        accion: 'Activacion de protocolo de agresion grave',
        descripcion: 'Se activo el protocolo de agresion grave por la intensidad de la pelea. El inspector Pedro Salinas intervino para separar a los involucrados. Se verifico que Camila Rojas no presentara lesiones de consideracion.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-21'
      },
      {
        accion: 'Recopilacion de antecedentes y testimonios',
        descripcion: 'Se recopilaron testimonios de 4 testigos presenciales y del profesor de turno. Se documento la secuencia de hechos y se identificaron los factores desencadenantes del conflicto.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-22'
      },
      {
        accion: 'Reunion con apoderados en direccion',
        descripcion: 'Se realizo reunion en la oficina del director con Marcela Rojas y los apoderados de los demas involucrados. Se informaron las sanciones y el plan de reparacion. Todos los apoderados firmaron compromisos.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-23'
      },
      {
        accion: 'Sesion de reparacion entre los alumnos',
        descripcion: 'La orientadora Patricia Munoz facilito una sesion de justicia restaurativa donde los alumnos expresaron como se sintieron y acordaron formas de reparar la relacion. Se noto disposicion positiva de todos.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  },

  // === 22. Pelea en recreo (Grave) - Camila Rojas involucrado ===
  {
    incidenteId: 'INC-20260515-01be1b',
    funcionarioId: 'FUN-3002',
    seguimientos: [
      {
        accion: 'Intervencion de urgencia y primeros auxilios',
        descripcion: 'Se actuo de inmediato al detectar la pelea en el patio. Se separo a los involucrados y se verifico el estado fisico de cada alumno. Camila Rojas presento un rasguño leve en el brazo que fue atendido en enfermeria.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-15'
      },
      {
        accion: 'Notificacion a direccion y apoderados',
        descripcion: 'Se notifico al director y se contacto de inmediato a Marcela Rojas (madre de Camila). La apoderada se presento en el establecimiento y fue informada del incidente y las medidas adoptadas.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-15'
      },
      {
        accion: 'Evaluacion del equipo de convivencia',
        descripcion: 'El equipo de convivencia escolar se reunio para evaluar el caso. Se determino que la situacion amerita seguimiento intensivo. Se asigno a la orientadora Elena Vargas como responsable del acompañamiento.',
        evolucionCaso: 'En progreso',
        fecha: '2026-05-16'
      },
      {
        accion: 'Sesiones de acompañamiento individual',
        descripcion: 'Elena Vargas realizo dos sesiones individuales con Camila Rojas para trabajar en habilidades de resolucion de conflictos. La alumna se mostro receptiva y comprometida con mejorar su conducta.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-20'
      },
      {
        accion: 'Revision de caso y evaluacion de progreso',
        descripcion: 'Se reviso el avance del caso con el equipo de convivencia. Camila no ha presentado nuevos incidentes en las ultimas dos semanas. Se mantiene el acompañamiento quincenal como medida preventiva.',
        evolucionCaso: 'Mejorando',
        fecha: '2026-05-27'
      }
    ]
  }
];

async function insertarSeguimientos() {
  console.log('Iniciando insercion de seguimientos de ejemplo...\n');

  let totalInsertados = 0;
  let totalErrores = 0;

  for (const grupo of seguimientosPorIncidente) {
    console.log(`--- Incidente: ${grupo.incidenteId} ---`);

    for (const seg of grupo.seguimientos) {
      try {
        const response = await fetch(`${API_URL}/incidentes/${grupo.incidenteId}/seguimientos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-funcionario-id': grupo.funcionarioId
          },
          body: JSON.stringify(seg)
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`  [OK] ${seg.accion}`);
          totalInsertados++;
        } else {
          const err = await response.json().catch(() => ({}));
          console.log(`  [ERROR] ${seg.accion}: ${err.error || err.mensaje || response.status}`);
          totalErrores++;
        }
      } catch (error) {
        console.log(`  [ERROR] ${seg.accion}: ${error.message}`);
        totalErrores++;
      }
    }
    console.log('');
  }

  console.log(`\nResumen: ${totalInsertados} seguimientos insertados, ${totalErrores} errores.`);
}

insertarSeguimientos();
