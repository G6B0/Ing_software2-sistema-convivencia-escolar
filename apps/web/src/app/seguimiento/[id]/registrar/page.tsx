'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function RegistrarSeguimientoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const incidenteId = params.id;

  // Estados del formulario (La "memoria")
  const [descripcion, setDescripcion] = useState('');
  const [accion, setAccion] = useState('');
  const [evolucionCaso, setEvolucionCaso] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]); // Fecha de hoy por defecto
  
  // Estado para los errores (El "guardia de seguridad visual")
  const [errores, setErrores] = useState<{ general?: string; descripcion?: string; accion?: string; evolucionCaso?: string; fecha?: string }>({});
  const [enviando, setEnviando] = useState(false);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TEST 1 y 2: Validar campos obligatorios antes de enviar (Frontend)
    const nuevosErrores: any = {};
    if (!descripcion.trim()) nuevosErrores.descripcion = "La descripción es obligatoria.";
    if (!accion.trim()) nuevosErrores.accion = "Debes indicar una acción.";
    if (!evolucionCaso.trim()) nuevosErrores.evolucionCaso = "La evolución del caso es obligatoria.";
    if (!fecha) nuevosErrores.fecha = "La fecha es obligatoria.";

    // Si hay errores, detenemos el envío y mostramos los mensajes
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // Si todo está bien, limpiamos errores e intentamos guardar
    setErrores({});
    setEnviando(true);

    try {
      const response = await fetch(`${API_URL}/incidentes/${incidenteId}/seguimientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-funcionario-id': 'FUN-3003' // ID duro por ahora para la prueba
        },
        body: JSON.stringify({
          descripcion,
          accion,
          evolucionCaso,
          fecha: new Date(fecha).toISOString(),
          documentoAsociado: null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // TEST 3 y 4: El servidor rechazó (ej. Incidente no existe). Mostramos error y NO agregamos al historial.
        setErrores({ general: data.error || data.mensaje || 'Error al registrar el seguimiento en el servidor.' });
        return;
      }

      // ÉXITO: Volvemos a la pantalla del incidente
      alert('Seguimiento guardado con éxito');
      router.push(`/seguimiento/${incidenteId}`);

    } catch (error) {
      setErrores({ general: 'Error de conexión con el servidor. Intenta nuevamente.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: '600px', margin: '0 auto' }}>
      <button
        onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer', marginBottom: 24, padding: 0 }}
      >
        <i className="bi bi-arrow-left" /> Volver
      </button>

      <h1 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
        Registrar Seguimiento
      </h1>

      {/* Mensaje de error general (Test 3) */}
      {errores.general && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 8 }}/>
          {errores.general}
        </div>
      )}

      <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Campo Acción */}
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>Acción Realizada</label>
          <input 
            type="text" 
            value={accion} 
            onChange={(e) => setAccion(e.target.value)}
            placeholder="Ej: Llamada a apoderado"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${errores.accion ? '#ef4444' : '#e2e8f0'}` }}
          />
          {errores.accion && <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>{errores.accion}</span>}
        </div>

        {/* Campo Descripción */}
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>Descripción</label>
          <textarea 
            value={descripcion} 
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Detalles de la acción..."
            rows={3}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${errores.descripcion ? '#ef4444' : '#e2e8f0'}` }}
          />
          {errores.descripcion && <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>{errores.descripcion}</span>}
        </div>

        {/* Campo Evolución */}
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>Evolución del Caso</label>
          <textarea 
            value={evolucionCaso} 
            onChange={(e) => setEvolucionCaso(e.target.value)}
            placeholder="¿Cómo avanza el caso tras esta acción?"
            rows={2}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${errores.evolucionCaso ? '#ef4444' : '#e2e8f0'}` }}
          />
          {errores.evolucionCaso && <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>{errores.evolucionCaso}</span>}
        </div>

        {/* Campo Fecha */}
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>Fecha</label>
          <input 
            type="date" 
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${errores.fecha ? '#ef4444' : '#e2e8f0'}` }}
          />
          {errores.fecha && <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>{errores.fecha}</span>}
        </div>

        <button 
          type="submit" 
          disabled={enviando}
          style={{ marginTop: 8, padding: '12px 20px', background: enviando ? '#64748b' : '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: enviando ? 'not-allowed' : 'pointer' }}
        >
          {enviando ? 'Guardando...' : 'Guardar Seguimiento'}
        </button>
      </form>
    </div>
  );
}