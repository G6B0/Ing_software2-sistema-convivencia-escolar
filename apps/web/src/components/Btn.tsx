import { ReactNode } from 'react';

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export default function Btn({ children, onClick, variant = 'primary', size = 'md', type = 'button', disabled }: BtnProps) {
  const V = {
    primary: { background: '#003087', color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: '#003087', border: '1.5px solid #003087' },
    ghost: { background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0' }
  };
  const S = {
    sm: { padding: '5px 14px', fontSize: 13 },
    md: { padding: '8px 20px', fontSize: 14 },
    lg: { padding: '11px 28px', fontSize: 15 }
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...V[variant],
        ...S[size],
        borderRadius: 8,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }}
    >
      {children}
    </button>
  );
}
