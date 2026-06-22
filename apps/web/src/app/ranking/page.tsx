'use client';

import { useEffect, useState } from 'react';
<<<<<<< Updated upstream

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
=======
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
>>>>>>> Stashed changes

interface FilaCurso {
  curso: string;
  total: number;
  leves: number;
  moderados: number;
  graves: number;
}

export default function RankingPage() {
  const router = useRouter();
  const [datos, setDatos] = useState<FilaCurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const cargar = async () => {
      try {
        const response = await fetch(`${API_URL}/incidentes`);
        if (!response.ok) throw new Error('Error al obtener los datos');
        const resultado = await response.json();
        if (!resultado.ok) throw new Error(resultado.mensaje || 'Error en la respuesta');

        const incidentes = resultado.data || [];

        // Agrupar por curso
        const mapa: Record<string, FilaCurso> = {};
        // Ahora: solo cuenta el participante agresor
        for (const inc of incidentes) {
          const agresor = (inc.participantes || []).find(
            (p: any) => p.rolEnIncidente === 'Agresor'
          );

          // Si no hay agresor usa el primer participante como fallback
          const participante = agresor || (inc.participantes || [])[0];
          if (!participante) continue;

          const curso = participante.cursoAlumno || participante.curso || 'Sin curso';
          if (!mapa[curso]) {
            mapa[curso] = { curso, total: 0, leves: 0, moderados: 0, graves: 0 };
          }
          mapa[curso].total += 1;
          const g = inc.gravedad?.toLowerCase();
          if (g === 'leve') mapa[curso].leves += 1;
          else if (g === 'moderado' || g === 'media') mapa[curso].moderados += 1;
          else if (g === 'grave' || g === 'alta') mapa[curso].graves += 1;
        }

        // Ordenar de mayor a menor por total (T5.4)
        const ordenado = Object.values(mapa).sort((a, b) => b.total - a.total);
        setDatos(ordenado);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const maxTotal = datos.length > 0 ? datos[0].total : 1;

  // T5.6: Estado de carga
  if (loading) {
    return (
      <div style={{ padding: '28px 32px', textAlign: 'center' }}>
        <i className="bi bi-arrow-repeat" style={{ fontSize: 24, animation: 'spin 0.9s linear infinite' }} />
        <p style={{ marginTop: 12, color: '#64748b' }}>Cargando ranking de cursos...</p>
      </div>
    );
  }

  // T5.7: Estado de error
  if (error) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Ranking de Cursos</h1>
        <p style={{ margin: '4px 0 24px', fontSize: 14, color: '#64748b' }}>Cursos ordenados por cantidad de incidencias</p>
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

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Ranking de Cursos</h1>
      <p style={{ margin: '4px 0 24px', fontSize: 14, color: '#64748b' }}>Cursos ordenados por cantidad de incidencias</p>

      {datos.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <i className="bi bi-bar-chart" style={{ fontSize: 32 }} />
          <p style={{ marginTop: 12 }}>No hay incidencias registradas aun</p>
        </div>
      ) : (
        <>
          {/* Grafico de barras apiladas (T5.1) */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '24px 28px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Incidencias por curso</h2>

              {/* Leyenda (T5.2) */}
              <div style={{ display: 'flex', gap: 20 }}>
                {[
                  { label: 'Leve', color: '#15803d', bg: '#dcfce7' },
                  { label: 'Moderado', color: '#92400e', bg: '#fef3c7' },
                  { label: 'Grave', color: '#991b1b', bg: '#fee2e2' },
                ].map(({ label, color, bg }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: bg, border: `1.5px solid ${color}` }} />
                    <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Barras */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {datos.map((fila, idx) => (
                <div key={fila.curso}
                onClick={() => router.push(`/incidencias?curso=${encodeURIComponent(fila.curso)}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div style={{ width: 100, fontSize: 13, fontWeight: 600, color: '#0f172a', textAlign: 'right', flexShrink: 0 }}>
                    {fila.curso}
                  </div>
                  <div style={{ flex: 1, height: 28, borderRadius: 6, overflow: 'hidden', background: '#f1f5f9', display: 'flex' }}>
                    {fila.leves > 0 && (
                      <div style={{
                        width: `${(fila.leves / maxTotal) * 100}%`,
                        background: '#dcfce7',
                        borderRight: fila.moderados > 0 || fila.graves > 0 ? '1px solid #fff' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#15803d'
                      }}>
                        {fila.leves}
                      </div>
                    )}
                    {fila.moderados > 0 && (
                      <div style={{
                        width: `${(fila.moderados / maxTotal) * 100}%`,
                        background: '#fef3c7',
                        borderRight: fila.graves > 0 ? '1px solid #fff' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#92400e'
                      }}>
                        {fila.moderados}
                      </div>
                    )}
                    {fila.graves > 0 && (
                      <div style={{
                        width: `${(fila.graves / maxTotal) * 100}%`,
                        background: '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#991b1b'
                      }}>
                        {fila.graves}
                      </div>
                    )}
                  </div>
                  <div style={{ width: 32, fontSize: 13, fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>
                    {fila.total}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla con desglose (T5.3, T5.4, T5.5) */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Desglose por curso</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['#', 'Curso', 'Total', 'Leves', 'Moderados', 'Graves'].map(col => (
                    <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos.map((fila, idx) => (
                  <tr
                    key={fila.curso}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    onClick={() => router.push(`/incidencias?curso=${encodeURIComponent(fila.curso)}`)}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* T5.5: Posicion numerica */}
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: idx === 0 ? '#4338ca' : '#64748b' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                      {fila.curso}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                      {fila.total}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: '#dcfce7', color: '#15803d' }}>
                        {fila.leves}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: '#fef3c7', color: '#92400e' }}>
                        {fila.moderados}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: '#fee2e2', color: '#991b1b' }}>
                        {fila.graves}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}