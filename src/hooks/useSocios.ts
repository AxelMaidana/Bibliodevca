import { useState, useEffect, useCallback, useMemo } from 'react';
import { SocioRepository } from '../services/socioRepository';
import type { Socio, SocioCreate, SocioUpdate } from '../models/Socio';

// Hook para gestionar socios
export const useSocios = (autoLoad: boolean = true) => {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const socioRepository = useMemo(() => new SocioRepository(), []);

  // Carga socios
  const loadSocios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await socioRepository.getAll();
      setSocios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [socioRepository]);

  // Carga socios con multas pendientes
  const loadSociosWithPendingFines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await socioRepository.getWithPendingFines();
      setSocios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Crea socio
  const createSocio = async (
    socioData: Omit<SocioCreate, 'numeroSocio' | 'multasPendientes'>
  ) => {
    try {
      setError(null);

      // Generate unique member number
      const numeroSocio = await socioRepository.generateNumeroSocio();

      const socio: SocioCreate = {
        ...socioData,
        numeroSocio,
        multasPendientes: 0,
      };

      await socioRepository.create(socio);
      await loadSocios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  };

  // Actualiza socio
  const updateSocio = async (id: string, socioData: SocioUpdate) => {
    try {
      setError(null);
      await socioRepository.update(id, socioData);
      await loadSocios();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  };
  
  // Paga multa
  const pagarMulta = async (id: string, cantidad: number) => {
    try {
      setLoading(true);
      setError(null);
      await socioRepository.pagarMulta(id, cantidad);
      await loadSocios();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al pagar multa:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Elimina socio
  const deleteSocio = async (id: string) => {
    try {
      setError(null);
      await socioRepository.delete(id);
      await loadSocios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  };

  // Paga multa
  const payFine = async (id: string, amount: number) => {
    try {
      setError(null);
      const socio = socios.find((s) => s.id === id);
      if (!socio) {
        throw new Error('Socio no encontrado');
      }

      const newMultasPendientes = Math.max(0, socio.multasPendientes - amount);
      await socioRepository.update(id, {
        multasPendientes: newMultasPendientes,
      });
      await loadSocios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  };

  // Comprueba si DNI existe
  const checkDniExists = async (dni: string, excludeId?: string) => {
    try {
      return await socioRepository.dniExists(dni, excludeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  };

  // Comprueba si número de socio existe
  const checkNumeroSocioExists = async (
    numeroSocio: string,
    excludeId?: string
  ) => {
    try {
      return await socioRepository.numeroSocioExists(numeroSocio, excludeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  };

  useEffect(() => {
    if (!autoLoad) return;

    const unsubscribe = socioRepository.subscribeAll((data) => {
      setSocios(data);
      setLoading(false);
    });

    // Carga inicial de respaldo
    loadSocios();

    return () => {
      unsubscribe();
    };
  }, [loadSocios, autoLoad]);

  return {
    socios,
    loading,
    error,
    loadSocios,
    loadSociosWithPendingFines,
    createSocio,
    updateSocio,
    deleteSocio,
    pagarMulta,
    checkNumeroSocioExists,
  };
};
