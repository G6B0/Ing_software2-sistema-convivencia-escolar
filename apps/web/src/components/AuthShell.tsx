'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { canAccessPath, getPermissions } from '@/lib/permissions';

const Sidebar = dynamic(() => import('@/components/Sidebar'), { ssr: false });
import {
  apiFetch,
  getStoredSession,
  SESSION_STORAGE_KEY,
  SESSION_UPDATED_EVENT,
} from '@/lib/api';

export interface FuncionarioSesion {
  id: string;
  nombre: string;
  correoInstitucional: string;
  rol: string;
  permisos?: string[];
}

export interface SesionUsuario {
  token: string;
  funcionario: FuncionarioSesion;
}

export { SESSION_STORAGE_KEY };

interface AuthShellProps {
  children: ReactNode;
}

function samePermissions(currentPermissions: string[] = [], nextPermissions: string[] = []) {
  return (
    currentPermissions.length === nextPermissions.length &&
    currentPermissions.every(permission => nextPermissions.includes(permission))
  );
}

export default function AuthShell({ children }: AuthShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sesion, setSesion] = useState<SesionUsuario | null>(null);
  const [validandoSesion, setValidandoSesion] = useState(true);
  const [sincronizandoPermisos, setSincronizandoPermisos] = useState(false);
  const permisos = useMemo(
    () => sesion
      ? getPermissions(sesion.funcionario.rol, sesion.funcionario.permisos)
      : [],
    [sesion]
  );
  const funcionarioSesionId = sesion?.funcionario.id;

  useEffect(() => {
    try {
      const sesionGuardada = window.localStorage.getItem(SESSION_STORAGE_KEY);
      setSesion(sesionGuardada ? JSON.parse(sesionGuardada) : null);
    } catch {
      setSesion(null);
    } finally {
      setValidandoSesion(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (validandoSesion || !funcionarioSesionId || pathname === '/login') {
      setSincronizandoPermisos(false);
      return;
    }

    let activo = true;
    setSincronizandoPermisos(true);

    apiFetch('/auth/permisos')
      .then(response => response.json().then(body => ({ response, body })))
      .then(({ response, body }) => {
        if (!activo || !response.ok) {
          return;
        }

        const sesionActual = getStoredSession() as SesionUsuario | null;
        if (!sesionActual || sesionActual.funcionario.id !== funcionarioSesionId) {
          return;
        }

        const permisosNuevos = body.data.permisos as string[];
        if (samePermissions(sesionActual.funcionario.permisos, permisosNuevos)) {
          return;
        }

        const sesionActualizada = {
          ...sesionActual,
          funcionario: {
            ...sesionActual.funcionario,
            permisos: permisosNuevos,
          },
        };

        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sesionActualizada));
        window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
        setSesion(sesionActualizada);
      })
      .catch(() => {})
      .finally(() => {
        if (activo) {
          setSincronizandoPermisos(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [funcionarioSesionId, pathname, validandoSesion]);

  useEffect(() => {
    if (validandoSesion || sincronizandoPermisos) {
      return;
    }

    if (!sesion && pathname !== '/login') {
      router.replace('/login');
      return;
    }

    if (sesion && pathname === '/login') {
      router.replace('/dashboard');
      return;
    }

    if (sesion && !canAccessPath(pathname, permisos)) {
      router.replace('/dashboard');
    }
  }, [pathname, permisos, router, sesion, sincronizandoPermisos, validandoSesion]);

  const cerrarSesion = () => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setSesion(null);
    router.replace('/login');
  };

  if (validandoSesion) {
    return null;
  }

  if (!sesion) {
    return <>{children}</>;
  }

  if (pathname === '/login') {
    return null;
  }

  if (!sincronizandoPermisos && !canAccessPath(pathname, permisos)) {
    return null;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans',sans-serif", background: '#f1f5f9', fontSize: 14 }}>
      <Sidebar
        user={{
          name: sesion.funcionario.nombre,
          role: sesion.funcionario.rol,
          permissions: permisos,
        }}
        onLogout={cerrarSesion}
      />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
