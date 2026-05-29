'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  user: { name: string; role: string };
  onLogout?: () => void;
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'speedometer2', href: '/dashboard' },
    { id: 'incidencias', label: 'Incidencias', icon: 'exclamation-triangle', href: '/incidencias' },
    { id: 'registrar', label: 'Registrar', icon: 'plus-circle', href: '/registrar' },
    { id: 'seguimiento', label: 'Seguimiento', icon: 'journal-check', href: '/seguimiento' },
    { id: 'ranking', label: 'Ranking Cursos', icon: 'bar-chart-line', href: '/ranking' },
    { id: 'mensual', label: 'Reporte Mensual', icon: 'calendar3', href: '/mensual' },
  ];

  const initials = user.name.split(' ').slice(0, 2).map(n => n[0]).join('');

  return (
    <div style={{ width: 224, background: '#001f5b', display: 'flex', flexDirection: 'column', color: '#fff', flexShrink: 0, minHeight: '100vh' }}>
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
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
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
