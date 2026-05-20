'use client';

import { useState, FormEvent, CSSProperties } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Estilos reutilizables
const fld: CSSProperties = {
  padding: '9px 12px',
  borderRadius: 8,
  border: '1.5px solid #e2e8f0',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  color: '#0f172a',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box'
};

/* ==================== COMPONENTES UI ==================== */

interface FieldProps {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, required, children }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          {label}
          {required && <span style={{ color: '#dc2626' }}> *</span>}
        </label>
      )}
      {children}
    </div>
  );
}

interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit';
  disabled?: boolean;
}

function Btn({ children, onClick, variant = 'primary', size = 'md', type = 'button', disabled }: BtnProps) {
  const V = {
    primary: { background: '#003087', color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: '#003087', border: '1.5px solid #003087' },
    ghost: { background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0' }
  };
  const S = {
    sm: { padding: '5px 14px', fontSize: 13 },
    md: { padding: '8px 20px', fontSize: 14 },
    lg: { padding: '11px 28px', fontSize: 15 }
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...V[variant],
        ...S[size],
        borderRadius: 8,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }}
    >
      {children}
    </button>
  );
}

/* ==================== SIDEBAR ==================== */

interface SidebarProps {
  current: string;
  navigate: (screen: string) => void;
  user: { name: string; role: string };
}

function Sidebar({ current, navigate, user }: SidebarProps) {
  const items = [
    { id: 'incidencias', label: 'Incidencias', icon: 'exclamation-triangle' },
  ];

  const initials = user.name.split(' ').slice(0, 2).map(n => n[0]).join('');

  return (
    <div style={{ width: 224, background: '#001f5b', display: 'flex', flexDirection: 'column', color: '#fff', flexShrink: 0, minHeight: '100vh' }}>
      <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-shield-check" style={{ fontSize: 20 }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Colegio UdeC</div>
            <div style={{ fontSize: 10, color: '#93c5fd', marginTop: 1 }}>Sistema de Incidencias</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0041a8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
          <div style={{ fontSize: 11, color: '#93c5fd' }}>{user.role}</div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
      </div>

      <nav style={{ flex: 1, padding: '10px' }}>
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '9px 12px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: current === item.id ? 'rgba(255,255,255,0.14)' : 'transparent',
              borderLeft: current === item.id ? '3px solid #60a5fa' : '3px solid transparent',
              color: current === item.id ? '#fff' : 'rgba(255,255,255,0.6)',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: current === item.id ? 600 : 400,
              textAlign: 'left',
              marginBottom: 2
            }}
          >
            <i className={`bi bi-${item.icon}`} style={{ fontSize: 16 }} />{item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ==================== PANTALLA DE INCIDENCIAS ==================== */

interface FormData {
  titulo: string;
  fecha: string;
  descripcion: string;
  gravedad: string;
  alumnoId: string;
  rolAlumno: string;
  funcionarioId: string;
}

interface Mensaje {
  tipo: 'success' | 'error';
  texto: string;
}

function IncidenciasScreen() {
  const [form, setForm] = useState<FormData>({
    titulo: '',
    fecha: '',
    descripcion: '',
    gravedad: '',
    alumnoId: '',
    rolAlumno: '',
    funcionarioId: ''
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

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

    if (!form.alumnoId.trim()) {
      nuevosErrores.alumnoId = 'Este campo es requerido';
    }

    if (!form.rolAlumno) {
      nuevosErrores.rolAlumno = 'Este campo es requerido';
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
      alumnoId: '',
      rolAlumno: '',
      funcionarioId: ''
    });
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
          estado: 'Abierto',
          funcionarioResponsableId: form.funcionarioId,
          participantes: [
            {
              alumnoInstitucionalId: form.alumnoId,
              rolEnIncidente: form.rolAlumno,
              observacion: '',
            },
          ],
        }),
      });

      const resultado = await response.json();

      if (resultado.ok) {
        setMensaje({
          tipo: 'success',
          texto: `Incidente registrado exitosamente con ID: ${resultado.data?.id}`,
        });
        limpiarFormulario();
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

  return (
    <div style={{ padding: '28px 32px', maxWidth: 840 }}>
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

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '28px' }}>
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
                <option>Media</option>
                <option>Alta</option>
              </select>
              {errores.gravedad && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errores.gravedad}</span>}
            </Field>

            <Field label="ID Alumno institucional" required>
              <input
                style={{ ...fld, borderColor: errores.alumnoId ? '#dc2626' : '#e2e8f0' }}
                value={form.alumnoId}
                onChange={e => set('alumnoId', e.target.value)}
                placeholder="Ej: ALU-1001"
              />
              {errores.alumnoId && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errores.alumnoId}</span>}
              <span style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>IDs de prueba: ALU-1001, ALU-1002, ALU-1003</span>
            </Field>

            <Field label="Rol del alumno en el incidente" required>
              <select
                style={{ ...fld, borderColor: errores.rolAlumno ? '#dc2626' : '#e2e8f0' }}
                value={form.rolAlumno}
                onChange={e => set('rolAlumno', e.target.value)}
              >
                <option value="">— Seleccionar —</option>
                <option>Agresor</option>
                <option>Victima</option>
                <option>Testigo</option>
                <option>Involucrado</option>
              </select>
              {errores.rolAlumno && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errores.rolAlumno}</span>}
            </Field>

            <Field label="ID Funcionario responsable" required>
              <input
                style={{ ...fld, borderColor: errores.funcionarioId ? '#dc2626' : '#e2e8f0' }}
                value={form.funcionarioId}
                onChange={e => set('funcionarioId', e.target.value)}
                placeholder="Ej: FUN-3001"
              />
              {errores.funcionarioId && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errores.funcionarioId}</span>}
              <span style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>IDs de prueba: FUN-3001, FUN-3002, FUN-3003</span>
            </Field>
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

/* ==================== APP PRINCIPAL ==================== */

export default function Home() {
  const [screen, setScreen] = useState('incidencias');
  const user = {
    name: 'Funcionario Usuario',
    role: 'Profesor'
  };

  const navigate = (s: string) => setScreen(s);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans',sans-serif", background: '#f1f5f9', fontSize: 14 }}>
      <Sidebar current={screen} navigate={navigate} user={user} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {screen === 'incidencias' && <IncidenciasScreen />}
      </div>
    </div>
  );
}