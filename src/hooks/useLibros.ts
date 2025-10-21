import { useState, useEffect, useCallback, useMemo } from 'react';
import { LibroRepository } from '../services/libroRepository';
import type { Libro, LibroCreate, LibroUpdate } from '../models/Libro';
import { Timestamp } from 'firebase/firestore';

// Hook para gestionar libros
export const useLibros = (autoLoad: boolean = true) => {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const libroRepository = useMemo(() => new LibroRepository(), []);

  // Carga libros
  const loadLibros = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await libroRepository.getAll();
      setLibros(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [libroRepository]);

  // Carga libros por estado
  const loadLibrosByStatus = async (estado: 'DISPONIBLE' | 'PRESTADO') => {
    try {
      setLoading(true);
      setError(null);
      const data = await libroRepository.getByStatus(estado);
      setLibros(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Crea libro
  const createLibro = async (
    libroData: Omit<LibroCreate, 'fechaAlta' | 'estado'>
  ) => {
    try {
      setError(null);
      const libro: LibroCreate = {
        ...libroData,
        estado: 'DISPONIBLE',
        fechaAlta: Timestamp.now(),
      };
      await libroRepository.create(libro);
      await loadLibros();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  };

  // Actualiza libro
  const updateLibro = async (id: string, libroData: LibroUpdate) => {
    try {
      setError(null);
      await libroRepository.update(id, libroData);
      await loadLibros();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  };

  // Elimina libro
  const deleteLibro = async (id: string) => {
    try {
      setError(null);
      await libroRepository.delete(id);
      await loadLibros();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  };

  // Comprueba si ISBN existe
  const checkIsbnExists = async (isbn: string, excludeId?: string) => {
    try {
      return await libroRepository.isbnExists(isbn, excludeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  };

  useEffect(() => {
    if (!autoLoad) return;
    const unsubscribe = libroRepository.subscribeAll((data) => {
      setLibros(data);
      setLoading(false);
    });
    loadLibros();

    return () => {
      unsubscribe();
    };
  }, [loadLibros, autoLoad]);

  return {
    libros,
    loading,
    error,
    loadLibros,
    loadLibrosByStatus,
    createLibro,
    updateLibro,
    deleteLibro,
    checkIsbnExists,
  };
};
