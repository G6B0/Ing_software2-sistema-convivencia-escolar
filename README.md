# ISW2 - Sistema de apoyo para la gestión y seguimiento de incidentes de convivencia escolar

Proyecto semestral de la asignatura **Ingeniería de Software 2**.

## Descripción del proyecto

Este sistema tiene como objetivo apoyar a un establecimiento educacional en el **registro, seguimiento y análisis de incidentes de convivencia escolar**, facilitando la organización de la información y la coordinación de acciones de intervención.

La solución busca centralizar la información asociada a incidentes de convivencia, permitiendo registrar situaciones, identificar personas involucradas, consultar historiales y dar seguimiento a los casos. El sistema **no reemplaza las decisiones humanas ni los protocolos institucionales existentes**, sino que actúa como una herramienta de apoyo para la gestión de la información.

## Problemática abordada

En los establecimientos educacionales, las situaciones relacionadas con la convivencia escolar suelen ser registradas de forma dispersa o incompleta, lo que dificulta:

- Identificar patrones de conflicto.
- Detectar casos de reincidencia.
- Realizar seguimiento sistemático de los casos.
- Coordinar acciones entre los distintos actores involucrados.

Frente a esta problemática, este proyecto propone una aplicación web funcional que permita mejorar el manejo de la información y apoyar la toma de decisiones dentro del contexto escolar.

## Objetivo general

Diseñar e implementar un sistema de software que apoye la **gestión, seguimiento y consulta de incidentes de convivencia escolar**, promoviendo una administración clara, estructurada y accesible de los casos registrados.

## Alcance inicial

El sistema considera, al menos, las siguientes funcionalidades:

- Registro de incidentes.
- Identificación de personas involucradas.
- Caracterización de los incidentes.
- Seguimiento de casos asociados.
- Consulta de historial de incidentes y acciones realizadas.

## Tecnologías propuestas

El proyecto será desarrollado como una aplicación web utilizando el siguiente stack tecnológico:

### Frontend

- **Next.js**
- **TypeScript**
- **Tailwind CSS**

### Backend

- **NestJS**
- **TypeScript**

### Base de datos

- **PostgreSQL**

### ORM

- **Prisma**


SUJETOS A CAMBIO

## Estructura general del proyecto

```bash
isw2-convivencia-escolar/
├── apps/
│   ├── web/        # Frontend en Next.js
│   └── api/        # Backend en NestJS
├── docs/           # Documentación del proyecto
├── README.md
└── .gitignore
```

## Miembros del grupo

- Ignacio Jose Barria Concha
- Kaori Sofia Encina Gil
- Joaquin Rodrigo Hernandez Espinoza
- Gabriel Ignacio Huerta Torres
- Enzo Gabriel Levancini Arriagada

## Estado del proyecto

Actualmente el proyecto se encuentra en etapa de **definición y validación inicial del sistema**, correspondiente a la primera fase del desarrollo semestral.

## Etapas del proyecto

El desarrollo del sistema se organizará en tres etapas principales:

1. Definición y validación inicial del sistema (RUP)
2. Sprint 1 – Primer incremento del sistema
3. Sprint 2 – Sistema integrado

## Repositorio

Este repositorio contendrá el código fuente, documentación, avances y entregables asociados al proyecto semestral.

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

### Resumen del flujo de trabajo

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

## Observaciones

- No se utilizarán datos reales.
- No se requiere integración con sistemas externos reales.
