'use client';

import { useParams, useRouter,  useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { nombreAlumno, nombreFuncionario } from '@/lib/displayNames';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SESSION_STORAGE_KEY = 'sce_sesion';

export default function SeguimientoIncidentePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [incidente, setIncidente] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [protocolos, setProtocolos] = useState<Record<string, string>>({});

  const [mensajeGravedad, setMensajeGravedad] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Seguimientos
  const [seguimientos, setSeguimientos] = useState<any[]>([]);
  const [loadingSeguimientos, setLoadingSeguimientos] = useState(true);

  // Sesión del funcionario
  const [funcionarioId, setFuncionarioId] = useState('');

  const searchParams = useSearchParams();
  const [mensajeExito, setMensajeExito] = useState(searchParams.get('exito') === '1');

  useEffect(() => {
    try {
      const sesionGuardada = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (sesionGuardada) {
        const sesion = JSON.parse(sesionGuardada);
        setFuncionarioId(sesion.funcionario?.id || '');
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/institucional/protocolos`)
      .then(r => r.json())
      .then(data => { if (data.ok) setProtocolos(data.data) })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const cargarIncidente = async () => {
      try {
        const response = await fetch(`${API_URL}/incidentes/${id}`);
        if (response.ok) {
          const resultado = await response.json();
          if (resultado.ok) {
            setIncidente(resultado.data);
          }
        }
      } catch (error) {
        console.error('Error al cargar incidente:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarIncidente();
  }, [id]);

  const cargarSeguimientos = async () => {
    try {
      setLoadingSeguimientos(true);
      const response = await fetch(`${API_URL}/incidentes/${id}/seguimientos`, {
        headers: { 'x-funcionario-id': funcionarioId || 'FUN-300FUN-3002' }
      });
      if (response.ok) {
        const data = await response.json();
        setSeguimientos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error al cargar seguimientos:', error);
    } finally {
      setLoadingSeguimientos(false);
    }
  };

  useEffect(() => {
    if (id) cargarSeguimientos();
  }, [id, funcionarioId]);

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

  const obtenerProtocolo = (gravedad: string) => {
    const g = gravedad?.charAt(0).toUpperCase() + gravedad?.slice(1).toLowerCase();
    const texto = protocolos[g];
    if (!texto) return null;
    if (g === 'Leve') return { texto, color: '#15803d', bg: '#dcfce7', icono: 'bi-info-circle-fill' };
    if (g === 'Moderado') return { texto, color: '#92400e', bg: '#fef3c7', icono: 'bi-exclamation-triangle-fill' };
    if (g === 'Grave') return { texto, color: '#991b1b', bg: '#fee2e2', icono: 'bi-x-octagon-fill' };
    return { texto, color: '#475569', bg: '#f1f5f9', icono: 'bi-question-circle' };
  };

  const actualizarEstado = async (nuevoEstado: string) => {
    if (!incidente) return;

    const estadoAnterior = incidente.estado;
    setIncidente({ ...incidente, estado: nuevoEstado });

    try {
      const response = await fetch(`${API_URL}/incidentes/${incidente.id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-funcionario-id': funcionarioId || 'FUN-3002'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.incidente) {
          setIncidente((actual: any) => ({ ...actual, ...data.incidente }));
        }
        return;
      }

      const err = await response.json().catch(() => null);
      setIncidente((actual: any) => ({ ...actual, estado: estadoAnterior }));
      alert(err?.error || 'Error al actualizar estado');
    } catch {
      setIncidente((actual: any) => ({ ...actual, estado: estadoAnterior }));
      alert('Error de conexion');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', textAlign: 'center' }}>
        <i className="bi bi-arrow-repeat" style={{ fontSize: 24, animation: 'spin 0.9s linear infinite' }} />
        <p style={{ marginTop: 12, color: '#64748b' }}>Cargando incidente...</p>
      </div>
    );
  }

  if (!incidente) {
    return (
      <div style={{ padding: '28px 32px' }}>
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
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Incidente no encontrado</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px' }}>

      {/* Banner exito seguimiento */}
      {mensajeExito && (
        <div style={{
          marginBottom: 24,
          padding: '16px 20px',
          borderRadius: 10,
          border: '1px solid #16a34a',
          background: '#dcfce7',
          color: '#15803d',
          fontSize: 14,
          fontWeight: 500,
        }}>
          Seguimiento registrado correctamente
        </div>
      )}

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

      {/* Encabezado */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
          Seguimiento de Incidente
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
          Fecha: {formatearFecha(incidente.fecha)}
        </p>
      </div>

      {/* Detalle para seguimiento */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        padding: '24px 28px'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
          Detalle del Incidente
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Participantes</div>
            {incidente.participantes?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {incidente.participantes.map((p: any, i: number) => (
                  <div key={i} style={{ fontSize: 14, color: '#0f172a' }}>
                    {nombreAlumno(p)}
                    <span style={{ fontSize: 12, color: '#64748b', marginLeft: 6 }}>
                      ({p.rolEnIncidente})
                    </span>
                    {p.curso && (
                      <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 6 }}>
                        - {p.curso}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 14, color: '#0f172a' }}>No especificado</div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Funcionario Responsable</div>
            <div style={{ fontSize: 14, color: '#0f172a' }}>
              {nombreFuncionario(incidente)}
            </div>
            {incidente.funcionarioResponsable?.rol && (
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                {incidente.funcionarioResponsable.rol}
              </div>
            )}
          </div>
        </div>

        {/* Confirmacion para continuar */}
        <div style={{
          background: '#f8fafc',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="bi bi-info-circle" style={{ color: '#3b82f6', fontSize: 18 }} />
            <span style={{ fontSize: 14, color: '#475569' }}>
              El seguimiento quedara asociado al incidente <strong>{incidente.id}</strong>.
            </span>
          </div>
          <button
            onClick={() => router.push(`/seguimiento/${incidente.id}/registrar`)}
            style={{
              padding: '10px 20px',
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <i className="bi bi-plus-circle" />
            Registrar accion de seguimiento
          </button>
        </div>
      </div>

      {/* Cambiar gravedad */}
      {mensajeGravedad && (
        <div style={{
          marginTop: 24,
          padding: '16px 20px',
          borderRadius: 10,
          border: '1px solid',
          background: mensajeGravedad.tipo === 'success' ? '#dcfce7' : '#fee2e2',
          borderColor: mensajeGravedad.tipo === 'success' ? '#16a34a' : '#dc2626',
          color: mensajeGravedad.tipo === 'success' ? '#15803d' : '#991b1b',
          fontSize: 14,
          fontWeight: 500,
        }}>
          {mensajeGravedad.texto}
        </div>
      )}
      <div style={{ marginTop: 24, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Cambiar gravedad:</span>
        <select
          value={incidente.gravedad}
          onChange={(e) => setIncidente({ ...incidente, gravedad: e.target.value })}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', color: '#0f172a' }}
        >
          <option value="Leve">Leve</option>
          <option value="Moderado">Moderado</option>
          <option value="Grave">Grave</option>
        </select>
        <button
          onClick={async () => {
            try {
              const response = await fetch(`${API_URL}/incidentes/${incidente.id}/gravedad`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-funcionario-id': 'FUN-3002' },
                body: JSON.stringify({ gravedad: incidente.gravedad })
              });
              if (response.ok) {
                setMensajeGravedad({ tipo: 'success', texto: 'Gravedad actualizada correctamente' });
              } else {
                setMensajeGravedad({ tipo: 'error', texto: 'Error al actualizar la gravedad' });
              }
            } catch {
              setMensajeGravedad({ tipo: 'error', texto: 'Error de conexion' });
            }
            setTimeout(() => setMensajeGravedad(null), 3000);
          }}
          style={{ padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Guardar cambio
        </button>
      </div>

      {(() => {
        const protocolo = obtenerProtocolo(incidente.gravedad);
        if (!protocolo) return null;
        return (
          <div style={{ marginTop: 24, background: protocolo.bg, borderRadius: 12, border: `1px solid ${protocolo.color}33`, padding: '24px 28px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: protocolo.color, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className={`bi ${protocolo.icono}`} />
              Protocolo asociado
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: protocolo.color, fontWeight: 500 }}>
              {protocolo.texto}
            </p>
          </div>
        );
      })()}

      {/* Resumen del incidente */}
      <div style={{ marginTop: 24, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#4338ca', letterSpacing: '0.5px', textTransform: 'uppercase' as const }}>
              INCIDENTE · {formatearFecha(incidente.fecha)}
            </p>
            <h2 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
              {incidente.titulo}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
              {incidente.participantes?.map((p: any, i: number) => (
                <span key={i} style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
                  {nombreAlumno(p)}
                  {p.curso && (
                    <span style={{ fontWeight: 400, color: '#64748b', marginLeft: 6 }}>{p.curso}</span>
                  )}
                  {p.rolEnIncidente && (() => {
                    const rolColores: Record<string, { bg: string; color: string }> = {
                      'Agresor': { bg: '#fee2e2', color: '#991b1b' },
                      'Victima': { bg: '#dbeafe', color: '#1e40af' },
                      'Víctima': { bg: '#dbeafe', color: '#1e40af' },
                      'Testigo': { bg: '#f3e8ff', color: '#6b21a8' },
                      'Denunciante': { bg: '#fef3c7', color: '#92400e' },
                    };
                    const r = rolColores[p.rolEnIncidente] || { bg: '#f1f5f9', color: '#475569' };
                    return (
                      <span style={{
                        marginLeft: 6,
                        padding: '1px 8px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        background: r.bg,
                        color: r.color
                      }}>
                        {p.rolEnIncidente}
                      </span>
                    );
                  })()}
                  {i < incidente.participantes.length - 1 && <span style={{ color: '#cbd5e1', marginLeft: 4 }}>·</span>}
                </span>
              ))}
              {(() => {
                const gravedadColores: Record<string, { bg: string; color: string }> = {
                  'Leve': { bg: '#dcfce7', color: '#15803d' },
                  'Moderado': { bg: '#fef3c7', color: '#92400e' },
                  'Grave': { bg: '#fee2e2', color: '#991b1b' },
                };
                const g = gravedadColores[incidente.gravedad] || { bg: '#e2e8f0', color: '#475569' };
                return (
                  <span style={{
                    padding: '3px 12px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    background: g.bg,
                    color: g.color
                  }}>
                    {incidente.gravedad}
                  </span>
                );
              })()}
            </div>
          </div>
          <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
              Estado actual
            </label>
            {(() => {
              const estadoColores: Record<string, { bg: string; color: string }> = {
                'Abierto': { bg: '#dbeafe', color: '#1e40af' },
                'En seguimiento': { bg: '#e9d5ff', color: '#7c3aed' },
                'Cerrado': { bg: '#e2e8f0', color: '#475569' },
              };
              const estilo = estadoColores[incidente.estado] || { bg: '#fff', color: '#0f172a' };
              return (
                <select
                  value={incidente.estado}
                  onChange={(e) => actualizarEstado(e.target.value)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 10,
                    border: '1.5px solid #e2e8f0',
                    fontSize: 16,
                    fontFamily: 'inherit',
                    color: estilo.color,
                    fontWeight: 600,
                    background: estilo.bg,
                    cursor: 'pointer',
                    minWidth: 220
                  }}
                >
                  <option value="Abierto">Abierto</option>
                  <option value="En seguimiento">En seguimiento</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              );
            })()}
          </div>
        </div>

        {incidente.descripcion && (
          <div style={{
            marginTop: 16,
            padding: '14px 20px',
            background: '#f8fafc',
            borderRadius: 10,
            borderLeft: '3px solid #e2e8f0',
            fontSize: 14,
            color: '#475569',
            lineHeight: 1.6
          }}>
            {incidente.descripcion}
          </div>
        )}
      </div>

      {/* Línea de tiempo del caso */}
      <div style={{ marginTop: 24, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="bi bi-card-checklist" style={{ color: '#4338ca', fontSize: 18 }} />
            Linea de tiempo del caso
          </h3>
          {seguimientos.length > 0 && (
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
              {seguimientos.length} {seguimientos.length === 1 ? 'accion' : 'acciones'}
            </span>
          )}
        </div>

        {loadingSeguimientos ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: 20, animation: 'spin 0.9s linear infinite' }} />
            <p style={{ marginTop: 8, fontSize: 13 }}>Cargando seguimientos...</p>
          </div>
        ) : seguimientos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
            <i className="bi bi-journal-text" style={{ fontSize: 28 }} />
            <p style={{ marginTop: 8, fontSize: 14 }}>No hay acciones de seguimiento registradas aun.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[...seguimientos].reverse().map((seg: any, idx: number) => (
              <div key={seg.id || idx} style={{ display: 'flex', gap: 16, paddingBottom: idx < seguimientos.length - 1 ? 28 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6 }}>
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: idx === 0 ? '#4338ca' : '#1e3a5f',
                    flexShrink: 0,
                    boxShadow: idx === 0 ? '0 0 0 4px #c7d2fe' : 'none'
                  }} />
                  {idx < seguimientos.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: '#e2e8f0', marginTop: 6 }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                      {seg.accion}
                    </span>
                    <span style={{ fontSize: 13, color: '#94a3b8', flexShrink: 0, marginLeft: 12 }}>
                      {formatearFecha(seg.fecha)}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#4338ca', fontWeight: 500, marginBottom: 6 }}>
                    {nombreFuncionario(seg)}
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                    {seg.descripcion}
                  </p>
                  {seg.evolucionCaso && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
                      Evolucion: {seg.evolucionCaso}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}