import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: ReactNode;
  icon?: string;
  color?: string;
  bg?: string;
  borderColor?: string;
  onClick?: () => void;
  delta?: number | null; // <--- NUEVA PROP (T11)
}

const hoverClass = 'stat-card-interactive';

export default function StatCard({ label, value, sub, icon, color = '#003087', bg, borderColor, onClick, delta }: StatCardProps) {
  const baseStyle: React.CSSProperties = {
    background: bg || '#fff',
    borderRadius: 12,
    padding: '20px 22px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    border: `1px solid ${borderColor || '#e2e8f0'}`,
    ...(onClick ? { cursor: 'pointer', transition: 'box-shadow 0.2s ease', width: '100%', textAlign: 'left' } : {}),
  };

  // Función para renderizar el indicador visual (Cumple T2.1 a T2.6)
  const renderTendencia = () => {
    // T2.3: Primer mes no tiene referencia
    if (delta === null || delta === undefined) {
      return <span style={{ color: '#9ca3af', fontSize: 13, fontWeight: 600 }}>—</span>;
    }
    // T2.6: Sin cambios
    if (delta === 0) {
      return <span style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>sin cambios</span>;
    }
    // T2.1 y T2.4: Más incidentes (Delta positivo -> ROJO)
    if (delta > 0) {
      return <span style={{ color: '#991b1b', fontSize: 13, fontWeight: 600 }}>+{delta}</span>;
    }
    // T2.2 y T2.5: Menos incidentes (Delta negativo -> VERDE)
    if (delta < 0) {
      return <span style={{ color: '#15803d', fontSize: 13, fontWeight: 600 }}>{delta}</span>;
    }
  };

  const content = (
    <>
      {onClick && (
        <style>{`
          .${hoverClass}:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important;
          }
        `}</style>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>{label}</span>
        {icon && (
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
            <i className={`bi bi-${icon}`} style={{ fontSize: 18 }} />
          </div>
        )}
      </div>
      
      {/* Contenedor flexible para alinear el valor y el delta */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
        {delta !== undefined && <div>{renderTendencia()}</div>}
      </div>

      {sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{sub}</div>}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={hoverClass} style={baseStyle}>
        {content}
      </button>
    );
  }

  return <div style={baseStyle}>{content}</div>;
}
