import {
  canAccessPath,
  getPermissions,
  PERMISSIONS,
} from './permissions';

describe('permisos efectivos de la interfaz', () => {
  test('usa los permisos de sesion en lugar de la matriz por defecto', () => {
    const permissions = getPermissions('profesor', [
      PERMISSIONS.MODIFY_SEVERITY,
    ]);

    expect(permissions).toEqual([PERMISSIONS.MODIFY_SEVERITY]);
  });

  test('bloquea perfiles de alumnos sin consultar alumnos', () => {
    expect(canAccessPath('/alumnos/ALU-1001', [
      PERMISSIONS.CONSULT_OWN_OR_GENERAL_INCIDENTS,
    ])).toBe(false);
  });

  test('permite modificar gravedad solo si la sesion tiene el permiso', () => {
    const withoutPermission = getPermissions('profesor', [
      PERMISSIONS.CONSULT_OWN_OR_GENERAL_INCIDENTS,
    ]);
    const withPermission = getPermissions('profesor', [
      PERMISSIONS.CONSULT_OWN_OR_GENERAL_INCIDENTS,
      PERMISSIONS.MODIFY_SEVERITY,
    ]);

    expect(withoutPermission.includes(PERMISSIONS.MODIFY_SEVERITY)).toBe(false);
    expect(withPermission.includes(PERMISSIONS.MODIFY_SEVERITY)).toBe(true);
  });
});
