const { enviarCorreo } = require('./emailService');
const fs = require('fs');
const path = require('path');

const notificarApoderado = async (incidente, idAlumno, supabase) => {
  try {
    const rutaData = path.join(__dirname, '../data/institucional.json');
    const archivoContenido = fs.readFileSync(rutaData, 'utf-8');
    const datosInstitucionales = JSON.parse(archivoContenido);

    // Limpiamos el ID por si viene con espacios invisibles
    const idLimpio = String(idAlumno).trim();
    console.log(`🔍 Iniciando rastreo de correo para el alumno: "${idLimpio}"`);

    let correoDestino = null;

    // ESTRATEGIA 1: Buscar a través del Alumno -> Lista de Apoderados
    const alumnoEncontrado = datosInstitucionales.alumnos.find(
      a => String(a.id).trim().toUpperCase() === idLimpio.toUpperCase()
    );

    if (alumnoEncontrado && alumnoEncontrado.apoderados && alumnoEncontrado.apoderados.length > 0) {
      const idApoderado = alumnoEncontrado.apoderados[0];
      const apoderado = datosInstitucionales.apoderados.find(
        ap => String(ap.id).trim().toUpperCase() === String(idApoderado).trim().toUpperCase()
      );
      if (apoderado && apoderado.correo) {
        correoDestino = apoderado.correo;
      }
    }

    // ESTRATEGIA 2 (Salvavidas definitivo): Buscar en Apoderados directamente por el campo 'alumnoId'
    if (!correoDestino) {
      const apoderadoDirecto = datosInstitucionales.apoderados.find(
        ap => String(ap.alumnoId).trim().toUpperCase() === idLimpio.toUpperCase()
      );
      if (apoderadoDirecto && apoderadoDirecto.correo) {
        correoDestino = apoderadoDirecto.correo;
      }
    }

    // Verificación final del destino
    if (correoDestino) {
      console.log(`🎯 ¡ÉXITO ABSOLUTO! Correo del apoderado detectado en el sistema: ${correoDestino}`);
    } else {
      console.log(`⚠️ No se encontró coincidencia para [${idLimpio}] en el JSON. Usando correo de respaldo del sistema (.env)`);
      correoDestino = process.env.EMAIL_USER;
    }

    if (!correoDestino) {
      return { emailSent: false };
    }

    // Plantilla HTML con Filtro de Privacidad (Criterio de Aceptación 2)
    const htmlPlantilla = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e40af; margin-top: 0;">Notificación de Convivencia Escolar</h2>
        <p>Estimado/a Apoderado/a,</p>
        <p>Le informamos que se ha registrado un nuevo incidente de convivencia escolar que involucra a su pupilo/a.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Tipo de Incidente:</strong> ${incidente.titulo}</p>
          <p style="margin: 0 0 8px 0;"><strong>Nivel de Gravedad:</strong> ${incidente.gravedad}</p>
          <p style="margin: 0;"><strong>Fecha:</strong> ${new Date(incidente.fecha).toLocaleDateString('es-CL')}</p>
        </div>
        
        <p style="color: #991b1b; font-size: 13px; background: #fee2e2; padding: 10px; border-radius: 4px;">
          <em>* Por normativas institucionales de privacidad, los nombres de otros estudiantes o terceros involucrados se mantienen en estricta reserva.</em>
        </p>
        
        <p>Por favor, acérquese a la institución o contacte a inspectoría/dirección para más detalles sobre este caso.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #64748b; text-align: center;">
          Este es un mensaje automático del Sistema de Gestión de Convivencia Escolar. Por favor no responda a este correo.
        </p>
      </div>
    `;

    // Enviar el correo real
    await enviarCorreo(
      correoDestino,
      `Aviso de Convivencia Escolar - Incidente Registrado`,
      htmlPlantilla
    );

    return { emailSent: true };

  } catch (error) {
    console.error('Error crítico en notificacionService:', error.message);
    return { emailSent: false };
  }
};

module.exports = { notificarApoderado };
