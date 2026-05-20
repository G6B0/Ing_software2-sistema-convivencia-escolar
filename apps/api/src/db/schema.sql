create table if not exists incidentes (
  id text primary key,
  titulo text not null,
  fecha timestamptz not null,
  descripcion text not null,
  gravedad text not null,
  estado text not null check (estado in ('Abierto', 'Cerrado', 'Reabierto')),
  funcionario_responsable_id text not null,
  creado_en timestamptz not null default now()
);

create table if not exists incidente_participantes (
  id text primary key,
  incidente_id text not null references incidentes(id),
  alumno_institucional_id text not null,
  rol_en_incidente text not null check (
    rol_en_incidente in ('Agresor', 'Victima', 'Testigo', 'Involucrado')
  ),
  observacion text,
  unique (incidente_id, alumno_institucional_id, rol_en_incidente)
);

create table if not exists seguimientos (
  id text primary key,
  incidente_id text not null references incidentes(id),
  accion text not null,
  evolucion_caso text not null,
  fecha timestamptz not null,
  funcionario_responsable_id text not null
);

create table if not exists auditorias (
  id text primary key,
  accion text not null,
  fecha timestamptz not null,
  funcionario_responsable_id text not null,
  entidad text not null,
  identificador_relacionado text not null
);
