const PERMISOS = Object.freeze({
  CONSULTAR_ALUMNOS: 'consultar_alumnos',
  REGISTRAR_INCIDENTES: 'registrar_incidentes',
  CONSULTAR_INCIDENTES: 'consultar_incidentes',
  CONSULTAR_INCIDENTES_PROPIOS_O_GENERALES: 'consultar_incidentes_propios_o_generales',
  REGISTRAR_SEGUIMIENTOS_BASICOS: 'registrar_seguimientos_basicos',
  MODIFICAR_GRAVEDAD: 'modificar_gravedad',
  REGISTRAR_SEGUIMIENTOS: 'registrar_seguimientos',
  CONSULTAR_HISTORIAL: 'consultar_historial',
  GESTIONAR_ESTADOS_OPERATIVOS: 'gestionar_estados_operativos',
  CAMBIAR_ESTADO_INCIDENTES: 'cambiar_estado_incidentes',
  VISUALIZAR_REINCIDENCIA: 'visualizar_reincidencia',
  VISUALIZAR_ALERTAS: 'visualizar_alertas',
  GESTIONAR_INCIDENTES: 'gestionar_incidentes',
  REVISAR_REPORTES: 'revisar_reportes',
  GESTIONAR_ROLES_PERMISOS: 'gestionar_roles_permisos',
  CONSULTAR_REPORTES: 'consultar_reportes',
  ACCEDER_CONFIGURACION: 'acceder_configuracion',
  AUDITAR_CAMBIOS: 'auditar_cambios',
})

const TODOS_LOS_PERMISOS = Object.freeze(Object.values(PERMISOS))

const MATRIZ_ROLES_PERMISOS = Object.freeze({
  profesor: Object.freeze([
    PERMISOS.CONSULTAR_ALUMNOS,
    PERMISOS.REGISTRAR_INCIDENTES,
    PERMISOS.CONSULTAR_INCIDENTES_PROPIOS_O_GENERALES,
    PERMISOS.REGISTRAR_SEGUIMIENTOS_BASICOS,
  ]),
  inspector: Object.freeze([
    PERMISOS.CONSULTAR_ALUMNOS,
    PERMISOS.REGISTRAR_INCIDENTES,
    PERMISOS.MODIFICAR_GRAVEDAD,
    PERMISOS.REGISTRAR_SEGUIMIENTOS,
    PERMISOS.CONSULTAR_HISTORIAL,
    PERMISOS.GESTIONAR_ESTADOS_OPERATIVOS,
  ]),
  orientador: Object.freeze([
    PERMISOS.CONSULTAR_ALUMNOS,
    PERMISOS.CONSULTAR_INCIDENTES,
    PERMISOS.REGISTRAR_SEGUIMIENTOS,
    PERMISOS.CAMBIAR_ESTADO_INCIDENTES,
    PERMISOS.VISUALIZAR_REINCIDENCIA,
    PERMISOS.VISUALIZAR_ALERTAS,
  ]),
  'convivencia escolar': Object.freeze([
    PERMISOS.CONSULTAR_ALUMNOS,
    PERMISOS.GESTIONAR_INCIDENTES,
    PERMISOS.REGISTRAR_SEGUIMIENTOS,
    PERMISOS.CAMBIAR_ESTADO_INCIDENTES,
    PERMISOS.REVISAR_REPORTES,
    PERMISOS.VISUALIZAR_REINCIDENCIA,
    PERMISOS.VISUALIZAR_ALERTAS,
  ]),
  administrador: Object.freeze([
    PERMISOS.GESTIONAR_ROLES_PERMISOS,
    PERMISOS.CONSULTAR_REPORTES,
    PERMISOS.ACCEDER_CONFIGURACION,
    PERMISOS.AUDITAR_CAMBIOS,
  ]),
  director: Object.freeze(TODOS_LOS_PERMISOS),
})

function normalizarRol(rol) {
  return String(rol || '').trim().toLowerCase()
}

function listarRoles() {
  return Object.keys(MATRIZ_ROLES_PERMISOS)
}

function obtenerPermisosPorRol(rol) {
  return MATRIZ_ROLES_PERMISOS[normalizarRol(rol)] || []
}

function rolTienePermiso(rol, permiso) {
  return obtenerPermisosPorRol(rol).includes(permiso)
}

module.exports = {
  MATRIZ_ROLES_PERMISOS,
  PERMISOS,
  TODOS_LOS_PERMISOS,
  listarRoles,
  normalizarRol,
  obtenerPermisosPorRol,
  rolTienePermiso,
}
