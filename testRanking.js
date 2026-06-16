const API_URL = 'http://localhost:3001';

const incidentes = [
  {
    titulo: 'Agresion fisica',
    fecha: '2026-05-01',
    descripcion: 'Pelea en el recreo',
    gravedad: 'Grave',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Agresor', observacion: '' },
      { alumnoInstitucionalId: 'ALU-1002', rolEnIncidente: 'Victima', observacion: '' }
    ]
  },
  {
    titulo: 'Bullying',
    fecha: '2026-05-02',
    descripcion: 'Acoso reiterado',
    gravedad: 'Moderado',
    funcionarioResponsableId: 'FUN-3002',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1003', rolEnIncidente: 'Agresor', observacion: '' },
      { alumnoInstitucionalId: 'ALU-1004', rolEnIncidente: 'Victima', observacion: '' }
    ]
  },
  {
    titulo: 'Interrupcion de clases',
    fecha: '2026-05-03',
    descripcion: 'Alumno interrumpio reiteradamente',
    gravedad: 'Leve',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1001', rolEnIncidente: 'Involucrado', observacion: '' }
    ]
  },
  {
    titulo: 'Agresion verbal',
    fecha: '2026-05-04',
    descripcion: 'Insultos entre compañeros',
    gravedad: 'Moderado',
    funcionarioResponsableId: 'FUN-3003',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1005', rolEnIncidente: 'Agresor', observacion: '' },
      { alumnoInstitucionalId: 'ALU-1006', rolEnIncidente: 'Victima', observacion: '' }
    ]
  },
  {
    titulo: 'Daño a propiedad escolar',
    fecha: '2026-05-05',
    descripcion: 'Alumno rompio una silla',
    gravedad: 'Grave',
    funcionarioResponsableId: 'FUN-3002',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1002', rolEnIncidente: 'Agresor', observacion: '' }
    ]
  },
  {
    titulo: 'Uso de celular no autorizado',
    fecha: '2026-05-06',
    descripcion: 'Alumno uso celular durante la prueba',
    gravedad: 'Leve',
    funcionarioResponsableId: 'FUN-3001',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1003', rolEnIncidente: 'Involucrado', observacion: '' }
    ]
  },
  {
    titulo: 'Pelea entre alumnos',
    fecha: '2026-05-07',
    descripcion: 'Pelea en el pasillo',
    gravedad: 'Grave',
    funcionarioResponsableId: 'FUN-3004',
    participantes: [
      { alumnoInstitucionalId: 'ALU-1004', rolEnIncidente: 'Agresor', observacion: '' },
      { alumnoInstitucionalId: 'ALU-1005', rolEnIncidente: 'Victima', observacion: '' }
    ]
  }
];

async function registrar() {
  console.log('Registrando incidentes de prueba para ranking...\n');

  for (const inc of incidentes) {
    try {
      const response = await fetch(API_URL + '/incidentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inc)
      });

      const data = await response.json();

      if (data.ok) {
        console.log(`CORRECTO: ${inc.titulo} - ${inc.gravedad} - Participantes: ${inc.participantes.length}`);
      } else {
        console.log(`FALLO: ${inc.titulo} - ${data.mensaje}`);
      }
    } catch (error) {
      console.error(`ERROR: ${inc.titulo} - ${error.message}`);
    }
  }

  console.log('\nListo. Abre http://localhost:3000/ranking para ver el resultado.');
}

registrar();