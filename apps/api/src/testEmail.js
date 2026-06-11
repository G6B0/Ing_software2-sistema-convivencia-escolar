// Importamos nuestro nuevo servicio
const { enviarCorreo } = require('./services/emailService');

const hacerPrueba = async () => {
  console.log('🚀 Iniciando prueba del Cartero...');
  
  // Llamamos a la función con datos inventados
  await enviarCorreo(
    'apoderado_falso@gmail.com', 
    'Incidente Registrado - Prueba', 
    '<h1>Notificación del Colegio</h1><p>Este es un correo de prueba.</p>'
  );

  console.log('🏁 Prueba terminada.');
};

// Ejecutamos la función
hacerPrueba();