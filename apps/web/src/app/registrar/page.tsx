'use client';

import { useState,useEffect, FormEvent } from 'react';
import Field from '@/components/Field';
import Btn from '@/components/Btn';
import { SESSION_STORAGE_KEY, SesionUsuario } from '@/components/AuthShell';

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

const obtenerFechaLocalISO = () => {
  const fecha = new Date();
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
};

interface FormData {
  titulo: string;
  fecha: string;
  descripcion: string;
  gravedad: string;
}

interface Participante {
  alumnoInstitucionalId: string;
  rolEnIncidente: string;
  observacion: string;
}

interface Mensaje {
  tipo: 'success' | 'error';
  texto: string;
}

export default function RegistrarPage() {
  const [form, setForm] = useState<FormData>({
    titulo: '',
    fecha: '',
    descripcion: '',
    gravedad: ''
  });
  const [sesion, setSesion] = useState<SesionUsuario | null>(null);
  const fechaMaxima = obtenerFechaLocalISO();

  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [nuevoParticipante, setNuevoParticipante] = useState({
    alumnoId: '',
    rol: '',
    observacion: ''
  });
  const [protocolos, setProtocolos] = useState<Record<string, string>>({});

  useEffect(() => {
  fetch(`${API_URL}/institucional/protocolos`)
    .then(r => r.json())
    .then(data => { if (data.ok) setProtocolos(data.data) })
    .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const sesionGuardada = window.localStorage.getItem(SESSION_STORAGE_KEY);
      setSesion(sesionGuardada ? JSON.parse(sesionGuardada) : null);
    } catch {
      setSesion(null);
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const set = (k: keyof FormData, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const agregarParticipante = () => {
    if (!nuevoParticipante.alumnoId.trim()) {
      alert('Debe ingresar el ID del alumno');
      return;
    }

    if (!nuevoParticipante.rol) {
      alert('Debe seleccionar el rol');
      return;
    }

    setParticipantes([
      ...participantes,
      {
        alumnoInstitucionalId: nuevoParticipante.alumnoId,
        rolEnIncidente: nuevoParticipante.rol,
        observacion: nuevoParticipante.observacion
      }
    ]);

    setNuevoParticipante({
      alumnoId: '',
      rol: '',
      observacion: ''
    });
  };

  const eliminarParticipante = (index: number) => {
    setParticipantes(participantes.filter((_, i) => i !== index));
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!form.titulo.trim()) nuevosErrores.titulo = 'Campo requerido';
    if (!form.fecha) nuevosErrores.fecha = 'Campo requerido';
    if (form.fecha && form.fecha > fechaMaxima) nuevosErrores.fecha = 'La fecha no puede estar en el futuro';
    if (!form.descripcion.trim()) nuevosErrores.descripcion = 'Campo requerido';
    if (!form.gravedad) nuevosErrores.gravedad = 'Campo requerido';
    if (!sesion?.funcionario?.id) nuevosErrores.funcionario = 'No se pudo obtener el funcionario de la sesion';
    if (participantes.length === 0) nuevosErrores.participantes = 'Debe agregar participantes';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const limpiarFormulario = () => {
    setForm({
      titulo: '',
      fecha: '',
      descripcion: '',
      gravedad: ''
    });

    setParticipantes([]);
    setErrores({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/incidentes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: form.titulo,
          fecha: form.fecha,
          descripcion: form.descripcion,
          gravedad: form.gravedad,
          funcionarioResponsableId: sesion?.funcionario.id,
          participantes
        })
      });

      const resultado = await response.json();

      if (resultado.ok) {
        setMensaje({
          tipo: 'success',
          texto: 'Incidente registrado correctamente'
        });

        limpiarFormulario();
      } else {
        setMensaje({
          tipo: 'error',
          texto: resultado.mensaje
        });
      }
    } catch {
      setMensaje({
        tipo: 'error',
        texto: 'Error de conexión'
      });
    } finally {
      setLoading(false);
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

  return (
      <div style={{ padding: '28px 32px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Registrar Incidencia</h1>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b' }}>Complete los campos para registrar un nuevo incidente</p>
  
        {mensaje && (
          <div
            style={{
              marginBottom: 24,
              padding: '16px 20px',
              borderRadius: 10,
              border: '1px solid',
              background: mensaje.tipo === 'success' ? '#dcfce7' : '#fee2e2',
              borderColor: mensaje.tipo === 'success' ? '#16a34a' : '#dc2626',
              color: mensaje.tipo === 'success' ? '#15803d' : '#991b1b',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {mensaje.texto}
          </div>
        )}
  
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '28px', maxWidth: 840 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field label="Título del incidente" required>
                <input
                  style={{ ...fld, borderColor: errores.titulo ? '#dc2626' : '#e2e8f0' }}
                  value={form.titulo}
                  onChange={e => set('titulo', e.target.value)}
                  placeholder="Ej: Conflicto en el recreo"
                />
                {errores.titulo && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errores.titulo}</span>}
              </Field>
  
              <Field label="Fecha del incidente" required>
                <input
                  style={{ ...fld, borderColor: errores.fecha ? '#dc2626' : '#e2e8f0' }}
                  type="date"
                  value={form.fecha}
                  max={fechaMaxima}
                  onChange={e => set('fecha', e.target.value)}
                />
                {errores.fecha && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errores.fecha}</span>}
              </Field>
  
              <div style={{ gridColumn: '1/-1' }}>
                <Field label="Descripción del incidente" required>
                  <textarea
                    style={{ ...fld, minHeight: 110, resize: 'vertical', borderColor: errores.descripcion ? '#dc2626' : '#e2e8f0' }}
                    value={form.descripcion}
                    onChange={e => set('descripcion', e.target.value)}
                    placeholder="Describa detalladamente lo ocurrido..."
                  />
                  {errores.descripcion && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errores.descripcion}</span>}
                </Field>
              </div>
  
              <Field label="Nivel de gravedad" required>
                <select
                  style={{ ...fld, borderColor: errores.gravedad ? '#dc2626' : '#e2e8f0' }}
                  value={form.gravedad}
                  onChange={e => set('gravedad', e.target.value)}
                >
                  <option value="">— Seleccionar —</option>
                  <option>Leve</option>
                  <option>Moderado</option>
                  <option>Grave</option>
                </select>
                {errores.gravedad && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errores.gravedad}</span>}
                {form.gravedad && (() => {
                  const protocolo = obtenerProtocolo(form.gravedad);
                  if (!protocolo) return null;
                  return (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: protocolo.bg, borderRadius: 6, border: `1px solid ${protocolo.color}33`, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className={`bi ${protocolo.icono}`} style={{ fontSize: 12, color: protocolo.color }} />
                      <span style={{ fontSize: 12, color: protocolo.color, fontWeight: 500 }}>{protocolo.texto}</span>
                    </div>
                  );
                })()}
              </Field>
              <Field label="Funcionario responsable" required>
                <input
                  style={{ ...fld, borderColor: errores.funcionario ? '#dc2626' : '#e2e8f0', background: '#f8fafc', color: '#475569' }}
                  value={sesion?.funcionario.nombre || ''}
                  readOnly
                  placeholder="Funcionario de la sesion"
                />
                {errores.funcionario && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errores.funcionario}</span>}
                {sesion?.funcionario.id && (
                  <span style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Se registrara con el usuario que inicio sesion</span>
                )}
              </Field>
            </div>
  
            {/* Sección de Participantes */}
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
                Participantes del incidente <span style={{ color: '#dc2626' }}>*</span>
              </h3>
  
              {/* Lista de participantes agregados */}
              {participantes.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {participantes.map((p, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: '#f8fafc',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                            {p.alumnoInstitucionalId}
                          </div>
                          <div style={{ fontSize: 13, color: '#64748b' }}>
                            Rol: <span style={{ fontWeight: 500, color: '#475569' }}>{p.rolEnIncidente}</span>
                            {p.observacion && ` • ${p.observacion}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => eliminarParticipante(index)}
                          style={{
                            padding: '6px 12px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 600,
                            fontFamily: 'inherit'
                          }}
                        >
                          <i className="bi bi-trash" /> Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
              {/* Formulario para agregar participante */}
              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>
                  Agregar participante
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="ID Alumno">
                    <input
                      style={fld}
                      value={nuevoParticipante.alumnoId}
                      onChange={e => setNuevoParticipante({ ...nuevoParticipante, alumnoId: e.target.value })}
                      placeholder="Ej: ALU-1001"
                    />
                    <span style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>IDs de prueba: ALU-1001, ALU-1002, ALU-1003</span>
                  </Field>
                  <Field label="Rol en el incidente">
                    <select
                      style={fld}
                      value={nuevoParticipante.rol}
                      onChange={e => setNuevoParticipante({ ...nuevoParticipante, rol: e.target.value })}
                    >
                      <option value="">— Seleccionar —</option>
                      <option>Agresor</option>
                      <option>Victima</option>
                      <option>Testigo</option>
                      <option>Involucrado</option>
                    </select>
                  </Field>
                  <div style={{ gridColumn: '1/-1' }}>
                    <Field label="Observación (opcional)">
                      <input
                        style={fld}
                        value={nuevoParticipante.observacion}
                        onChange={e => setNuevoParticipante({ ...nuevoParticipante, observacion: e.target.value })}
                        placeholder="Detalles adicionales sobre este participante..."
                      />
                    </Field>
                  </div>
                </div>
                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                  <Btn type="button" variant="secondary" onClick={agregarParticipante}>
                    <i className="bi bi-plus-circle" /> Agregar participante
                  </Btn>
                </div>
              </div>
  
              {errores.participantes && (
                <span style={{ fontSize: 12, color: '#dc2626', marginTop: 8, display: 'block' }}>
                  {errores.participantes}
                </span>
              )}
            </div>
  
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Btn type="button" variant="ghost" onClick={limpiarFormulario}>Limpiar formulario</Btn>
              <Btn type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <i className="bi bi-arrow-repeat" style={{ animation: 'spin 0.9s linear infinite' }} />
                    Registrando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg" />
                    Registrar incidencia
                  </>
                )}
              </Btn>
            </div>
          </form>
        </div>
      </div>          
    );
}
