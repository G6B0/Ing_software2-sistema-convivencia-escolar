'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
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

interface FormData {
  titulo: string;
  fecha: string;
  descripcion: string;
  gravedad: string;
  funcionarioId: string;
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

export default function IncidenciasPage() {
  const router = useRouter();
  const [funcionarioSesion, setFuncionarioSesion] = useState<SesionUsuario['funcionario'] | null>(null);

  // Estados para formulario
  const [form, setForm] = useState<FormData>({
    titulo: '',
    fecha: '',
    descripcion: '',
    gravedad: '',
    funcionarioId: ''
  });
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [nuevoParticipante, setNuevoParticipante] = useState({
    alumnoId: '',
    rol: '',
    observacion: ''
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Estados para lista
  const [incidentes, setIncidentes] = useState<any[]>([]);
  const [loadingIncidentes, setLoadingIncidentes] = useState(false);

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

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

  const agregarParticipante = () => {
    if (!nuevoParticipante.alumnoId.trim()) {
      alert('Debe ingresar el ID del alumno');
      return;
    }
    if (!nuevoParticipante.rol) {
      alert('Debe seleccionar el rol del alumno');
      return;
    }

    setParticipantes([...participantes, {
      alumnoInstitucionalId: nuevoParticipante.alumnoId,
      rolEnIncidente: nuevoParticipante.rol,
      observacion: nuevoParticipante.observacion
    }]);
    setNuevoParticipante({ alumnoId: '', rol: '', observacion: '' });
  };

  const eliminarParticipante = (index: number) => {
    setParticipantes(participantes.filter((_, i) => i !== index));
  };

  const cargarIncidentes = async () => {
    setLoadingIncidentes(true);
    try {
      const response = await fetch(`${API_URL}/incidentes`);

      if (!response.ok) {
        console.error('Error HTTP:', response.status, response.statusText);
        return;
      }

      const resultado = await response.json();

      if (resultado.ok) {
        setIncidentes(resultado.data || []);
      }
    } catch (error) {
      console.error('Error al cargar incidentes:', error);
    } finally {
      setLoadingIncidentes(false);
    }
  };

  useEffect(() => {
    try {
      const sesionGuardada = window.localStorage.getItem(SESSION_STORAGE_KEY);
      const sesion = sesionGuardada ? JSON.parse(sesionGuardada) as SesionUsuario : null;

      if (sesion?.funcionario) {
        setFuncionarioSesion(sesion.funcionario);
        setForm(f => ({ ...f, funcionarioId: sesion.funcionario.id }));
      }
    } catch {
      setFuncionarioSesion(null);
    }

    cargarIncidentes();
  }, []);

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!form.titulo.trim()) {
      nuevosErrores.titulo = 'Este campo es requerido';
    }

    if (!form.fecha) {
      nuevosErrores.fecha = 'Este campo es requerido';
    }

    if (!form.descripcion.trim()) {
      nuevosErrores.descripcion = 'Este campo es requerido';
    } else if (form.descripcion.length < 10) {
      nuevosErrores.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!form.gravedad) {
      nuevosErrores.gravedad = 'Este campo es requerido';
    }

    if (participantes.length === 0) {
      nuevosErrores.participantes = 'Debe agregar al menos un participante';
    }

    if (!form.funcionarioId.trim()) {
      nuevosErrores.funcionarioId = 'Este campo es requerido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const limpiarFormulario = () => {
    setForm({
      titulo: '',
      fecha: '',
      descripcion: '',
      gravedad: '',
      funcionarioId: funcionarioSesion?.id || ''
    });
    setParticipantes([]);
    setErrores({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/incidentes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: form.titulo,
          fecha: form.fecha,
          descripcion: form.descripcion,
          gravedad: form.gravedad,
          funcionarioResponsableId: form.funcionarioId,
          participantes: participantes,
        }),
      });

      const resultado = await response.json();

      if (resultado.ok) {
        setMensaje({
          tipo: 'success',
          texto: `Incidente registrado exitosamente con ID: ${resultado.data?.id}`,
        });
        limpiarFormulario();
        await cargarIncidentes();
      } else {
        setMensaje({
          tipo: 'error',
          texto: resultado.mensaje || 'Error al registrar el incidente',
        });
      }
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: 'Error de conexión con el servidor',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIncidenteClick = (incidente: any) => {
    router.push(`/seguimiento/${incidente.id}`);
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
            </Field>

            <Field label="ID Funcionario responsable" required>
              <input
                style={{ ...fld, borderColor: errores.funcionarioId ? '#dc2626' : '#e2e8f0' }}
                value={form.funcionarioId}
                readOnly
                placeholder="Funcionario autenticado"
              />
              {errores.funcionarioId && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errores.funcionarioId}</span>}
              <span style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                {funcionarioSesion ? `Sesion activa: ${funcionarioSesion.nombre} (${funcionarioSesion.rol})` : 'Debe iniciar sesion para asociar el funcionario responsable'}
              </span>
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

      {/* Lista de incidentes registrados */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
          Incidencias
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b' }}>
          {incidentes.length} registros encontrados
        </p>

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
              style={{ ...fld, width: '100%' }}
              placeholder="Buscar..."
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
              Gravedad
            </label>
            <select style={{ ...fld, width: '100%' }}>
              <option>Todas</option>
              <option>Leve</option>
              <option>Moderado</option>
              <option>Grave</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
              Estado
            </label>
            <select style={{ ...fld, width: '100%' }}>
              <option>Todos</option>
              <option>Abierto</option>
              <option>En seguimiento</option>
              <option>Cerrado</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
              Curso
            </label>
            <select style={{ ...fld, width: '100%' }}>
              <option>Todos</option>
            </select>
          </div>
        </div>

        {/* Tabla de incidentes */}
        {loadingIncidentes ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: 24, animation: 'spin 0.9s linear infinite' }} />
            <p style={{ marginTop: 12 }}>Cargando incidentes...</p>
          </div>
        ) : incidentes.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: 40,
            textAlign: 'center',
            color: '#64748b'
          }}>
            <i className="bi bi-inbox" style={{ fontSize: 32 }} />
            <p style={{ marginTop: 12 }}>No hay incidentes registrados</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1200 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 100 }}>FECHA</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 180 }}>ALUMNO</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 150 }}>TIPO DE INCIDENCIA</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 250 }}>DESCRIPCIÓN</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 120 }}>GRAVEDAD</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 140 }}>ESTADO</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 150 }}>REGISTRADO POR</th>
                </tr>
              </thead>
              <tbody>
                {incidentes.map((incidente) => {
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
                        {incidente.participantes?.[0]?.nombreAlumno || incidente.participantes?.[0]?.alumnoInstitucionalId || 'N/A'}
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
                        {incidente.funcionarioResponsableId}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vista de Cards (alternativa) */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
          Vista de Tarjetas
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b' }}>
          Formato alternativo de visualización
        </p>

        {loadingIncidentes ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: 24, animation: 'spin 0.9s linear infinite' }} />
            <p style={{ marginTop: 12 }}>Cargando incidentes...</p>
          </div>
        ) : incidentes.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: 40,
            textAlign: 'center',
            color: '#64748b'
          }}>
            <i className="bi bi-inbox" style={{ fontSize: 32 }} />
            <p style={{ marginTop: 12 }}>No hay incidentes registrados</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {incidentes.map((incidente) => {
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
                        {incidente.funcionarioResponsableId}
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
