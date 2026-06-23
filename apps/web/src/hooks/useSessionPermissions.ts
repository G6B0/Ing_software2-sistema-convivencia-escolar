'use client';

import { useEffect, useState } from 'react';
import {
  getStoredSession,
  SESSION_STORAGE_KEY,
  SESSION_UPDATED_EVENT,
} from '@/lib/api';
import { getPermissions } from '@/lib/permissions';

export function useSessionPermissions() {
  const [permissions, setPermissions] = useState<string[]>(() => {
    const session = getStoredSession();
    return getPermissions(
      session?.funcionario?.rol || '',
      session?.funcionario?.permisos
    );
  });

  useEffect(() => {
    const updatePermissions = () => {
      const session = getStoredSession();
      setPermissions(getPermissions(
        session?.funcionario?.rol || '',
        session?.funcionario?.permisos
      ));
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === SESSION_STORAGE_KEY) {
        updatePermissions();
      }
    };

    updatePermissions();
    window.addEventListener(SESSION_UPDATED_EVENT, updatePermissions);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(SESSION_UPDATED_EVENT, updatePermissions);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return permissions;
}
