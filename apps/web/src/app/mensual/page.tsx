'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/StatCard';
import Table, { TableColumn } from '@/components/Table';
import LineChart from '@/components/LineChart';
import { apiFetch } from '@/lib/api';

interface MesData {
  mes: string;
  total: number;
  leve: number;
  moderado: number;
  grave: number;
}

const SERIES = [
  { key: 'total', label: 'Total', color: '#003087' },
  { key: 'leve', label: 'Leve', color: '#15803d' },
  { key: 'moderado', label: 'Moderado', color: '#e67e22' },
  { key: 'grave', label: 'Grave', color: '#991b1b' },
];

export default function MensualPage() {
  const router = useRouter();
  const [data, setData] = useState<MesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiFetch('/reportes/mensual');
        const result = await response.json();
        if (!result.ok) throw new Error(result.error || 'Error al cargar datos');
        setData(result.data);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', textAlign: 'center' }}>
        <i className="bi bi-arrow-repeat" style={{ fontSize: 24, animation: 'spin 0.9s linear infinite' }} />
        <p style={{ marginTop: 12, color: '#64748b' }}>Cargando reporte anual...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Reporte anual</h1>
        <p style={{ margin: '4px 0 24px', fontSize: 14, color: '#64748b' }}>Evolución de incidencias registradas</p>
        <div style={{
          padding: '16px 20px',
          borderRadius: 10,
          border: '1px solid #dc2626',
          background: '#fee2e2',
          color: '#991b1b',
          fontSize: 14,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <i className="bi bi-exclamation-triangle-fill" />
          {error}
        </div>
      </div>
    );
  }

  const anio = new Date().getFullYear();
  const rango = data.length > 0
    ? `${data[0].mes} a ${data[data.length - 1].mes} ${anio}`
    : '';

  const columns: TableColumn[] = [
    { key: 'mes', label: 'Mes' },
    { key: 'total', label: 'Total', render: (val) => <span style={{ fontWeight: 700 }}>{val as number}</span> },
    { key: 'leve', label: 'Leves', render: (val) => <span style={{ color: '#15803d', fontWeight: 600 }}>{val as number}</span> },
    { key: 'moderado', label: 'Moderados', render: (val) => <span style={{ color: '#e67e22', fontWeight: 600 }}>{val as number}</span> },
    { key: 'grave', label: 'Graves', render: (val) => <span style={{ color: '#991b1b', fontWeight: 600 }}>{val as number}</span> },
  ];

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Reporte anual</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
          Evolución de incidencias registradas{rango ? ` — ${rango}` : ''}
        </p>
      </div>

      {/* Tarjetas por mes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {data.map((mes, index) => (
          <StatCard
            key={mes.mes}
            label={mes.mes}
            value={mes.total}
            sub={
              <>
                <span style={{ color: '#15803d' }}>{mes.leve} Leves</span>
                {' · '}
                <span style={{ color: '#e67e22' }}>{mes.moderado} Moderados</span>
                {' · '}
                <span style={{ color: '#991b1b' }}>{mes.grave} Graves</span>
              </>
            }
            onClick={() => {
              const anio = new Date().getFullYear();
              router.push(`/incidencias?mes=${index + 1}&anio=${anio}`);
            }}
          />
        ))}
      </div>

      {/* Gráfico de líneas */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Evolución de incidencias por mes</h2>
          {rango && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>{rango}</p>}
        </div>
        <LineChart
          data={data as unknown as Array<Record<string, string | number>>}
          xKey="mes"
          lines={SERIES.map((s, i) => ({ key: s.key, label: s.label, color: s.color, showLabel: i === 0 }))}
          height={210}
          onPointClick={(_i, point) => {
            const meses: Record<string, number> = {
              Enero: 1, Febrero: 2, Marzo: 3, Abril: 4, Mayo: 5, Junio: 6,
              Julio: 7, Agosto: 8, Septiembre: 9, Octubre: 10, Noviembre: 11, Diciembre: 12,
            };
            const mes = meses[point.mes as string];
            if (mes) {
              router.push(`/incidencias?mes=${mes}&anio=${new Date().getFullYear()}`);
            }
          }}
        />
        {/* Leyenda debajo del gráfico */}
        <div data-testid="leyenda" style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
          {SERIES.map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="24" height="12" style={{ display: 'block' }}>
                <line x1="0" y1="6" x2="18" y2="6" stroke={color} strokeWidth="2" />
                <circle cx="18" cy="6" r="4" fill="#fff" stroke={color} strokeWidth="2" />
              </svg>
              <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla resumen */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
        <Table columns={columns} rows={data as unknown as Record<string, unknown>[]} />
      </div>
    </div>
  );
}
