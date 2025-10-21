import { useEffect, useMemo, useState, useCallback } from 'react';
import { BiblioUserRepository } from '../services/biblioUserRepository';
import type { BiblioUser } from '../models/BiblioUser';

// Hook para gestionar usuarios
export const useBiblioUsers = (autoLoad: boolean = true) => {
  const repo = useMemo(() => new BiblioUserRepository(), []);
  const [users, setUsers] = useState<BiblioUser[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  // Carga usuarios
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repo.getAll();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [repo]);

  // Crea solicitud de registro
  const createRequest = useCallback(async (email: string, nombreCompleto: string, dni: string) => {
    await repo.create({ email, nombreCompleto, dni, role: 'SOCIO', status: 'PENDIENTE' });
  }, [repo]);

  // Aproba usuario
  const approve = useCallback(async (id: string, email: string, dni: string) => {
    return await repo.approveAndCreateProvisionalUser(id, email, dni);
  }, [repo]);

  useEffect(() => {
    if (!autoLoad) return;
    const unsub = repo.subscribeAll((data) => {
      setUsers(data);
      setLoading(false);
    });
    load();
    return () => unsub();
  }, [repo, load, autoLoad]);

  return { users, loading, error, load, createRequest, approve };
}


