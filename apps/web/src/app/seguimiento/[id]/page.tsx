'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PageProps {
  params: { id: string };
}

export default function SeguimientoIncidentePage({ params }: PageProps) {
  const router = useRouter();
  const [incidente, setIncidente] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarIncidente = async () => {
      try {
        const response = await fetch(`${API_URL}/incidentes/${params.id}`);
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
  }, [params.id]);

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
          ID: {incidente.id} • Fecha: {formatearFecha(incidente.fecha)}
        </p>
      </div>

      {/* Mensaje en desarrollo */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        padding: 60,
        textAlign: 'center'
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: '#fef3c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 40
        }}>
          <i className="bi bi-tools" style={{ color: '#92400e' }} />
        </div>
        <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
          Funcionalidad en Desarrollo
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          A agarrar la pala Rogelios 🪏😈
        </p>
      </div>

      {/* Información básica del incidente */}
      <div style={{ marginTop: 24, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '24px 28px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
          Información del Incidente
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Título</div>
            <div style={{ fontSize: 14, color: '#0f172a' }}>{incidente.titulo}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Gravedad</div>
            <div style={{ fontSize: 14, color: '#0f172a' }}>{incidente.gravedad}</div>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Descripción</div>
            <div style={{ fontSize: 14, color: '#0f172a' }}>{incidente.descripcion}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Estado</div>
            <div style={{ fontSize: 14, color: '#0f172a' }}>{incidente.estado}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Funcionario Responsable</div>
            <div style={{ fontSize: 14, color: '#0f172a' }}>{incidente.funcionarioResponsableId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
