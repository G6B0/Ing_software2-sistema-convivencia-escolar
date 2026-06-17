import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
}

const colorMap: Record<string, { bg: string; c: string }> = {
  'Leve':           { bg: '#dcfce7', c: '#15803d' },
  'Moderado':       { bg: '#fef3c7', c: '#92400e' },
  'Grave':          { bg: '#fee2e2', c: '#991b1b' },
  'Abierto':        { bg: '#dbeafe', c: '#1d4ed8' },
  'Cerrado':        { bg: '#f1f5f9', c: '#475569' },
  'En seguimiento': { bg: '#ede9fe', c: '#5b21b6' },
  'Activo':         { bg: '#dcfce7', c: '#15803d' },
};

const defaultColor = { bg: '#f1f5f9', c: '#64748b' };

export default function Badge({ children }: BadgeProps) {
  const text = typeof children === 'string' ? children : '';
  const s = colorMap[text] || defaultColor;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: s.bg,
        color: s.c,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
