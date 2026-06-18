export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const SESSION_STORAGE_KEY = 'sce_sesion';
export const SESSION_UPDATED_EVENT = 'sce-session-updated';

export function getStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

export function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const funcionarioId = getStoredSession()?.funcionario?.id;

  if (funcionarioId) {
    headers.set('x-funcionario-id', funcionarioId);
  }

  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  return fetch(url, { ...init, headers });
}
