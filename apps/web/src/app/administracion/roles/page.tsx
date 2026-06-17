'use client';

import { useEffect, useState } from 'react';
import { SESSION_STORAGE_KEY, SesionUsuario } from '@/components/AuthShell';
import { ALL_PERMISSIONS } from '@/lib/permissions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const ROLES = ['profesor', 'inspector', 'orientador', 'convivencia escolar', 'administrador', 'director'];

const permissionNames: Record<string, string> = {
  consultar_alumnos: 'Consultar alumnos',
  registrar_incidentes: 'Registrar incidentes',
  consultar_incidentes: 'Consultar incidentes',
  consultar_incidentes_propios_o_generales: 'Consultar incidentes propios o generales',
  registrar_seguimientos_basicos: 'Registrar seguimientos basicos',
  modificar_gravedad: 'Modificar gravedad',
  registrar_seguimientos: 'Registrar seguimientos',
  consultar_historial: 'Consultar historial',
  gestionar_estados_operativos: 'Gestionar estados operativos',
  cambiar_estado_incidentes: 'Cambiar estado de incidentes',
  visualizar_reincidencia: 'Visualizar reincidencia',
  visualizar_alertas: 'Visualizar alertas',
  gestionar_incidentes: 'Gestionar incidentes',
  revisar_reportes: 'Revisar reportes',
  gestionar_roles_permisos: 'Gestionar roles y permisos',
  consultar_reportes: 'Consultar reportes',
  acceder_configuracion: 'Acceder a configuracion',
  auditar_cambios: 'Auditar cambios',
};

export default function RolesPermissionsPage() {
  const [role, setRole] = useState('profesor');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [officialPermissions, setOfficialPermissions] = useState<string[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      const session = JSON.parse(
        window.localStorage.getItem(SESSION_STORAGE_KEY) || '{}'
      ) as SesionUsuario;
      setEmployeeId(session.funcionario?.id || '');
    } catch {
      setEmployeeId('');
    }
  }, []);

  useEffect(() => {
    if (!employeeId) return;

    setLoading(true);
    setMessage('');

    fetch(`${API_URL}/roles/${encodeURIComponent(role)}/permisos`, {
      headers: { 'x-funcionario-id': employeeId },
    })
      .then(response => response.json().then(body => ({ response, body })))
      .then(({ response, body }) => {
        if (!response.ok) throw new Error(body.mensaje || 'No se pudieron consultar los permisos.');
        setPermissions(body.data.permisos);
        setOfficialPermissions(body.data.permisos);
      })
      .catch(error => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [employeeId, role]);

  const togglePermission = (permission: string) => {
    setPermissions(current =>
      current.includes(permission)
        ? current.filter(item => item !== permission)
        : [...current, permission]
    );
  };

  const save = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/roles/${encodeURIComponent(role)}/permisos`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          'x-funcionario-id': employeeId,
        },
        body: JSON.stringify({ permisos: permissions }),
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.mensaje || 'No se pudieron guardar los permisos.');

      setPermissions(body.data.permisos);
      setOfficialPermissions(body.data.permisos);
      setMessage('Permisos actualizados correctamente.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron guardar los permisos.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    [...permissions].sort().join('|') !== [...officialPermissions].sort().join('|');

  return (
    <main style={{ padding: '28px 32px', maxWidth: 980 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 5px', fontSize: 22, color: '#0f172a' }}>Roles y permisos</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          Configura las acciones disponibles para cada rol institucional.
        </p>
      </header>

      <div style={{ display: 'flex', alignItems: 'end', gap: 14, marginBottom: 22 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, fontWeight: 600, color: '#334155' }}>
          Rol institucional
          <select
            value={role}
            onChange={event => setRole(event.target.value)}
            style={{ width: 260, padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontFamily: 'inherit' }}
          >
            {ROLES.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <button
          type="button"
          onClick={save}
          disabled={saving || loading || !hasChanges}
          style={{ padding: '10px 18px', borderRadius: 6, border: 'none', background: '#003087', color: '#fff', fontWeight: 700, cursor: saving || loading || !hasChanges ? 'not-allowed' : 'pointer', opacity: saving || loading || !hasChanges ? 0.55 : 1 }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {message && (
        <div style={{ padding: '11px 14px', marginBottom: 18, borderLeft: '4px solid #2563eb', background: '#eff6ff', color: '#1e3a8a', fontSize: 13 }}>
          {message}
        </div>
      )}

      <section aria-label="Permisos del rol">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
          {ALL_PERMISSIONS.map(permission => {
            const checked = permissions.includes(permission);
            return (
              <label
                key={permission}
                style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 46, padding: '10px 12px', border: `1px solid ${checked ? '#93c5fd' : '#e2e8f0'}`, borderRadius: 6, background: checked ? '#eff6ff' : '#fff', color: '#1e293b', cursor: loading ? 'wait' : 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={loading}
                  onChange={() => togglePermission(permission)}
                />
                <span style={{ fontSize: 13, fontWeight: checked ? 600 : 400 }}>
                  {permissionNames[permission] || permission}
                </span>
              </label>
            );
          })}
        </div>
      </section>
    </main>
  );
}
