import { ReactNode } from 'react';

export interface TableColumn {
  key: string;
  label: string;
  nowrap?: boolean;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  onRowClick?: (row: Record<string, unknown>) => void;
}

export default function Table({ columns, rows, onRowClick }: TableProps) {
  if (!rows || !rows.length) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
        <i className="bi bi-inbox" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
        Sin registros encontrados
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#64748b',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{
                borderBottom: '1px solid #f1f5f9',
                background: i % 2 === 0 ? '#fff' : '#fafafa',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 0.1s',
              }}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    padding: '10px 14px',
                    color: '#374151',
                    whiteSpace: c.nowrap ? 'nowrap' : 'normal',
                  }}
                >
                  {c.render ? c.render(row[c.key], row) : (row[c.key] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
