import { useState, useEffect, useCallback, useMemo } from 'react';
import { PrestamoRepository } from '../services/prestamoRepository';
import type {
  Prestamo,
  PrestamoCreate,
  PrestamoWithDetails,
} from '../models/Prestamo';
import { Timestamp } from 'firebase/firestore';

// Hook para gestionar préstamos de la biblioteca
export const usePrestamos = (autoLoad: boolean = true) => {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [prestamosWithDetails, setPrestamosWithDetails] = useState<
    PrestamoWithDetails[]
  >([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const prestamoRepository = useMemo(() => new PrestamoRepository(), []);

  // Carga préstamos
  const loadPrestamos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await prestamoRepository.getAll();
      setPrestamos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Carga préstamos con detalles
  const loadPrestamosWithDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await prestamoRepository.getAllWithDetails();
      setPrestamosWithDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [prestamoRepository]);

  // Carga préstamos activos
  const loadActivePrestamos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await prestamoRepository.getActive();
      setPrestamos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Carga préstamos del socio por ID
  const loadPrestamosByMember = async (idSocio: string) => {
    try {
      setLoading(true);
      setError(null);
      // Carga todos los préstamos
      const allWithDetails = await prestamoRepository.getAllWithDetails();
      // Filtra préstamos del socio
      const memberPrestamosWithDetails = allWithDetails.filter(p => p.idSocio === idSocio);
      setPrestamosWithDetails(memberPrestamosWithDetails);
      const data = await prestamoRepository.getByMember(idSocio);
      setPrestamos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Carga préstamos del libro por ID
  const loadPrestamosByBook = async (idLibro: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await prestamoRepository.getByBook(idLibro);
      setPrestamos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Crea préstamo
  const createPrestamo = async (
    prestamoData: Omit<
      PrestamoCreate,
      'fechaInicio' | 'fechaDevolucionPrevista' | 'estado' | 'multa' | 'tituloLibro' | 'isbnLibro'
    >,
    estadoInicial: 'PENDIENTE' | 'ACTIVO' = 'ACTIVO',
    diasPrestamo: number = 7
  ) => {
    try {
      setError(null);

      // Obtener información del libro para guardar título e ISBN
      const libroDetails = await prestamoRepository.getBookDetails(prestamoData.idLibro);
      
      const now = Timestamp.now();
      const fechaDevolucionPrevista = new Timestamp(
        now.seconds + diasPrestamo * 24 * 60 * 60, // días desde ahora
        now.nanoseconds
      );

      const prestamo: PrestamoCreate = {
        ...prestamoData,
        tituloLibro: libroDetails?.titulo || 'Título no disponible',
        isbnLibro: libroDetails?.isbn || 'ISBN no disponible',
        fechaInicio: now,
        fechaDevolucionPrevista,
        estado: estadoInicial,
        multa: 0,
      };

      await prestamoRepository.create(prestamo);
      await loadPrestamosWithDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  };

  // Devuelve libro
  const returnBook = async (id: string, isDamaged: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const prestamo = prestamos.find((p) => p.id === id);
      if (!prestamo) {
        setError('Préstamo no encontrado');
        setLoading(false);
        return false;
      }
      await prestamoRepository.returnBook(id, isDamaged);
      await loadPrestamosWithDetails();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al devolver libro:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Aproba préstamo
  const approvePrestamo = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const prestamo = prestamos.find((p) => p.id === id);
      if (!prestamo) {
        setError('Préstamo no encontrado');
        setLoading(false);
        return;
      }
      // Actualizar el estado del préstamo a ACTIVO
      await prestamoRepository.update(id, { estado: 'ACTIVO' as const });
      // Actualizar el estado del libro a PRESTADO
      await prestamoRepository.updateLibroStatus(prestamo.idLibro, 'PRESTADO');
      await loadPrestamosWithDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al aprobar préstamo:', err);
      return false;
    } finally {
      setLoading(false);
    }
    return true;
  };
  
  // Rechaza préstamo
  const rejectPrestamo = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const prestamo = prestamos.find((p) => p.id === id);
      if (!prestamo) {
        setError('Préstamo no encontrado');
        setLoading(false);
        return false;
      }

      // Eliminar el préstamo rechazado
      await prestamoRepository.delete(id);
      
      await loadPrestamosWithDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al rechazar préstamo:', err);
      return false;
    } finally {
      setLoading(false);
    }
    return true;
  };

  // Comprueba préstamos vencidos
  const checkOverdueLoans = async () => {
    try {
      setError(null);
      await prestamoRepository.checkOverdueLoans();
      await loadPrestamosWithDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  };

  useEffect(() => {
    if (!autoLoad) return;
    const unsubscribe = prestamoRepository.subscribeAll((basePrestamos) => {
      setPrestamos(basePrestamos);
      loadPrestamosWithDetails();
    });
    loadPrestamosWithDetails();

    return () => {
      unsubscribe();
    };
  }, [loadPrestamosWithDetails, autoLoad]);

  return {
    prestamos,
    prestamosWithDetails,
    loading,
    error,
    loadPrestamos,
    loadPrestamosWithDetails,
    loadActivePrestamos,
    loadPrestamosByMember,
    loadPrestamosByBook,
    createPrestamo,
    returnBook,
    approvePrestamo,
    rejectPrestamo,
    checkOverdueLoans, 
  };
};
