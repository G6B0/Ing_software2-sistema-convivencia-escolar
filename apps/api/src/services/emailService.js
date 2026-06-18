const nodemailer = require('nodemailer');

const enviarCorreo = async (destinatario, asunto, mensajeHTML) => {
  try {
    // 1. Configuramos el "transporte" conectándolo a Gmail con tus credenciales
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 2. Ejecutamos el envío del correo
    const info = await transporter.sendMail({
      from: `"Departamento de Convivencia Escolar" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html: mensajeHTML
    });

    console.log(`✅ Correo real enviado exitosamente a ${destinatario} (ID: ${info.messageId})`);
    return { exito: true };

  } catch (error) {
    console.error('❌ Error crítico al enviar el correo real:', error);
    // Lanzamos el error para que el controlador lo atrape y aplique la resiliencia (CA3)
    throw new Error('No se pudo establecer conexión con el servidor de correos.');
  }
};

module.exports = { enviarCorreo };