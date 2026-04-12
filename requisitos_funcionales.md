# Requisitos funcionales del sistema

## 1. Gestión de perfil del alumno

**RF-01.** El sistema debe permitir registrar alumnos con los siguientes datos: identificador, nombre completo, RUT, curso, año de ingreso, apoderado(s), contacto de emergencia y fotografía.

**RF-02.** El sistema debe permitir visualizar el perfil completo del alumno a funcionarios autorizados.

**RF-03.** El sistema debe permitir buscar alumnos por identificador, nombre completo, RUT, curso o año de ingreso.

**RF-04.** El sistema debe permitir actualizar la información del perfil del alumno a usuarios autorizados.

**RF-05.** El sistema debe permitir asociar uno o más apoderados a un alumno.

**RF-06.** El sistema debe permitir actualizar la información de contacto de los apoderados y del contacto de emergencia.

**RF-07.** El sistema debe permitir registrar y actualizar la fotografía del alumno.

**RF-08.** El sistema debe permitir mantener un historial de modificaciones realizadas al perfil del alumno.

---

## 2. Gestión de incidentes

**RF-09.** El sistema debe permitir a profesores e inspectores registrar incidentes asociados a un alumno.

**RF-10.** El sistema debe permitir registrar en cada incidente los siguientes datos: título, fecha, descripción, rol del funcionario que reporta e identificador del alumno.

**RF-11.** El sistema debe permitir a funcionarios autorizados asignar o modificar la gravedad de un incidente.

**RF-12.** El sistema debe permitir mostrar o asociar automáticamente el protocolo correspondiente según la gravedad del incidente.

**RF-13.** El sistema debe permitir a orientadores y a convivencia escolar cambiar el estado de un incidente.

**RF-14.** El sistema debe permitir registrar acciones de seguimiento asociadas a un incidente.

**RF-15.** El sistema debe permitir adjuntar observaciones, evidencias o documentos a un incidente.

**RF-16.** El sistema debe permitir consultar el historial de incidentes de un alumno.

**RF-17.** El sistema debe permitir buscar y filtrar incidentes por alumno, curso, fecha, gravedad, estado o funcionario responsable.

**RF-18.** El sistema debe permitir cerrar incidentes cuando hayan sido resueltos.

**RF-19.** El sistema debe permitir reabrir incidentes cerrados por usuarios autorizados.

**RF-20.** El sistema debe permitir mantener trazabilidad de la creación, edición y cambios de estado de cada incidente.

---

## 3. Reincidencia y seguimiento

**RF-21.** El sistema debe permitir calcular la reincidencia de un alumno en función de incidentes previamente registrados.

**RF-22.** El sistema debe permitir visualizar la cantidad de incidentes acumulados por cada alumno.

**RF-23.** El sistema debe permitir alertar a orientadores y convivencia escolar cuando un alumno supere un umbral de reincidencia definido.

**RF-24.** El sistema debe permitir registrar acciones coordinadas con apoderados para el seguimiento de un incidente.

**RF-25.** El sistema debe permitir registrar comunicaciones realizadas con apoderados respecto a un incidente.

---

## 4. Usuarios, roles y permisos

**RF-26.** El sistema debe permitir autenticar a los usuarios mediante credenciales institucionales.

**RF-27.** El sistema debe permitir controlar el acceso a las funcionalidades según el rol del usuario.

**RF-28.** El sistema debe permitir administrar permisos para profesores, inspectores, orientadores, convivencia escolar y otros funcionarios autorizados.

---

## 5. Reportes y consultas

**RF-29.** El sistema debe permitir generar reportes de incidentes por alumno, curso, fecha, gravedad y estado.

**RF-30.** El sistema debe permitir visualizar estadísticas de reincidencia por alumno y por curso.

**RF-31.** El sistema debe permitir exportar reportes para revisión administrativa.

**RF-31.** El sistema debe envíar un correo cuando se reporte un incidente, notificando así a los apoderados de los alumnos involucrados.

---