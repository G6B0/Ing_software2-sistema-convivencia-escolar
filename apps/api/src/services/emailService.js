const nodemailer = require('nodemailer');

// 1. Configuración del transportador (El "Cartero")
// Usaremos variables de entorno para que las contraseñas no queden en el código,
// pero dejaremos valores de prueba por defecto.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true para el puerto 465, false para los demás
  auth: {
    user: process.env.EMAIL_USER || 'correo_prueba@gmail.com', // Tu correo real del colegio o pruebas
    pass: process.env.EMAIL_PASS || 'tu_contraseña_secreta',   // Contraseña de aplicación
  },
});

/**
 * 2. Función genérica para enviar correos
 * @param {string} to - Correo del destinatario (Ej: Apoderado)
 * @param {string} subject - Asunto del correo
 * @param {string} htmlContent - El cuerpo del mensaje diseñado con HTML
 */
const enviarCorreo = async (to, subject, htmlContent) => {
  try {
    // Intentamos enviar el correo
    const info = await transporter.sendMail({
      from: `"Sistema de Convivencia Escolar" <${process.env.EMAIL_USER || 'correo_prueba@gmail.com'}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    console.log(`✅ [EmailService] Correo enviado exitosamente a: ${to} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    // Si algo falla (ej: sin internet, mala contraseña), capturamos el error aquí
    console.error(`❌ [EmailService] Error al enviar correo a ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  enviarCorreo
};