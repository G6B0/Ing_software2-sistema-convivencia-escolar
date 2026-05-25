'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export interface FuncionarioSesion {
  id: string;
  nombre: string;
  correoInstitucional: string;
  rol: string;
}

export interface SesionUsuario {
  token: string;
  funcionario: FuncionarioSesion;
}

export const SESSION_STORAGE_KEY = 'sce_sesion';

interface AuthShellProps {
  children: ReactNode;
}

export default function AuthShell({ children }: AuthShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sesion, setSesion] = useState<SesionUsuario | null>(null);
  const [validandoSesion, setValidandoSesion] = useState(true);

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
    if (validandoSesion) {
      return;
    }

    if (!sesion && pathname !== '/login') {
      router.replace('/login');
      return;
    }

    if (sesion && pathname === '/login') {
      router.replace('/dashboard');
    }
  }, [pathname, router, sesion, validandoSesion]);

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

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans',sans-serif", background: '#f1f5f9', fontSize: 14 }}>
      <Sidebar
        user={{
          name: sesion.funcionario.nombre,
          role: sesion.funcionario.rol,
        }}
        onLogout={cerrarSesion}
      />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
