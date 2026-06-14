import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: ReactNode;
  icon?: string;
  color?: string;
}

export default function StatCard({ label, value, sub, icon, color = '#003087' }: StatCardProps) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '20px 22px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>{label}</span>
        {icon && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
            }}
          >
            <i className={`bi bi-${icon}`} style={{ fontSize: 18 }} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
