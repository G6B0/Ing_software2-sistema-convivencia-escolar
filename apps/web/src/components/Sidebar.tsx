'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { hasAnyPermission, NAVIGATION_ITEMS, PERMISSIONS } from '@/lib/permissions';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const [offset, setOffset] = useState(0);
  const [hayMas, setHayMas] = useState(false);
  const [total, setTotal] = useState(0);
  const [noLeidas, setNoLeidas] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const [detalleHover, setDetalleHover] = useState<any | null>(null);
  const [animarCampanita, setAnimarCampanita] = useState(false);
  const [prevNoLeidas, setPrevNoLeidas] = useState(0);

    useEffect(() => {
    if (noLeidas > prevNoLeidas && prevNoLeidas !== 0) {
      setAnimarCampanita(true);
      setTimeout(() => setAnimarCampanita(false), 1000);
    }
    setPrevNoLeidas(noLeidas);
  }, [noLeidas]);

  useEffect(() => {
    try {
      const sesion = JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY) || '{}');
      setFuncionarioId(sesion.funcionario?.id || '');
    } catch {}
  }, []);

  useEffect(() => {
    if (!user.permissions.includes(PERMISSIONS.VIEW_ALERTS) || !funcionarioId) return;

    const cargarContador = () => {
      apiFetch('/notificaciones/contador')
        .then(r => r.json())
        .then(data => { if (data.ok) setNoLeidas(data.noLeidas || 0) })
        .catch(() => {});
    };

    cargarContador();
    const intervalo = setInterval(cargarContador, 10000);
    return () => clearInterval(intervalo);
  }, [funcionarioId, user.permissions]);
  useEffect(() => {
    if (!mostrarPanel || !funcionarioId) return;

    apiFetch('/notificaciones?limit=5&offset=0')
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setNotificaciones(data.data || []);
          setTotal(data.total || 0);
          setHayMas(5 < (data.total || 0));
          setOffset(0);
        }
      })
      .catch(() => {});
  }, [mostrarPanel, funcionarioId]);
  
  useEffect(() => {
    if (!mostrarPanel) return;

    const handleClickFuera = (e: MouseEvent) => {
      const panel = document.getElementById('panel-notificaciones');
      if (panel && !panel.contains(e.target as Node)) {
        setMostrarPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [mostrarPanel]);
  useEffect(() => {
    if (noLeidas > prevNoLeidas && prevNoLeidas !== 0) {
      setAnimarCampanita(true);
      reproducirSonido();
      setTimeout(() => setAnimarCampanita(false), 1000);
    }
    setPrevNoLeidas(noLeidas);
  }, [noLeidas]);

  const marcarLeida = async (notificacion: any) => {
    await apiFetch(`/notificaciones/${notificacion.id}/leida`, { method: 'PATCH' });
    setNotificaciones(prev => prev.map(n => n.id === notificacion.id ? { ...n, leida: true } : n));
  };

  const items = NAVIGATION_ITEMS.filter(item =>
    hasAnyPermission(user.permissions, item.permissions)
  );

  const cargarDetalle = async (incidenteId: string) => {
  try {
    const response = await apiFetch(`/incidentes/${incidenteId}`);
    const data = await response.json();
    if (data.ok) setDetalleHover(data.data);
  } catch {}
  };

  const reproducirSonido = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch {}
};

  const initials = user.name.split(' ').slice(0, 2).map(n => n[0]).join('');

  return (
    <div style={{ width: 224, background: '#001f5b', display: 'flex', flexDirection: 'column', color: '#fff', flexShrink: 0, minHeight: '100vh', position: 'relative' }}>
      <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 55, height: 55, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/EscudoUdec.png" alt="Escudo Colegio UdeC" style={{ width: 95, height: 95, objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Colegio UdeC</div>
            <div style={{ fontSize: 10, color: '#93c5fd', marginTop: 1, whiteSpace: 'nowrap' }}>Sistema de Incidencias</div>
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
          {user.permissions.includes(PERMISSIONS.VIEW_ALERTS) && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMostrarPanel(!mostrarPanel)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <i className={`bi bi-bell-fill ${animarCampanita ? 'campanita-shake' : ''}`}
                style={{ fontSize: 16 }}  />
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
                <div id="panel-notificaciones" style={{
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
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Notificaciones</span>
                      {noLeidas > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>{noLeidas} sin leer</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                      {total} {total === 1 ? 'incidente grave activo' : 'incidentes graves activos'}
                    </div>
                  </div>
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {notificaciones.length === 0 ? (
                      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                        <i className="bi bi-bell-slash" style={{ fontSize: 28 }} />
                        <p style={{ marginTop: 8, fontSize: 14 }}>No hay notificaciones</p>
                      </div>
                    ) : (
                        <>
                          {notificaciones.map(n => (
                            <Link
                              key={n.id}
                              href={`/seguimiento/${n.incidenteId}`}
                              onClick={() => { marcarLeida(n); setMostrarPanel(false); }}
                              onMouseEnter={() => { setHover(n.id); cargarDetalle(n.incidenteId); }}
                              onMouseLeave={() => { setHover(null); setDetalleHover(null); }}
                              style={{
                                position: 'relative',
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
                                    {n.fechaCreacion &&
                                      formatDistanceToNow(new Date(n.fechaCreacion), {
                                        addSuffix: true,
                                        locale: es
                                      })
                                    }
                                  </div>
                                </div>
                                {!n.leida && (
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', marginLeft: 'auto', flexShrink: 0, marginTop: 4 }} />
                                )}
                              </div>
                              {hover === n.id && detalleHover && (
                                <div style={{
                                  position: 'fixed',
                                  left: 548,
                                  background: '#0f172a',
                                  color: '#fff',
                                  borderRadius: 10,
                                  padding: '12px 16px',
                                  width: 260,
                                  zIndex: 1100,
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                  pointerEvents: 'none'
                                }}>
                                  {detalleHover.participantes?.slice(0, 2).map((p: any, i: number) => (
                                    <div key={i} style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span>{p.nombreAlumno || p.alumnoInstitucionalId}</span>
                                      {p.curso && <span style={{ fontWeight: 400, color: '#94a3b8' }}>{p.curso}</span>}
                                      {p.rolEnIncidente && (() => {
                                        const roles: Record<string, { bg: string; color: string }> = {
                                          'Agresor': { bg: '#fee2e2', color: '#991b1b' },
                                          'Victima': { bg: '#dbeafe', color: '#1e40af' },
                                          'Testigo': { bg: '#f3e8ff', color: '#6b21a8' },
                                          'Involucrado': { bg: '#fef3c7', color: '#92400e' },
                                        };
                                        const estilo = roles[p.rolEnIncidente] || { bg: '#f1f5f9', color: '#475569' };
                                        return (
                                          <span style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            padding: '1px 6px',
                                            borderRadius: 6,
                                            background: estilo.bg,
                                            color: estilo.color
                                          }}>
                                            {p.rolEnIncidente}
                                          </span>
                                        );
                                      })()}
                                    </div>
                                  ))}
                                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>
                                    {detalleHover.descripcion?.slice(0, 80) || 'Sin descripción'}
                                  </p>
                                </div>
                              )}
                            </Link>
                          ))}
                          {hayMas && (
                            <button
                              onClick={() => {
                                const nuevoOffset = offset + 5;
                                apiFetch(`/notificaciones?limit=5&offset=${nuevoOffset}`)
                                  .then(r => r.json())
                                  .then(data => {
                                    if (data.ok) {
                                      setNotificaciones(prev => [...prev, ...data.data]);
                                      setOffset(nuevoOffset);
                                      setHayMas(nuevoOffset + 5 < data.total);
                                    }
                                  })
                                  .catch(() => {});
                              }}
                              style={{
                                width: '100%',
                                padding: '12px',
                                background: 'transparent',
                                border: 'none',
                                borderTop: '1px solid #f1f5f9',
                                color: '#3b82f6',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                              }}
                            >
                              Ver más
                            </button>
                          )}
                        </>
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
