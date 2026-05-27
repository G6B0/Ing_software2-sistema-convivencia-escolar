'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
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
  nombreAlumno: string;
  cursoAlumno: string;
  rolEnIncidente: string;
  observacion: string;
}

interface Alumno {
  id: string;
  nombre: string;
  curso: string;
}

interface Mensaje {
  tipo: 'success' | 'error';
  texto: string;
}

export default function RegistrarPage() {
  const [funcionarioSesion, setFuncionarioSesion] = useState<SesionUsuario['funcionario'] | null>(null);
  const [form, setForm] = useState<FormData>({
    titulo: '',
    fecha: '',
    descripcion: '',
    gravedad: '',
    funcionarioId: ''
  });

  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [nuevoParticipante, setNuevoParticipante] = useState({
    curso: '',
    alumnoId: '',
    alumnoNombre: '',
    rol: '',
    observacion: ''
  });

  const [cursos, setCursos] = useState<string[]>([]);
  const [alumnosCurso, setAlumnosCurso] = useState<Alumno[]>([]);
  const [busquedaAlumno, setBusquedaAlumno] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const [protocolos, setProtocolos] = useState<Record<string, string>>({});

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

    fetch(`${API_URL}/institucional/protocolos`)
      .then(r => r.json())
      .then(data => { if (data.ok) setProtocolos(data.data) })
      .catch(() => {});

    fetch(`${API_URL}/institucional/cursos`)
      .then(r => r.json())
      .then(data => { if (data.ok) setCursos(data.data) })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!nuevoParticipante.curso) {
      setAlumnosCurso([]);
      return;
    }

    setLoadingAlumnos(true);
    setBusquedaAlumno('');
    setNuevoParticipante(p => ({ ...p, alumnoId: '', alumnoNombre: '' }));

    fetch(`${API_URL}/institucional/cursos/${nuevoParticipante.curso}/alumnos`)
      .then(r => r.json())
      .then(data => {
        if (data.ok) setAlumnosCurso(data.data);
      })
      .catch(() => {})
      .finally(() => setLoadingAlumnos(false));
  }, [nuevoParticipante.curso]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alumnosFiltrados = alumnosCurso.filter(a =>
    a.nombre.toLowerCase().includes(busquedaAlumno.toLowerCase()) ||
    a.id.toLowerCase().includes(busquedaAlumno.toLowerCase())
  );

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const set = (k: keyof FormData, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const seleccionarAlumno = (alumno: Alumno) => {
    setNuevoParticipante(p => ({
      ...p,
      alumnoId: alumno.id,
      alumnoNombre: alumno.nombre
    }));
    setBusquedaAlumno(alumno.nombre);
    setMostrarSugerencias(false);
  };

  const agregarParticipante = () => {
    if (!nuevoParticipante.curso) {
      alert('Debe seleccionar un curso');
      return;
    }

    if (!nuevoParticipante.alumnoId) {
      alert('Debe seleccionar un alumno');
      return;
    }

    if (!nuevoParticipante.rol) {
      alert('Debe seleccionar el rol');
      return;
    }

    // Validar que el mismo alumno no este ya agregado
    const yaAgregado = participantes.some(
      p => p.alumnoInstitucionalId === nuevoParticipante.alumnoId
    );
    if (yaAgregado) {
      alert('Este alumno ya fue agregado como participante');
      return;
    }

    // Validar que no exista un agresor y victima siendo el mismo alumno
    const rolesConflictivos: Record<string, string> = {
      'Agresor': 'Victima',
      'Victima': 'Agresor'
    };

    const rolConflictivo = rolesConflictivos[nuevoParticipante.rol];
    if (rolConflictivo) {
      const conflicto = participantes.some(
        p => p.alumnoInstitucionalId === nuevoParticipante.alumnoId && p.rolEnIncidente === rolConflictivo
      );
      if (conflicto) {
        alert(`Este alumno ya fue registrado como ${rolConflictivo}. Un mismo alumno no puede ser ${nuevoParticipante.rol} y ${rolConflictivo} al mismo tiempo.`);
        return;
      }
    }

    // Validar que no haya dos agresores con el mismo alumno en roles opuestos
    const alumnoYaEsAgresor = participantes.some(
      p => p.alumnoInstitucionalId === nuevoParticipante.alumnoId && p.rolEnIncidente === 'Agresor'
    );
    const alumnoYaEsVictima = participantes.some(
      p => p.alumnoInstitucionalId === nuevoParticipante.alumnoId && p.rolEnIncidente === 'Victima'
    );

    if (nuevoParticipante.rol === 'Victima' && alumnoYaEsAgresor) {
      alert('Este alumno ya esta registrado como Agresor. No puede ser Victima al mismo tiempo.');
      return;
    }

    if (nuevoParticipante.rol === 'Agresor' && alumnoYaEsVictima) {
      alert('Este alumno ya esta registrado como Victima. No puede ser Agresor al mismo tiempo.');
      return;
    }

    setParticipantes([
      ...participantes,
      {
        alumnoInstitucionalId: nuevoParticipante.alumnoId,
        nombreAlumno: nuevoParticipante.alumnoNombre,
        cursoAlumno: nuevoParticipante.curso,
        rolEnIncidente: nuevoParticipante.rol,
        observacion: nuevoParticipante.observacion
      }
    ]);

    setNuevoParticipante({
      curso: '',
      alumnoId: '',
      alumnoNombre: '',
      rol: '',
      observacion: ''
    });
    setBusquedaAlumno('');
    setAlumnosCurso([]);
  };

  const eliminarParticipante = (index: number) => {
    setParticipantes(participantes.filter((_, i) => i !== index));
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!form.titulo.trim()) nuevosErrores.titulo = 'Campo requerido';
    if (!form.fecha) nuevosErrores.fecha = 'Campo requerido';
    if (!form.descripcion.trim()) nuevosErrores.descripcion = 'Campo requerido';
    if (!form.gravedad) nuevosErrores.gravedad = 'Campo requerido';
    if (!form.funcionarioId.trim()) nuevosErrores.funcionarioId = 'Campo requerido';
    if (participantes.length === 0) nuevosErrores.participantes = 'Debe agregar participantes';

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
    setNuevoParticipante({
      curso: '',
      alumnoId: '',
      alumnoNombre: '',
      rol: '',
      observacion: ''
    });
    setBusquedaAlumno('');
    setAlumnosCurso([]);
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
          funcionarioResponsableId: form.funcionarioId,
          participantes: participantes.map(p => ({
            alumnoInstitucionalId: p.alumnoInstitucionalId,
            rolEnIncidente: p.rolEnIncidente,
            observacion: p.observacion
          }))
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
        texto: 'Error de conexion'
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
            <Field label="Tipo de incidencia" required>
              <select
                style={{ ...fld, borderColor: errores.titulo ? '#dc2626' : '#e2e8f0' }}
                value={form.titulo}
                onChange={e => set('titulo', e.target.value)}
              >
                <option value="">-- Seleccionar tipo --</option>
                <optgroup label="Agresion y violencia">
                  <option value="Agresion fisica">Agresion fisica</option>
                  <option value="Agresion verbal">Agresion verbal</option>
                  <option value="Agresion psicologica">Agresion psicologica</option>
                  <option value="Pelea entre alumnos">Pelea entre alumnos</option>
                  <option value="Intimidacion o amenaza">Intimidacion o amenaza</option>
                </optgroup>
                <optgroup label="Acoso">
                  <option value="Bullying">Bullying</option>
                  <option value="Cyberbullying">Cyberbullying</option>
                  <option value="Acoso sexual">Acoso sexual</option>
                  <option value="Discriminacion">Discriminacion</option>
                </optgroup>
                <optgroup label="Conducta">
                  <option value="Falta de respeto a funcionario">Falta de respeto a funcionario</option>
                  <option value="Interrupcion de clases">Interrupcion de clases</option>
                  <option value="Incumplimiento de normas">Incumplimiento de normas</option>
                  <option value="Uso de celular no autorizado">Uso de celular no autorizado</option>
                  <option value="Inasistencia o fuga de clases">Inasistencia o fuga de clases</option>
                </optgroup>
                <optgroup label="Propiedad y sustancias">
                  <option value="Hurto o robo">Hurto o robo</option>
                  <option value="Daño a propiedad escolar">Daño a propiedad escolar</option>
                  <option value="Consumo de sustancias">Consumo de sustancias</option>
                  <option value="Porte de objetos peligrosos">Porte de objetos peligrosos</option>
                </optgroup>
                <optgroup label="Otros">
                  <option value="Conflicto entre pares">Conflicto entre pares</option>
                  <option value="Accidente escolar">Accidente escolar</option>
                  <option value="Situacion de vulneracion de derechos">Situacion de vulneracion de derechos</option>
                  <option value="Otro">Otro</option>
                </optgroup>
              </select>
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
              <Field label="Descripcion del incidente" required>
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
                <option value="">-- Seleccionar --</option>
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
                style={{ ...fld, borderColor: errores.funcionarioId ? '#dc2626' : '#e2e8f0', background: '#f1f5f9' }}
                value={funcionarioSesion ? funcionarioSesion.nombre : ''}
                readOnly
                placeholder="Debe iniciar sesion"
              />
              {errores.funcionarioId && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errores.funcionarioId}</span>}
            </Field>
          </div>

          {/* Seccion de Participantes */}
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
                          {p.nombreAlumno}
                          <span style={{ fontWeight: 400, color: '#64748b', marginLeft: 8, fontSize: 13 }}>
                            {p.alumnoInstitucionalId} - Curso {p.cursoAlumno}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>
                          Rol: <span style={{ fontWeight: 500, color: '#475569' }}>{p.rolEnIncidente}</span>
                          {p.observacion && ` - ${p.observacion}`}
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
                <Field label="Curso" required>
                  <select
                    style={fld}
                    value={nuevoParticipante.curso}
                    onChange={e => setNuevoParticipante({ ...nuevoParticipante, curso: e.target.value, alumnoId: '', alumnoNombre: '' })}
                  >
                    <option value="">-- Seleccionar curso --</option>
                    {cursos.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Alumno" required>
                  <div ref={autocompleteRef} style={{ position: 'relative' }}>
                    <input
                      style={{
                        ...fld,
                        borderColor: nuevoParticipante.alumnoId ? '#16a34a' : '#e2e8f0',
                        background: !nuevoParticipante.curso ? '#f1f5f9' : '#fff'
                      }}
                      value={busquedaAlumno}
                      onChange={e => {
                        setBusquedaAlumno(e.target.value);
                        setNuevoParticipante(p => ({ ...p, alumnoId: '', alumnoNombre: '' }));
                        setMostrarSugerencias(true);
                      }}
                      onFocus={() => {
                        if (nuevoParticipante.curso && alumnosCurso.length > 0) {
                          setMostrarSugerencias(true);
                        }
                      }}
                      placeholder={
                        !nuevoParticipante.curso
                          ? 'Seleccione un curso primero'
                          : loadingAlumnos
                          ? 'Cargando alumnos...'
                          : 'Escriba el nombre del alumno...'
                      }
                      disabled={!nuevoParticipante.curso || loadingAlumnos}
                    />
                    {nuevoParticipante.alumnoId && (
                      <span style={{ fontSize: 11, color: '#16a34a', marginTop: 4, display: 'block' }}>
                        Seleccionado: {nuevoParticipante.alumnoNombre} ({nuevoParticipante.alumnoId})
                      </span>
                    )}

                    {/* Dropdown de sugerencias */}
                    {mostrarSugerencias && nuevoParticipante.curso && !nuevoParticipante.alumnoId && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        maxHeight: 200,
                        overflowY: 'auto',
                        zIndex: 50
                      }}>
                        {alumnosFiltrados.length === 0 ? (
                          <div style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', textAlign: 'center' }}>
                            No se encontraron alumnos
                          </div>
                        ) : (
                          alumnosFiltrados.map(alumno => (
                            <div
                              key={alumno.id}
                              onClick={() => seleccionarAlumno(alumno)}
                              style={{
                                padding: '10px 16px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f1f5f9',
                                transition: 'background-color 0.1s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <div style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>
                                {alumno.nombre}
                              </div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>
                                {alumno.id}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Field>

                <Field label="Rol en el incidente" required>
                  <select
                    style={fld}
                    value={nuevoParticipante.rol}
                    onChange={e => setNuevoParticipante({ ...nuevoParticipante, rol: e.target.value })}
                  >
                    <option value="">-- Seleccionar --</option>
                    <option>Agresor</option>
                    <option>Victima</option>
                    <option>Testigo</option>
                    <option>Involucrado</option>
                  </select>
                </Field>
                <Field label="Observacion (opcional)">
                  <input
                    style={fld}
                    value={nuevoParticipante.observacion}
                    onChange={e => setNuevoParticipante({ ...nuevoParticipante, observacion: e.target.value })}
                    placeholder="Detalles adicionales sobre este participante..."
                  />
                </Field>
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
