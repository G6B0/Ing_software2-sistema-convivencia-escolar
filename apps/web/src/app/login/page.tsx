'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Field from '@/components/Field';
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

interface Mensaje {
  tipo: 'success' | 'error';
  texto: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState('ana.morales@colegio.cl');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!correo.trim()) {
      nuevosErrores.correo = 'Este campo es requerido';
    }

    if (!password.trim()) {
      nuevosErrores.password = 'Este campo es requerido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correoInstitucional: correo,
          password,
        }),
      });
      const resultado = await response.json();

      if (resultado.ok) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(resultado.data as SesionUsuario));
        router.replace('/dashboard');
        return;
      }

      setMensaje({
        tipo: 'error',
        texto: resultado.mensaje || 'Credenciales invalidas',
      });
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: 'Error de conexion con el servidor',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ width: '42%', background: 'linear-gradient(155deg,#001447 0%,#003087 55%,#0055d4 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 52px', color: '#fff' }}>
        <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.12)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 26 }}>
          <i className="bi bi-shield-check" style={{ fontSize: 30 }} />
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>Colegio UdeC</div>
        <div style={{ fontSize: 17, opacity: 0.82, lineHeight: 1.7 }}>Sistema de Gestion<br />de Convivencia Escolar</div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.18)', marginTop: 34, paddingTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
          Acceso exclusivo para funcionarios autorizados. Las acciones realizadas quedan asociadas a la sesion institucional.
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: 24 }}>
        <div style={{ width: 400, background: '#fff', borderRadius: 18, padding: '42px 38px', boxShadow: '0 4px 32px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Iniciar sesion</h1>
          <p style={{ margin: '0 0 26px', fontSize: 14, color: '#64748b' }}>Ingresa tus credenciales institucionales</p>

          {mensaje && (
            <div style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 10, background: '#fee2e2', border: '1px solid #dc2626', color: '#991b1b', fontSize: 13, fontWeight: 600 }}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Correo institucional" required>
                <input
                  style={{ ...fld, borderColor: errores.correo ? '#dc2626' : '#e2e8f0' }}
                  type="email"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  placeholder="nombre@colegio.cl"
                />
                {errores.correo && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errores.correo}</span>}
              </Field>

              <Field label="Contrasena" required>
                <input
                  style={{ ...fld, borderColor: errores.password ? '#dc2626' : '#e2e8f0' }}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ingrese su contrasena"
                />
                {errores.password && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{errores.password}</span>}
              </Field>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: 26, width: '100%', padding: '13px', background: '#003087', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat" style={{ animation: 'spin 0.9s linear infinite' }} />
                  Validando...
                </>
              ) : (
                'Ingresar al sistema'
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#94a3b8' }}>Clave demo: convivencia2026</p>
        </div>
      </div>
    </div>
  );
}
