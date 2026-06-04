const assert = require('node:assert/strict')
const test = require('node:test')

const {
  PERMISOS,
  TODOS_LOS_PERMISOS,
  listarRoles,
  obtenerPermisosPorRol,
  rolTienePermiso,
} = require('../src/lib/rolesPermisos')

test('US6 T01 Test 1: matriz contiene roles institucionales requeridos', () => {
  const roles = listarRoles()

  assert.ok(roles.includes('profesor'))
  assert.ok(roles.includes('inspector'))
  assert.ok(roles.includes('orientador'))
  assert.ok(roles.includes('convivencia escolar'))
  assert.ok(roles.includes('administrador'))
  assert.ok(roles.includes('director'))
})

test('US6 T01 Test 2: cada rol tiene permisos asociados', () => {
  listarRoles().forEach((rol) => {
    const permisos = obtenerPermisosPorRol(rol)

    assert.ok(Array.isArray(permisos))
    assert.ok(permisos.length > 0)
  })
})

test('US6 T01 Test 3: administrador posee permiso de gestion de roles', () => {
  assert.equal(rolTienePermiso('administrador', PERMISOS.GESTIONAR_ROLES_PERMISOS), true)
})

test('US6 T01 Test 4: profesor tiene permisos operativos basicos', () => {
  const permisosProfesor = obtenerPermisosPorRol('profesor')

  assert.deepEqual(permisosProfesor, [
    PERMISOS.CONSULTAR_ALUMNOS,
    PERMISOS.REGISTRAR_INCIDENTES,
    PERMISOS.CONSULTAR_INCIDENTES_PROPIOS_O_GENERALES,
    PERMISOS.REGISTRAR_SEGUIMIENTOS_BASICOS,
  ])
})

test('US6 T01 Test 5: director posee todos los permisos del sistema', () => {
  const permisosDirector = obtenerPermisosPorRol('director')

  assert.deepEqual(new Set(permisosDirector), new Set(TODOS_LOS_PERMISOS))
})
