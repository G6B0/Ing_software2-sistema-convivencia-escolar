'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Btn from '@/components/Btn';
import { nombreAlumno, nombreFuncionario } from '@/lib/displayNames';
import { apiFetch } from '@/lib/api';
import { useSessionPermissions } from '@/hooks/useSessionPermissions';
import { PERMISSIONS } from '@/lib/permissions';

const fld = {
  padding: '9px 12px',
  borderRadius: 8,
  border: '1.5px solid #e2e8f0',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  color: '#0f172a',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box' as const
};

export default function IncidenciasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [incidentes, setIncidentes] = useState<any[]>([]);
  const [loadingIncidentes, setLoadingIncidentes] = useState(false);
  const [cursos, setCursos] = useState<string[]>([]);
  const permisos = useSessionPermissions();
  const puedeRegistrar = permisos.includes(PERMISSIONS.REGISTER_INCIDENTS);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroGravedad, setFiltroGravedad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAnio, setFiltroAnio] = useState('');

  // Sincronizar filtros desde query params al montar y cuando cambien
  useEffect(() => {
    setFiltroGravedad(searchParams.get('gravedad') || '');
    setFiltroEstado(searchParams.get('estado') || '');
    setFiltroMes(searchParams.get('mes') || '');
    setFiltroAnio(searchParams.get('anio') || '');
    setFiltroCurso(searchParams.get('curso') || '');
  }, [searchParams]);

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

  useEffect(() => {
    const cargarDatos = async () => {
      setLoadingIncidentes(true);
      try {
        const [incRes, cursosRes] = await Promise.all([
          apiFetch('/incidentes'),
          apiFetch('/institucional/cursos')
        ]);

        const incData = await incRes.json();
        if (incData.ok) setIncidentes(incData.data || []);

        const cursosData = await cursosRes.json();
        if (cursosData.ok) setCursos(cursosData.data || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoadingIncidentes(false);
      }
    };

    cargarDatos();
  }, []);

  const incidentesFiltrados = incidentes.filter(inc => {
    const termino = busqueda.toLowerCase();

    const coincideBusqueda = !busqueda ||
      inc.titulo?.toLowerCase().includes(termino) ||
      inc.descripcion?.toLowerCase().includes(termino) ||
      inc.id?.toLowerCase().includes(termino) ||
      inc.participantes?.some((p: any) =>
        p.nombreAlumno?.toLowerCase().includes(termino) ||
        p.alumnoInstitucionalId?.toLowerCase().includes(termino)
      );

    const coincideGravedad = !filtroGravedad || inc.gravedad === filtroGravedad;
    const coincideEstado = !filtroEstado || inc.estado === filtroEstado;
    const coincideCurso = !filtroCurso ||
      inc.participantes?.some((p: any) => p.curso === filtroCurso);

    let coincideFecha = true;
    if (filtroMes || filtroAnio) {
      const fecha = new Date(inc.fecha);
      if (filtroMes) coincideFecha = coincideFecha && (fecha.getMonth() + 1) === Number(filtroMes);
      if (filtroAnio) coincideFecha = coincideFecha && fecha.getFullYear() === Number(filtroAnio);
    }

    return coincideBusqueda && coincideGravedad && coincideEstado && coincideCurso && coincideFecha;
  });

  const handleIncidenteClick = (incidente: any) => {
    router.push(`/seguimiento/${incidente.id}`);
  };

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

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Incidencias</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            {incidentesFiltrados.length} de {incidentes.length} registros
          </p>
        </div>
        {puedeRegistrar && (
          <Btn onClick={() => router.push('/registrar')}>
            <i className="bi bi-plus-lg" /> Registrar incidencia
          </Btn>
        )}
      </div>

      {/* Filtros */}
      <div style={{
        background: '#fff',
        padding: '20px 24px',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        marginBottom: 16,
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: 16
      }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
            Buscar alumno o tipo
          </label>
          <input
            style={fld}
            placeholder="Nombre alumno, titulo, ID..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
            Gravedad
          </label>
          <select style={fld} value={filtroGravedad} onChange={e => setFiltroGravedad(e.target.value)}>
            <option value="">Todas</option>
            <option value="Leve">Leve</option>
            <option value="Moderado">Moderado</option>
            <option value="Grave">Grave</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
            Estado
          </label>
          <select style={fld} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="Abierto">Abierto</option>
            <option value="En seguimiento">En seguimiento</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
            Curso
          </label>
          <select style={fld} value={filtroCurso} onChange={e => setFiltroCurso(e.target.value)}>
            <option value="">Todos</option>
            {cursos.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de incidentes */}
      {loadingIncidentes ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <i className="bi bi-arrow-repeat" style={{ fontSize: 24, animation: 'spin 0.9s linear infinite' }} />
          <p style={{ marginTop: 12 }}>Cargando incidentes...</p>
        </div>
      ) : incidentesFiltrados.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          padding: 40,
          textAlign: 'center',
          color: '#64748b'
        }}>
          <i className="bi bi-inbox" style={{ fontSize: 32 }} />
          <p style={{ marginTop: 12 }}>
            {incidentes.length === 0 ? 'No hay incidentes registrados' : 'No se encontraron incidentes con los filtros aplicados'}
          </p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1200 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 100 }}>FECHA</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 180 }}>ALUMNO</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 150 }}>TIPO DE INCIDENCIA</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 250 }}>DESCRIPCION</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 120 }}>GRAVEDAD</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 140 }}>ESTADO</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 150 }}>REGISTRADO POR</th>
              </tr>
            </thead>
            <tbody>
              {incidentesFiltrados.map((incidente) => {
                const gravedadStyle = gravedadMap[incidente.gravedad] || { bg: '#e2e8f0', color: '#475569', label: incidente.gravedad };
                const estadoStyle = estadoMap[incidente.estado] || { bg: '#e2e8f0', color: '#475569' };

                return (
                  <tr
                    key={incidente.id}
                    onClick={() => handleIncidenteClick(incidente)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '16px', fontSize: 14, color: '#0f172a' }}>
                      {formatearFecha(incidente.fecha)}
                    </td>
                    <td
                      style={{ padding: '16px', fontSize: 14, fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const alumnoId = incidente.participantes?.[0]?.alumnoInstitucionalId;
                        if (alumnoId) {
                          router.push(`/alumnos/${alumnoId}`);
                        }
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {incidente.participantes?.[0] ? nombreAlumno(incidente.participantes[0]) : 'N/A'}
                    </td>
                    <td style={{ padding: '16px', fontSize: 14, color: '#0f172a' }}>
                      {incidente.titulo}
                    </td>
                    <td style={{ padding: '16px', fontSize: 14, color: '#475569' }}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 280
                      }}>
                        {incidente.descripcion}
                      </div>
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
                    <td style={{ padding: '16px', fontSize: 14, color: '#0f172a' }}>
                      {nombreFuncionario(incidente)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Vista de Cards (alternativa) */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
          Vista de Tarjetas
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b' }}>
          Formato alternativo de visualizacion
        </p>

        {loadingIncidentes ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: 24, animation: 'spin 0.9s linear infinite' }} />
            <p style={{ marginTop: 12 }}>Cargando incidentes...</p>
          </div>
        ) : incidentesFiltrados.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: 40,
            textAlign: 'center',
            color: '#64748b'
          }}>
            <i className="bi bi-inbox" style={{ fontSize: 32 }} />
            <p style={{ marginTop: 12 }}>No hay incidentes para mostrar</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {incidentesFiltrados.map((incidente) => {
              const gravedadStyle = gravedadMap[incidente.gravedad] || { bg: '#e2e8f0', color: '#475569', label: incidente.gravedad };
              const estadoStyle = estadoMap[incidente.estado] || { bg: '#e2e8f0', color: '#475569' };

              return (
                <div
                  key={incidente.id}
                  onClick={() => handleIncidenteClick(incidente)}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    padding: '20px 24px',
                    transition: 'box-shadow 0.2s, background-color 0.15s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
                        {incidente.titulo}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                        ID: {incidente.id}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: gravedadStyle.bg,
                        color: gravedadStyle.color
                      }}>
                        {gravedadStyle.label}
                      </span>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: estadoStyle.bg,
                        color: estadoStyle.color
                      }}>
                        {incidente.estado}
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: '12px 0', fontSize: 14, color: '#475569', lineHeight: 1.5 }}>
                    {incidente.descripcion}
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 16,
                    paddingTop: 12,
                    borderTop: '1px solid #f1f5f9',
                    fontSize: 13
                  }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Fecha: </span>
                      <span style={{ color: '#0f172a', fontWeight: 500 }}>
                        {formatearFecha(incidente.fecha)}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Responsable: </span>
                      <span style={{ color: '#0f172a', fontWeight: 500 }}>
                        {nombreFuncionario(incidente)}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Participantes: </span>
                      <span style={{ color: '#0f172a', fontWeight: 500 }}>
                        {incidente.participantes?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
