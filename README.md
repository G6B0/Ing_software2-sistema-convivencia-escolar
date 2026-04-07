# Ing_software2-sistema-convivencia-escolar

Proyecto semestral de la asignatura **Ingeniería de Software 2**.

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

Por definir

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

## Estructura general del proyecto

```bash
isw2-convivencia-escolar/
├── apps/
│   ├── web/        # Frontend en Next.js
│   └── api/        # Backend en NestJS
├── docs/           # Documentación del proyecto
├── README.md
└── .gitignore