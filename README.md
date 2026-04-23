# ISW2 - Sistema de Convivencia Escolar

Proyecto semestral de Ingeniería de Software 2 orientado al diseño de un sistema de apoyo para la gestión, seguimiento y análisis de incidentes de convivencia escolar en un establecimiento educacional.

## Descripción

El sistema busca centralizar el registro de incidentes estudiantiles y dar soporte al trabajo de profesores, inspectores, orientadores, convivencia escolar y administradores. La solución no reemplaza los protocolos institucionales ni la toma de decisiones humanas: su propósito es ordenar la información, facilitar el seguimiento de casos y mejorar la trazabilidad de las acciones realizadas.

De acuerdo con la documentación del proyecto, el sistema debe:

- Registrar incidentes asociados a estudiantes existentes en la fuente institucional del colegio.
- Consultar datos oficiales de alumnos, apoderados, cursos y funcionarios.
- Gestionar estados, gravedad, protocolos y acciones de seguimiento.
- Detectar reincidencia y generar alertas según umbrales definidos.
- Emitir reportes y estadísticas para apoyo administrativo.
- Mantener auditoría y trazabilidad de cambios.
- Enviar notificaciones por correo a apoderados cuando corresponda.

## Actores principales

- `Funcionario`: profesor, inspector, orientador u otro funcionario autorizado que registra y consulta incidentes.
- `Administrador`: encargado de administrar permisos, reportes y configuración del sistema.
- `Apoderado`: receptor de notificaciones enviadas desde el sistema.

## Arquitectura del sistema

La arquitectura definida en la documentación se apoya en dos sistemas externos:

- `Sistema de Datos Institucionales del Colegio`: fuente oficial de alumnos, apoderados, cursos y funcionarios.
- `Servicio de Email`: servicio externo usado para el envío de notificaciones.

### Vista de contexto

En la vista C1, el Sistema de Convivencia Escolar se ubica entre los funcionarios del establecimiento y los sistemas externos necesarios para operar:

- Los funcionarios usan el sistema para registrar y consultar incidentes.
- El administrador gestiona permisos, reportes y configuración.
- El sistema consulta datos institucionales del colegio.
- El sistema solicita el envío de correos al servicio de email.

Referencia:

- [C1-SystemContext-dark.png](<Documentacion del proyecto/C1-SystemContext-dark.png>)

### Vista de contenedores

Según la vista C2, la solución se organiza en los siguientes contenedores:

- `Contenido estático`: entrega los recursos de la interfaz web.
- `UI`: interfaz utilizada por funcionarios y administradores.
- `Backend`: expone la API y concentra la lógica de negocio.
- `Base de Datos del Sistema`: almacena incidentes, seguimientos, auditoría, configuraciones y demás datos propios del software.

Además, el backend se integra con:

- `Base de Datos Institucionales`: consulta información oficial del colegio.
- `Servicio de Email`: delega el envío de correos a apoderados.

Referencia:

- [C2-ContainerDiagram-dark.png](<Documentacion del proyecto/C2-ContainerDiagram-dark.png>)

### Componentes principales del backend

La vista C3 descompone el backend en servicios orientados al dominio:

- `API REST`: expone endpoints para autenticación, incidentes, seguimiento, reportes y consultas institucionales.
- `Gestión de Incidentes`: registra incidentes, clasifica gravedad, asocia protocolos y gestiona cierre o reapertura.
- `Seguimiento y Reincidencia`: registra acciones de seguimiento, calcula reincidencia, monitorea umbrales y genera alertas.
- `Reportes y Estadísticas`: genera consultas, reportes y métricas por alumno, curso, fecha, gravedad y estado.
- `Consulta de datos institucionales`: obtiene y valida datos de alumnos, apoderados, cursos y funcionarios desde la fuente oficial.
- `Notificaciones`: administra el envío de correos y alertas a apoderados.
- `Auditoría y Trazabilidad`: registra creación, edición y cambios críticos del sistema.
- `Persistencia`: centraliza el acceso a datos mediante repositorios u ORM.
- `Autenticación y Autorización`: valida credenciales institucionales y controla roles y permisos.

Referencia:

- [C3-BackendComponents-dark.png](<Documentacion del proyecto/C3-BackendComponents-dark.png>)

## Alcance funcional

### Prototipo de consola basado en C3

Para visualizar una maqueta simple de interaccion entre los componentes del diagrama C3, ejecutar:

```bash
npm run prototipo:c3
```

El prototipo usa solo `console.log` y no requiere conectarse a Supabase. Cada archivo en `apps/api/src/prototipo-c3/componentes/` representa un componente del backend descrito en la vista C3.

Los requisitos funcionales actualmente levantados se agrupan en estas áreas:

### 1. Consulta de datos institucionales

- Consulta de alumnos, apoderados, curso y año de ingreso.
- Validación de existencia del alumno antes de registrar incidentes.

### 2. Gestión de incidentes

- Registro de incidentes con título, fecha, descripción, rol del funcionario y alumno asociado.
- Asignación de gravedad y asociación del protocolo correspondiente.
- Cambio de estado, cierre y reapertura de incidentes.
- Registro de observaciones, evidencias, documentos e historial del caso.
- Búsqueda y filtrado por alumno, curso, fecha, gravedad, estado o funcionario responsable.

### 3. Seguimiento y reincidencia

- Cálculo de reincidencia por alumno.
- Visualización de incidentes acumulados.
- Alertas por superación de umbrales.
- Registro de acciones coordinadas y comunicaciones con apoderados.

