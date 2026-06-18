'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FilaAlumno {
  id: string;
  nombre: string;
  curso: string;
  total: number;
  leves: number;
  moderados: number;
  graves: number;
}

export default function ReincidentesPage() {
  const router = useRouter();
  const [alumnos, setAlumnos] = useState<FilaAlumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API_URL}/incidentes`);
        if (!res.ok) throw new Error('Error al obtener los datos');
        const resultado = await res.json();
        if (!resultado.ok) throw new Error(resultado.mensaje || 'Error en la respuesta');

        const incidentes = resultado.data || [];
        const mapa: Record<string, FilaAlumno> = {};

        for (const inc of incidentes) {
          for (const p of inc.participantes || []) {
            const id = p.alumnoInstitucionalId || p.id;
            if (!id) continue;
            const nombre = [p.nombreAlumno, p.apellidoAlumno].filter(Boolean).join(' ') || id;
            const curso = p.cursoAlumno || p.curso || 'Sin curso';
            if (!mapa[id]) {
              mapa[id] = { id, nombre, curso, total: 0, leves: 0, moderados: 0, graves: 0 };
            }
            mapa[id].total += 1;
            const g = inc.gravedad?.toLowerCase();
            if (g === 'leve') mapa[id].leves += 1;
            else if (g === 'moderado' || g === 'media') mapa[id].moderados += 1;
            else if (g === 'grave' || g === 'alta') mapa[id].graves += 1;
          }
        }

        const reincidentes = Object.values(mapa)
          .filter(a => a.total > 1)
          .sort((a, b) => b.total - a.total);

        setAlumnos(reincidentes);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', textAlign: 'center' }}>
        <i className="bi bi-arrow-repeat" style={{ fontSize: 24, animation: 'spin 0.9s linear infinite' }} />
        <p style={{ marginTop: 12, color: '#64748b' }}>Cargando alumnos reincidentes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Alumnos reincidentes</h1>
        <div style={{ padding: '16px 20px', borderRadius: 10, border: '1px solid #dc2626', background: '#fee2e2', color: '#991b1b', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="bi bi-exclamation-triangle-fill" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Alumnos reincidentes</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
          Alumnos con más de una incidencia registrada, ordenados por frecuencia
        </p>
      </div>

      {alumnos.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <i className="bi bi-person-check" style={{ fontSize: 32 }} />
          <p style={{ marginTop: 12 }}>No hay alumnos reincidentes registrados</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
              {alumnos.length} alumno{alumnos.length !== 1 ? 's' : ''} con reincidencia
            </span>
            <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: '#fee2e2', color: '#991b1b' }}>
              Requieren atención
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['#', 'Alumno', 'Curso', 'Total', 'Leves', 'Moderados', 'Graves'].map(col => (
                  <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno, idx) => (
                <tr
                  key={alumno.id}
                  onClick={() => router.push(`/alumnos/${alumno.id}`)}
                  style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: idx === 0 ? '#991b1b' : '#64748b' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#2563eb' }}>
                    {alumno.nombre}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: '#475569' }}>
                    {alumno.curso}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                    {alumno.total}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: '#dcfce7', color: '#15803d' }}>
                      {alumno.leves}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: '#fef3c7', color: '#92400e' }}>
                      {alumno.moderados}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: '#fee2e2', color: '#991b1b' }}>
                      {alumno.graves}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
