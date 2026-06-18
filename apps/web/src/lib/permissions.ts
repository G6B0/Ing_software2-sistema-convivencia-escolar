export const PERMISSIONS = {
  CONSULT_STUDENTS: 'consultar_alumnos',
  REGISTER_INCIDENTS: 'registrar_incidentes',
  CONSULT_INCIDENTS: 'consultar_incidentes',
  CONSULT_OWN_OR_GENERAL_INCIDENTS: 'consultar_incidentes_propios_o_generales',
  REGISTER_BASIC_FOLLOWUPS: 'registrar_seguimientos_basicos',
  MODIFY_SEVERITY: 'modificar_gravedad',
  REGISTER_FOLLOWUPS: 'registrar_seguimientos',
  CONSULT_HISTORY: 'consultar_historial',
  MANAGE_OPERATIONAL_STATES: 'gestionar_estados_operativos',
  CHANGE_INCIDENT_STATE: 'cambiar_estado_incidentes',
  VIEW_RECURRENCE: 'visualizar_reincidencia',
  VIEW_ALERTS: 'visualizar_alertas',
  MANAGE_INCIDENTS: 'gestionar_incidentes',
  REVIEW_REPORTS: 'revisar_reportes',
  MANAGE_ROLES_PERMISSIONS: 'gestionar_roles_permisos',
  CONSULT_REPORTS: 'consultar_reportes',
  ACCESS_CONFIGURATION: 'acceder_configuracion',
  AUDIT_CHANGES: 'auditar_cambios',
} as const;

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  profesor: [
    PERMISSIONS.CONSULT_STUDENTS,
    PERMISSIONS.REGISTER_INCIDENTS,
    PERMISSIONS.CONSULT_OWN_OR_GENERAL_INCIDENTS,
    PERMISSIONS.REGISTER_BASIC_FOLLOWUPS,
  ],
  inspector: [
    PERMISSIONS.CONSULT_STUDENTS,
    PERMISSIONS.REGISTER_INCIDENTS,
    PERMISSIONS.MODIFY_SEVERITY,
    PERMISSIONS.REGISTER_FOLLOWUPS,
    PERMISSIONS.CONSULT_HISTORY,
    PERMISSIONS.MANAGE_OPERATIONAL_STATES,
  ],
  orientador: [
    PERMISSIONS.CONSULT_STUDENTS,
    PERMISSIONS.CONSULT_INCIDENTS,
    PERMISSIONS.REGISTER_FOLLOWUPS,
    PERMISSIONS.CHANGE_INCIDENT_STATE,
    PERMISSIONS.VIEW_RECURRENCE,
    PERMISSIONS.VIEW_ALERTS,
  ],
  'convivencia escolar': [
    PERMISSIONS.CONSULT_STUDENTS,
    PERMISSIONS.MANAGE_INCIDENTS,
    PERMISSIONS.REGISTER_FOLLOWUPS,
    PERMISSIONS.CHANGE_INCIDENT_STATE,
    PERMISSIONS.REVIEW_REPORTS,
    PERMISSIONS.VIEW_RECURRENCE,
    PERMISSIONS.VIEW_ALERTS,
  ],
  administrador: [
    PERMISSIONS.MANAGE_ROLES_PERMISSIONS,
    PERMISSIONS.CONSULT_REPORTS,
    PERMISSIONS.ACCESS_CONFIGURATION,
    PERMISSIONS.AUDIT_CHANGES,
  ],
  director: ALL_PERMISSIONS,
};

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'speedometer2', href: '/dashboard', permissions: [] },
  {
    id: 'incidencias',
    label: 'Incidencias',
    icon: 'exclamation-triangle',
    href: '/incidencias',
    permissions: [
      PERMISSIONS.CONSULT_INCIDENTS,
      PERMISSIONS.CONSULT_OWN_OR_GENERAL_INCIDENTS,
      PERMISSIONS.MANAGE_INCIDENTS,
    ],
  },
  {
    id: 'registrar',
    label: 'Registrar',
    icon: 'plus-circle',
    href: '/registrar',
    permissions: [PERMISSIONS.REGISTER_INCIDENTS],
  },
  {
    id: 'seguimiento',
    label: 'Seguimiento',
    icon: 'journal-check',
    href: '/seguimiento',
    permissions: [
      PERMISSIONS.CONSULT_HISTORY,
      PERMISSIONS.REGISTER_FOLLOWUPS,
      PERMISSIONS.REGISTER_BASIC_FOLLOWUPS,
      PERMISSIONS.CONSULT_INCIDENTS,
      PERMISSIONS.CONSULT_OWN_OR_GENERAL_INCIDENTS,
      PERMISSIONS.MANAGE_INCIDENTS,
    ],
  },
  {
    id: 'ranking',
    label: 'Ranking Cursos',
    icon: 'bar-chart-line',
    href: '/ranking',
    permissions: [
      PERMISSIONS.VIEW_RECURRENCE,
      PERMISSIONS.VIEW_ALERTS,
      PERMISSIONS.REVIEW_REPORTS,
      PERMISSIONS.CONSULT_REPORTS,
    ],
  },
  {
    id: 'mensual',
    label: 'Reporte Anual',
    icon: 'calendar3',
    href: '/mensual',
    permissions: [PERMISSIONS.REVIEW_REPORTS, PERMISSIONS.CONSULT_REPORTS],
  },
  {
    id: 'roles',
    label: 'Roles y permisos',
    icon: 'person-gear',
    href: '/administracion/roles',
    permissions: [PERMISSIONS.MANAGE_ROLES_PERMISSIONS],
  },
];

export function getPermissions(role: string, sessionPermissions?: string[]) {
  if (Array.isArray(sessionPermissions)) {
    return sessionPermissions;
  }

  return ROLE_PERMISSIONS[role.toLowerCase()] || [];
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]) {
  return requiredPermissions.length === 0 ||
    requiredPermissions.some(permission => userPermissions.includes(permission));
}

export function canAccessPath(pathname: string, userPermissions: string[]) {
  const matchingItem = NAVIGATION_ITEMS.find(item =>
    pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return !matchingItem || hasAnyPermission(userPermissions, matchingItem.permissions);
}
