'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { nombresAlumnos, nombreFuncionario } from '@/lib/displayNames';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

export default function SeguimientoPage() {
  const router = useRouter();
  const [incidentes, setIncidentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursos, setCursos] = useState<string[]>([]);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroGravedad, setFiltroGravedad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCurso, setFiltroCurso] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [incRes, cursosRes] = await Promise.all([
          fetch(`${API_URL}/incidentes`),
          fetch(`${API_URL}/institucional/cursos`)
        ]);

        const incData = await incRes.json();
        if (incData.ok) setIncidentes(incData.data || []);

        const cursosData = await cursosRes.json();
        if (cursosData.ok) setCursos(cursosData.data || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const formatearFecha = (fecha: string) => {
    try {
      if (!fecha) return 'Sin fecha';
      if (fecha.includes('/')) return fecha;
      let fechaSolo = fecha;
      if (fecha.includes('T')) fechaSolo = fecha.split('T')[0];
      const [year, month, day] = fechaSolo.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return fecha;
    }
  };

  const incidentesFiltrados = incidentes.filter(inc => {
    const terminoBusqueda = busqueda.toLowerCase();

    const coincideBusqueda = !busqueda ||
      inc.titulo?.toLowerCase().includes(terminoBusqueda) ||
      inc.descripcion?.toLowerCase().includes(terminoBusqueda) ||
      inc.id?.toLowerCase().includes(terminoBusqueda) ||
      inc.participantes?.some((p: any) =>
        p.nombreAlumno?.toLowerCase().includes(terminoBusqueda) ||
        p.alumnoInstitucionalId?.toLowerCase().includes(terminoBusqueda)
      );

    const coincideGravedad = !filtroGravedad || inc.gravedad === filtroGravedad;
    const coincideEstado = !filtroEstado || inc.estado === filtroEstado;
    const coincideCurso = !filtroCurso ||
      inc.participantes?.some((p: any) => p.curso === filtroCurso);

    return coincideBusqueda && coincideGravedad && coincideEstado && coincideCurso;
  });

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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
          Seguimiento de Casos
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
          Seleccione un incidente para gestionar su seguimiento
        </p>
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
            Buscar
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

      {/* Resultados y limpiar filtros */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
          {incidentesFiltrados.length} de {incidentes.length} incidentes
        </p>
        {(busqueda || filtroGravedad || filtroEstado || filtroCurso) && (
          <button
            onClick={() => {
              setBusqueda('');
              setFiltroGravedad('');
              setFiltroEstado('');
              setFiltroCurso('');
            }}
            style={{
              padding: '6px 14px',
              background: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <i className="bi bi-x-circle" /> Limpiar filtros
          </button>
        )}
      </div>

      {loading ? (
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
          <i className="bi bi-search" style={{ fontSize: 32 }} />
          <p style={{ marginTop: 12 }}>
            {incidentes.length === 0 ? 'No hay incidentes registrados' : 'No se encontraron incidentes con los filtros aplicados'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {incidentesFiltrados.map(incidente => {
            const gStyle = gravedadMap[incidente.gravedad] || { bg: '#e2e8f0', color: '#475569', label: incidente.gravedad };
            const eStyle = estadoMap[incidente.estado] || { bg: '#e2e8f0', color: '#475569' };

            const participantes = incidente.participantes || [];
            const nombresParticipantes = nombresAlumnos(participantes);

            return (
              <div
                key={incidente.id}
                onClick={() => router.push(`/seguimiento/${incidente.id}`)}
                style={{
                  background: '#fff',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s, box-shadow 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>
                      {incidente.titulo}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      {formatearFecha(incidente.fecha)} - ID: {incidente.id}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: gStyle.bg,
                      color: gStyle.color
                    }}>
                      {gStyle.label}
                    </span>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: eStyle.bg,
                      color: eStyle.color
                    }}>
                      {incidente.estado}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 13, color: '#475569', marginBottom: 8, lineHeight: 1.4 }}>
                  {incidente.descripcion?.length > 120
                    ? incidente.descripcion.substring(0, 120) + '...'
                    : incidente.descripcion}
                </div>

                <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#64748b' }}>
                  <span>
                    <i className="bi bi-people" style={{ marginRight: 4 }} />
                    {nombresParticipantes}
                  </span>
                  <span>
                    <i className="bi bi-person-badge" style={{ marginRight: 4 }} />
                    {nombreFuncionario(incidente)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