### 4. Usuarios, roles y permisos

- Autenticación con credenciales institucionales.
- Control de acceso según rol.
- Administración de permisos para funcionarios autorizados.

### 5. Reportes y notificaciones

- Generación y exportación de reportes.
- Visualización de estadísticas por alumno y curso.
- Envío de correos a apoderados cuando se reporta un incidente.

Referencia completa:

- [requisitos_funcionales.md](<Documentacion del proyecto/requisitos_funcionales.md>)

## Estructura del repositorio

```text
Ing_software2-sistema-convivencia-escolar/
|-- apps/
|   |-- api/   # Espacio reservado para la implementación del backend
|   `-- web/   # Espacio reservado para la implementación de la interfaz web
|-- Documentacion del proyecto/
|   |-- C1-SystemContext-dark.png
|   |-- C2-ContainerDiagram-dark.png
|   |-- C3-BackendComponents-dark.png
|   `-- requisitos_funcionales.md
`-- README.md
```

## Estado actual

El repositorio se encuentra principalmente en una etapa de definición y documentación de la solución. La arquitectura objetivo, los actores y el alcance funcional ya están descritos, pero la implementación en `apps/api` y `apps/web` todavía no refleja todos los componentes planteados en los diagramas.

## Consideraciones

- El sistema está pensado como herramienta de apoyo a la convivencia escolar, no como reemplazo de protocolos institucionales.
- La información institucional proviene de una fuente externa oficial del colegio.
- El envío de correos depende de un servicio externo de email.

## Equipo

- Ignacio Jose Barria Concha
- Kaori Sofia Encina Gil
- Joaquin Rodrigo Hernandez Espinoza
- Gabriel Ignacio Huerta Torres
- Enzo Gabriel Levancini Arriagada

## Flujo de trabajo con Git

Para mantener un desarrollo ordenado y evitar conflictos entre los integrantes del equipo, se utilizará la siguiente estrategia de ramas:

- `main`: contiene la versión estable del proyecto.
- `develop`: contiene la integración del trabajo en desarrollo.
- `feature/nombre-funcionalidad`: ramas creadas por cada integrante para trabajar una funcionalidad específica.

### Estructura de ramas

Cada integrante debe trabajar en una rama propia creada a partir de `develop`.  
Los cambios no se integran directamente en `main`, sino que primero pasan por `develop`.  
Una vez que `develop` tenga una versión estable y revisada, se realiza el merge hacia `main`.

### Pasos para trabajar en el proyecto

#### 1. Cambiarse a la rama principal y verificar el estado

Antes de comenzar, asegurarse de estar en la rama `main` y revisar el estado del repositorio:

```bash
git checkout main
git status
```

#### 2. Actualizar la rama `main`

Descargar los últimos cambios disponibles desde el repositorio remoto:

```bash
git pull origin main
```

#### 3. Cambiarse a la rama `develop`

Una vez actualizada la rama principal, cambiarse a `develop`:

```bash
git checkout develop
git status
```

#### 4. Actualizar la rama `develop`

Descargar los últimos cambios de la rama `develop`:

```bash
git pull origin develop
```

#### 5. Crear una nueva rama de trabajo

Cada integrante debe crear una rama de desarrollo propia a partir de `develop`:

```bash
git checkout -b feature/nombre-funcionalidad
```

Ejemplo:

```bash
git checkout -b feature/registro-incidentes
```

#### 6. Realizar los cambios necesarios

Desarrollar la funcionalidad correspondiente en la rama creada.  
Durante el trabajo, se puede revisar el estado del repositorio con:

```bash
git status
```

#### 7. Agregar los cambios realizados

Una vez terminada una parte del trabajo, agregar los archivos modificados:

```bash
git add .
```

#### 8. Guardar los cambios con un commit

Registrar los cambios con un mensaje claro y descriptivo:

```bash
git commit -m "Agrega formulario de registro de incidentes"
```

#### 9. Subir la rama al repositorio remoto

Enviar la rama creada al repositorio remoto:

```bash
git push origin feature/nombre-funcionalidad
```

#### 10. Crear un Pull Request hacia `develop`

Cuando la funcionalidad esté lista, se debe crear un **Pull Request** desde la rama `feature/nombre-funcionalidad` hacia la rama `develop`.

Un integrante encargado del repositorio o del control de versiones deberá revisar los cambios y aprobar el Pull Request para integrarlo en `develop`.

#### 11. Integración de cambios en `develop`

Luego de la revisión y aprobación, los cambios se fusionan en la rama `develop`.

De esta forma, todas las funcionalidades nuevas se integran primero en una rama de desarrollo común antes de llegar a la rama principal.

#### 12. Paso final de `develop` a `main`

Cuando la rama `develop` tenga una versión estable, revisada y lista para entrega, un integrante encargado realizará el merge hacia `main` y posteriormente subirá los cambios:

```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

#### Resumen del flujo de trabajo

```text
main -> actualizar
develop -> actualizar
feature/nombre-funcionalidad -> desarrollar
feature -> Pull Request a develop
develop -> revisión e integración
develop -> merge a main cuando exista una versión estable
```

### Recomendaciones

- No trabajar directamente sobre la rama `main`.
- Siempre crear ramas nuevas a partir de `develop`.
- Mantener los commits con mensajes claros y descriptivos.
- Actualizar la rama `develop` antes de empezar una nueva tarea.
- Verificar el funcionamiento de los cambios antes de abrir un Pull Request.
- Solo fusionar `develop` con `main` cuando el sistema esté estable y listo para entrega.
