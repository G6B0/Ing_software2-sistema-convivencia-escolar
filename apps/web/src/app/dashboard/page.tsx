'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/StatCard';
import Table, { TableColumn } from '@/components/Table';
import BarChart from '@/components/BarChart';
import LineChart from '@/components/LineChart';
import DonutChart from '@/components/DonutChart';
import Badge from '@/components/Badge';
import Btn from '@/components/Btn';
import { apiFetch } from '@/lib/api';
import { useSessionPermissions } from '@/hooks/useSessionPermissions';
import { hasAnyPermission, PERMISSIONS } from '@/lib/permissions';

interface DashboardData {
  kpis: {
    incidenciasMes: number;
    graves: number;
    enSeguimiento: number;
    reincidentes: number;
  };
  distribucionGravedad: Array<{ gravedad: string; cantidad: number }>;
  tiposFrecuentes: Array<{ tipo: string; cantidad: number }>;
  cursosFrecuentes: Array<{ curso: string; total: number; leve: number; moderado: number; grave: number }>;
  evolucionMensual: Array<{ mes: string; total: number }>;
  ultimasIncidencias: Array<{
    id: string;
    fecha: string;
    titulo: string;
    gravedad: string;
    estado: string;
    participantes?: Array<{ alumnoInstitucionalId?: string; nombreAlumno?: string; apellidoAlumno?: string }>;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const permisos = useSessionPermissions();
  const puedeRegistrar = permisos.includes(PERMISSIONS.REGISTER_INCIDENTS);
  const puedeVerSeguimiento = hasAnyPermission(permisos, [
    PERMISSIONS.CONSULT_HISTORY,
    PERMISSIONS.REGISTER_FOLLOWUPS,
    PERMISSIONS.REGISTER_BASIC_FOLLOWUPS,
    PERMISSIONS.CONSULT_INCIDENTS,
    PERMISSIONS.CONSULT_OWN_OR_GENERAL_INCIDENTS,
    PERMISSIONS.MANAGE_INCIDENTS,
  ]);
  const puedeVerReportes = hasAnyPermission(permisos, [
    PERMISSIONS.REVIEW_REPORTS,
    PERMISSIONS.CONSULT_REPORTS,
  ]);
  const [data, setData] = useState<DashboardData | null>(null);
  const [mensualData, setMensualData] = useState<Array<{ mes: string; total: number; leve: number; moderado: number; grave: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, mensualRes] = await Promise.all([
          apiFetch('/reportes/dashboard'),
          apiFetch('/reportes/mensual'),
        ]);
        const dashResult = await dashRes.json();
        const mensualResult = await mensualRes.json();

        if (!dashResult.ok) {
          throw new Error(dashResult.error || 'Error al cargar datos');
        }

        setData(dashResult.data);
        if (mensualResult.ok) setMensualData(mensualResult.data);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatFecha = (fecha: string) => {
    try {
      if (!fecha) return 'Sin fecha';
      if (fecha.includes('/')) return fecha;
      const fechaSolo = fecha.includes('T') ? fecha.split('T')[0] : fecha;
      const [year, month, day] = fechaSolo.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return fecha;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: '28px 32px', textAlign: 'center' }}>
        <i className="bi bi-arrow-repeat" style={{ fontSize: 24, animation: 'spin 0.9s linear infinite' }} />
        <p style={{ marginTop: 12, color: '#64748b' }}>Cargando dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Dashboard</h1>
        <p style={{ margin: '4px 0 24px', fontSize: 14, color: '#64748b' }}>Panel de control del sistema</p>
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

  if (!data) return null;

  const { kpis, distribucionGravedad, tiposFrecuentes, cursosFrecuentes, evolucionMensual, ultimasIncidencias } = data;

  // Prepare data for charts
  const donutData = distribucionGravedad.map(d => ({
    label: d.gravedad,
    value: d.cantidad,
    color: d.gravedad === 'Leve' ? '#15803d' : d.gravedad === 'Moderado' ? '#e67e22' : '#991b1b'
  }));

  const tiposBarData = tiposFrecuentes.map(t => ({ tipo: t.tipo, cantidad: t.cantidad }));

  const cursosBarData = cursosFrecuentes.map(c => ({
    curso: c.curso,
    leve: c.leve,
    moderado: c.moderado,
    grave: c.grave
  }));

  const evolucionData = mensualData.length > 0 ? mensualData : evolucionMensual.map(e => ({ mes: e.mes, total: e.total, leve: 0, moderado: 0, grave: 0 }));

  // Table columns
  const columns: TableColumn[] = [
    { key: 'fecha', label: 'Fecha', nowrap: true, render: (val) => formatFecha(val as string) },
    {
      key: 'alumno',
      label: 'Alumno',
      render: (_, row) => {
        const p = (row as any).participantes?.[0];
        return p ? `${p.nombreAlumno || ''} ${p.apellidoAlumno || ''}`.trim() || 'N/A' : 'N/A';
      }
    },
    { key: 'titulo', label: 'Tipo' },
    { key: 'gravedad', label: 'Gravedad', render: (val) => <Badge>{val as string}</Badge> },
    { key: 'estado', label: 'Estado', render: (val) => <Badge>{val as string}</Badge> }
  ];

  const handleRowClick = (row: Record<string, unknown>) => {
    const alumnoId = (row as any).participantes?.[0]?.alumnoInstitucionalId;
    if (alumnoId) {
      router.push(`/alumnos/${alumnoId}`);
    }
  };

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Dashboard</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>Panel de control del sistema</p>
      </div>

      {/* Quick action buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {puedeRegistrar && (
          <Btn onClick={() => router.push('/registrar')}>
            <i className="bi bi-plus-lg" /> Nueva incidencia
          </Btn>
        )}
        {puedeVerSeguimiento && (
          <Btn onClick={() => router.push('/seguimiento')} variant="secondary">
            <i className="bi bi-list-check" /> Ver seguimiento
          </Btn>
        )}
        {puedeVerReportes && (
          <Btn onClick={() => router.push('/mensual')} variant="secondary">
            <i className="bi bi-calendar3" /> Reporte anual
          </Btn>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard
          label="Incidencias este mes"
          value={kpis.incidenciasMes}
          icon="calendar-check"
          color="#003087"
          onClick={() => {
            const ahora = new Date();
            router.push(`/incidencias?mes=${ahora.getMonth() + 1}&anio=${ahora.getFullYear()}`);
          }}
        />
        <StatCard
          label="Casos graves"
          value={kpis.graves}
          icon="exclamation-triangle"
          color="#991b1b"
          onClick={() => router.push('/incidencias?gravedad=Grave')}
        />
        <StatCard
          label="En seguimiento"
          value={kpis.enSeguimiento}
          icon="arrow-repeat"
          color="#7c3aed"
          onClick={() => router.push(`/incidencias?estado=${encodeURIComponent('En seguimiento')}`)}
        />
        <StatCard
          label="Alumnos reincidentes"
          value={kpis.reincidentes}
          icon="person-exclamation"
          color="#92400e"
          onClick={() => router.push('/reincidentes')}
        />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Line Chart - Monthly Evolution */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Evolución de incidencias por mes
            </h2>
            <a
              onClick={() => router.push('/mensual')}
              style={{ fontSize: 13, color: '#003087', cursor: 'pointer', textDecoration: 'none', fontWeight: 600 }}
            >
              Ver Reporte Anual →
            </a>
          </div>
          {evolucionData.length > 0 ? (
            <>
              <LineChart
                data={evolucionData}
                xKey="mes"
                lines={[
                  { key: 'total', label: 'Total', color: '#003087', showLabel: true },
                  { key: 'leve', label: 'Leve', color: '#15803d' },
                  { key: 'moderado', label: 'Moderado', color: '#e67e22' },
                  { key: 'grave', label: 'Grave', color: '#991b1b' },
                ]}
                height={220}
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
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
                {[
                  { label: 'Total', color: '#003087' },
                  { label: 'Leve', color: '#15803d' },
                  { label: 'Moderado', color: '#e67e22' },
                  { label: 'Grave', color: '#991b1b' },
                ].map(({ label, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="24" height="12" style={{ display: 'block' }}>
                      <line x1="0" y1="6" x2="18" y2="6" stroke={color} strokeWidth="2" />
                      <circle cx="18" cy="6" r="4" fill="#fff" stroke={color} strokeWidth="2" />
                    </svg>
                    <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              Sin datos de evolución
            </div>
          )}
        </div>

        {/* Donut Chart - Severity Distribution */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Distribución por gravedad
          </h2>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {donutData.length > 0 && donutData.some(d => d.value > 0) ? (
              <DonutChart data={donutData} height={180} />
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                Sin datos
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Bar Chart - Top Courses */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Cursos con más incidencias
            </h2>
            <a
              onClick={() => router.push('/ranking')}
              style={{ fontSize: 13, color: '#003087', cursor: 'pointer', textDecoration: 'none', fontWeight: 600 }}
            >
              Ver ranking →
            </a>
          </div>
          {cursosBarData.length > 0 ? (
            <BarChart
              data={cursosBarData}
              xKey="curso"
              bars={[
                { key: 'leve', color: '#dcfce7' },
                { key: 'moderado', color: '#fef3c7' },
                { key: 'grave', color: '#fee2e2' }
              ]}
              height={220}
            />
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              Sin datos de cursos
            </div>
          )}
        </div>

        {/* Bar Chart - Top Types */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Tipos más frecuentes
          </h2>
          {tiposBarData.length > 0 ? (
            <BarChart
              data={tiposBarData}
              xKey="tipo"
              bars={[{ key: 'cantidad', color: '#003087' }]}
              height={220}
            />
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              Sin datos de tipos
            </div>
          )}
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
          Últimas incidencias
        </h2>
        <Table columns={columns} rows={ultimasIncidencias} onRowClick={handleRowClick} />
      </div>
    </div>
  );
}
