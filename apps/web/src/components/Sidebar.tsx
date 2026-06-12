'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { hasAnyPermission, NAVIGATION_ITEMS } from '@/lib/permissions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SESSION_STORAGE_KEY = 'sce_sesion';

interface SidebarProps {
  user: { name: string; role: string; permissions: string[] };
  onLogout?: () => void;
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [funcionarioId, setFuncionarioId] = useState('');

  useEffect(() => {
    try {
      const sesion = JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY) || '{}');
      setFuncionarioId(sesion.funcionario?.id || '');
    } catch {}
  }, []);

  useEffect(() => {
    if (user.role !== 'director' || !funcionarioId) return;

    const cargar = () => {
      fetch(`${API_URL}/notificaciones`, {
        headers: { 'x-funcionario-id': funcionarioId }
      })
        .then(r => r.json())
        .then(data => { if (data.ok) setNotificaciones(data.data) })
        .catch(() => {});
    };

    cargar();
    const intervalo = setInterval(cargar, 30000); // refresca cada 30 segundos
    return () => clearInterval(intervalo);
  }, [funcionarioId, user.role]);

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const marcarLeida = async (notificacion: any) => {
    await fetch(`${API_URL}/notificaciones/${notificacion.id}/leida`, { method: 'PATCH' });
    setNotificaciones(prev => prev.map(n => n.id === notificacion.id ? { ...n, leida: true } : n));
  };

  const items = NAVIGATION_ITEMS.filter(item =>
    hasAnyPermission(user.permissions, item.permissions)
  );

  const initials = user.name.split(' ').slice(0, 2).map(n => n[0]).join('');

  return (
    <div style={{ width: 224, background: '#001f5b', display: 'flex', flexDirection: 'column', color: '#fff', flexShrink: 0, minHeight: '100vh', position: 'relative' }}>
      <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-shield-check" style={{ fontSize: 20 }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Colegio UdeC</div>
            <div style={{ fontSize: 10, color: '#93c5fd', marginTop: 1 }}>Sistema de Incidencias</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0041a8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
          <div style={{ fontSize: 11, color: '#93c5fd' }}>{user.role}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {user.role === 'director' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMostrarPanel(!mostrarPanel)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <i className="bi bi-bell-fill" style={{ fontSize: 16 }} />
                {noLeidas > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {noLeidas}
                  </span>
                )}
              </button>

              {mostrarPanel && (
                <div style={{
                  position: 'fixed',
                  top: 60,
                  left: 224,
                  width: 320,
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Notificaciones</span>
                    {noLeidas > 0 && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>{noLeidas} sin leer</span>
                    )}
                  </div>
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {notificaciones.length === 0 ? (
                      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                        <i className="bi bi-bell-slash" style={{ fontSize: 28 }} />
                        <p style={{ marginTop: 8, fontSize: 14 }}>No hay notificaciones</p>
                      </div>
                    ) : (
                      notificaciones.map(n => (
                        <Link
                          key={n.id}
                          href={`/seguimiento/${n.incidenteId}`}
                          onClick={() => { marcarLeida(n); setMostrarPanel(false); }}
                          style={{
                            display: 'block',
                            padding: '14px 20px',
                            borderBottom: '1px solid #f1f5f9',
                            background: n.leida ? '#fff' : '#eff6ff',
                            textDecoration: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <i className="bi bi-exclamation-triangle-fill" style={{ color: '#ef4444', fontSize: 14, marginTop: 2, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: n.leida ? 400 : 600, color: '#0f172a' }}>{n.titulo}</div>
                              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                                {new Date(n.fechaCreacion).toLocaleDateString('es-CL')}
                              </div>
                            </div>
                            {!n.leida && (
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', marginLeft: 'auto', flexShrink: 0, marginTop: 4 }} />
                            )}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
        </div>
      </div>

      <nav style={{ flex: 1, padding: '10px' }}>
        {items.map(item => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
                borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
                marginBottom: 2,
                textDecoration: 'none'
              }}
            >
              <i className={`bi bi-${item.icon}`} style={{ fontSize: 16 }} />{item.label}
            </Link>
          );
        })}
      </nav>

      {onLogout && (
        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={onLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontFamily: 'inherit', fontSize: 14, textAlign: 'left' }}
          >
            <i className="bi bi-box-arrow-left" style={{ fontSize: 16 }} />
            Cerrar sesion
          </button>
        </div>
      )}
    </div>
  );
}
