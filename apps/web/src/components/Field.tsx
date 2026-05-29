import { ReactNode } from 'react';

interface FieldProps {
  label?: string;
  required?: boolean;
  children: ReactNode;
}

export default function Field({ label, required, children }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          {label}
          {required && <span style={{ color: '#dc2626' }}> *</span>}
        </label>
      )}
      {children}
    </div>
  );
}
