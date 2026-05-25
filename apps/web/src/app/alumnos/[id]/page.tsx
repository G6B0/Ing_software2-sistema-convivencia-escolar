'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Btn from '@/components/Btn';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AlumnoPerfilPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [incidentes, setIncidentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarIncidentes = async () => {
      try {
        const response = await fetch(`${API_URL}/incidentes`);
        if (response.ok) {
          const resultado = await response.json();
          if (resultado.ok) {
            setIncidentes(resultado.data || []);
          }
        }
      } catch (error) {
        console.error('Error al cargar incidentes:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarIncidentes();
  }, []);

  const formatearFecha = (fecha: string) => {
    try {
      if (!fecha) return 'Sin fecha';
      if (fecha.includes('/')) return fecha;
      let fechaSolo = fecha;
      if (fecha.includes('T')) {
        fechaSolo = fecha.split('T')[0];
      }
      const [year, month, day] = fechaSolo.split('-');
      return `${day}/${month}/${year}`;
    } catch (error) {
      return fecha;
    }
  };

  // Filtrar incidentes del alumno
  const incidentesAlumno = incidentes.filter(inc =>
    inc.participantes?.some((p: any) => p.alumnoInstitucionalId === params.id)
  );

  // Obtener datos del primer participante que coincida
  const primerIncidente = incidentesAlumno[0];
  const participante = primerIncidente?.participantes?.find((p: any) => p.alumnoInstitucionalId === params.id);
  const nombreAlumno = participante?.nombreAlumno || params.id;
  const curso = participante?.curso || 'N/A';

  // Calcular estadísticas
  const total = incidentesAlumno.length;
  const leves = incidentesAlumno.filter(i => i.gravedad === 'Leve').length;
  const moderados = incidentesAlumno.filter(i => i.gravedad === 'Media' || i.gravedad === 'Moderado').length;
  const graves = incidentesAlumno.filter(i => i.gravedad === 'Alta' || i.gravedad === 'Grave').length;
  const esReincidente = total >= 2;

  // Obtener iniciales
  const iniciales = nombreAlumno.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', textAlign: 'center' }}>
        <i className="bi bi-arrow-repeat" style={{ fontSize: 24, animation: 'spin 0.9s linear infinite' }} />
        <p style={{ marginTop: 12, color: '#64748b' }}>Cargando perfil del alumno...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Botón volver */}
      <button
        onClick={() => router.push('/incidencias')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          border: 'none',
          color: '#64748b',
          fontSize: 14,
          cursor: 'pointer',
          fontFamily: 'inherit',
          marginBottom: 24,
          padding: 0
        }}
      >
        <i className="bi bi-arrow-left" /> Volver a incidencias
      </button>

      {/* Tarjeta de perfil del alumno */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '24px 28px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 700,
            color: '#1e40af'
          }}>
            {iniciales}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
              {nombreAlumno}
            </h1>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: '#64748b' }}>
              <span><i className="bi bi-person-badge" /> {params.id}</span>
              <span><i className="bi bi-mortarboard" /> Curso {curso}</span>
            </div>
          </div>
        </div>
        <Btn variant="primary" onClick={() => router.push('/registrar')}>
          <i className="bi bi-plus-circle" /> Nuevo incidente
        </Btn>
      </div>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Total incidencias</span>
            <i className="bi bi-list-ul" style={{ color: '#64748b' }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a' }}>{total}</div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Leves</span>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#15803d' }} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a' }}>{leves}</div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Moderados</span>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-exclamation-circle-fill" style={{ fontSize: 12, color: '#92400e' }} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a' }}>{moderados}</div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Graves</span>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-x-circle-fill" style={{ fontSize: 12, color: '#991b1b' }} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a' }}>{graves}</div>
        </div>
      </div>

      {/* Historial de incidencias */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            Historial de incidencias
          </h2>
          {esReincidente && (
            <span style={{
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: '#fef3c7',
              color: '#92400e',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}>
              <i className="bi bi-exclamation-triangle-fill" /> Alumno reincidente
            </span>
          )}
        </div>

        {incidentesAlumno.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <i className="bi bi-inbox" style={{ fontSize: 32 }} />
            <p style={{ marginTop: 12 }}>No hay incidentes registrados para este alumno</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>FECHA</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TIPO</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GRAVEDAD</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ESTADO</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MEDIDA TOMADA</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>REGISTRADO POR</th>
              </tr>
            </thead>
            <tbody>
              {incidentesAlumno.map((incidente) => {
                const gravedadMap: Record<string, { bg: string; color: string; label: string }> = {
                  'Alta': { bg: '#fee2e2', color: '#991b1b', label: 'Grave' },
                  'Grave': { bg: '#fee2e2', color: '#991b1b', label: 'Grave' },
                  'Media': { bg: '#fef3c7', color: '#92400e', label: 'Moderado' },
                  'Moderado': { bg: '#fef3c7', color: '#92400e', label: 'Moderado' },
                  'Leve': { bg: '#dcfce7', color: '#15803d', label: 'Leve' },
                };

                const estadoMap: Record<string, { bg: string; color: string }> = {
                  'Abierto': { bg: '#dbeafe', color: '#1e40af' },
                  'En seguimiento': { bg: '#e9d5ff', color: '#7c3aed' },
                  'Cerrado': { bg: '#e2e8f0', color: '#475569' },
                };

                const gravedadStyle = gravedadMap[incidente.gravedad] || { bg: '#e2e8f0', color: '#475569', label: incidente.gravedad };
                const estadoStyle = estadoMap[incidente.estado] || { bg: '#e2e8f0', color: '#475569' };

                return (
                  <tr
                    key={incidente.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onClick={() => router.push(`/seguimiento/${incidente.id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '16px', fontSize: 14, color: '#0f172a' }}>
                      {formatearFecha(incidente.fecha)}
                    </td>
                    <td style={{ padding: '16px', fontSize: 14, color: '#0f172a' }}>
                      {incidente.titulo}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 16,
                        fontSize: 13,
                        fontWeight: 600,
                        background: gravedadStyle.bg,
                        color: gravedadStyle.color
                      }}>
                        {gravedadStyle.label}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 16,
                        fontSize: 13,
                        fontWeight: 600,
                        background: estadoStyle.bg,
                        color: estadoStyle.color
                      }}>
                        {incidente.estado}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: 14, color: '#64748b' }}>
                      —
                    </td>
                    <td style={{ padding: '16px', fontSize: 14, color: '#0f172a' }}>
                      {incidente.funcionarioResponsableId}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
