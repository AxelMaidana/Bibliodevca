import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type {
  Prestamo,
  PrestamoCreate,
  PrestamoUpdate,
  PrestamoWithDetails,
} from '../models/Prestamo';
import { LibroRepository } from './libroRepository';
import { SocioRepository } from './socioRepository';
import { BiblioUserRepository } from './biblioUserRepository';

export class PrestamoRepository {
  [x: string]: any;
  private collectionName = 'prestamos';
  private libroRepository = new LibroRepository();
  private socioRepository = new SocioRepository();
  private biblioUserRepository = new BiblioUserRepository();
  
  // Método público para obtener detalles de un libro
  async getBookDetails(idLibro: string) {
    return await this.libroRepository.getById(idLibro);
  }

  /**
   * Get all loans
   */
  async getAll(): Promise<Prestamo[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('fechaInicio', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Prestamo
      );
    } catch (error) {
      console.error('Error getting loans:', error);
      throw new Error('Error al obtener los préstamos');
    }
  }

  /**
   * Subscribe to all loans in real-time
   */
  subscribeAll(callback: (prestamos: Prestamo[]) => void): () => void {
    const q = query(
      collection(db, this.collectionName),
      orderBy('fechaInicio', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(
          (docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }) as Prestamo
        );
        callback(data);
      },
      (error) => {
        console.error('Error in prestamos subscription:', error);
      }
    );
    return unsubscribe;
  }

  /**
   * Get loans with details (book and member info) - OPTIMIZED VERSION
   */
  async getAllWithDetails(): Promise<PrestamoWithDetails[]> {
    try {
      const prestamos = await this.getAll();

      // Get all unique book and member IDs
      const libroIds = [...new Set(prestamos.map((p) => p.idLibro))];
      const socioIds = [...new Set(prestamos.map((p) => p.idSocio))];

      // Fetch all books and members in parallel
      const [librosPromises, sociosPromises] = await Promise.all([
        Promise.all(libroIds.map((id) => this.libroRepository.getById(id))),
        Promise.all(socioIds.map((id) => this.socioRepository.getById(id))),
      ]);

      // Create maps for quick lookup
      const librosMap = new Map();
      librosPromises.forEach((libro, index) => {
        if (libro) librosMap.set(libroIds[index], libro);
      });

      const sociosMap = new Map();
      sociosPromises.forEach((socio, index) => {
        if (socio) sociosMap.set(socioIds[index], socio);
      });

      // Build result with details
      return prestamos.map((prestamo) => ({
        ...prestamo,
        libro: librosMap.get(prestamo.idLibro)
          ? {
              titulo: librosMap.get(prestamo.idLibro).titulo,
              autor: librosMap.get(prestamo.idLibro).autor,
              isbn: librosMap.get(prestamo.idLibro).isbn,
            }
          : undefined,
        socio: sociosMap.get(prestamo.idSocio)
          ? {
              nombre: sociosMap.get(prestamo.idSocio).nombre,
              numeroSocio: sociosMap.get(prestamo.idSocio).numeroSocio,
              email: sociosMap.get(prestamo.idSocio).email,
            }
          : undefined,
      }));
    } catch (error) {
      console.error('Error getting loans with details:', error);
      throw new Error('Error al obtener los préstamos con detalles');
    }
  }

  /**
   * Get loan by ID
   */
  async getById(id: string): Promise<Prestamo | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Prestamo;
      }
      return null;
    } catch (error) {
      console.error('Error getting loan by ID:', error);
      throw new Error('Error al obtener el préstamo');
    }
  }

  /**
   * Get active loans - SIMPLIFIED VERSION (no composite index needed)
   */
  async getActive(): Promise<Prestamo[]> {
    try {
      // First get all loans, then filter and sort in memory
      // This avoids the need for composite indexes
      const q = query(collection(db, this.collectionName));
      const querySnapshot = await getDocs(q);

      const allLoans = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Prestamo
      );

      // Filter active loans and sort by fechaInicio
      return allLoans
        .filter((loan) => loan.estado === 'ACTIVO')
        .sort((a, b) => b.fechaInicio.toMillis() - a.fechaInicio.toMillis());
    } catch (error) {
      console.error('Error getting active loans:', error);
      throw new Error('Error al obtener los préstamos activos');
    }
  }

  /**
   * Get loans by member - SIMPLIFIED VERSION (no composite index needed)
   */
  async getByMember(idSocio: string): Promise<Prestamo[]> {
    try {
      const q = query(collection(db, this.collectionName));
      const querySnapshot = await getDocs(q);

      const allLoans = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Prestamo
      );

      // Filter by member and sort by fechaInicio
      return allLoans
        .filter((loan) => loan.idSocio === idSocio)
        .sort((a, b) => b.fechaInicio.toMillis() - a.fechaInicio.toMillis());
    } catch (error) {
      console.error('Error getting loans by member:', error);
      throw new Error('Error al obtener los préstamos del socio');
    }
  }

  /**
   * Get loans by book - SIMPLIFIED VERSION (no composite index needed)
   */
  async getByBook(idLibro: string): Promise<Prestamo[]> {
    try {
      const q = query(collection(db, this.collectionName));
      const querySnapshot = await getDocs(q);

      const allLoans = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Prestamo
      );

      // Filter by book and sort by fechaInicio
      return allLoans
        .filter((loan) => loan.idLibro === idLibro)
        .sort((a, b) => b.fechaInicio.toMillis() - a.fechaInicio.toMillis());
    } catch (error) {
      console.error('Error getting loans by book:', error);
      throw new Error('Error al obtener los préstamos del libro');
    }
  }

  /**
   * Create new loan
   */
  async create(prestamo: PrestamoCreate): Promise<string> {
    try {
      // Verify book is available
      const libro = await this.libroRepository.getById(prestamo.idLibro);
      if (!libro) {
        throw new Error('Libro no encontrado');
      }
      if (libro.estado !== 'DISPONIBLE') {
        throw new Error('El libro no está disponible');
      }

      // Get user to find socio by email
      const user = await this.biblioUserRepository.getById(prestamo.idSocio);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      // Verify member has no pending fines - find by email
      const socio = await this.socioRepository.getByEmail(user.email);
      if (!socio) {
        throw new Error('Socio no encontrado para el email: ' + user.email);
      }
      
      // Update idSocio to use the actual socio ID
      prestamo.idSocio = socio.id!;
      if (socio.multasPendientes > 0) {
        throw new Error('El socio tiene multas pendientes');
      }

      // Create loan
      const docRef = await addDoc(
        collection(db, this.collectionName),
        prestamo
      );

      // Update book status
      console.log(
        'Actualizando estado del libro:',
        prestamo.idLibro,
        'a PRESTADO'
      );
      await this.libroRepository.update(prestamo.idLibro, {
        estado: 'PRESTADO',
      });
      console.log('Estado del libro actualizado exitosamente');

      return docRef.id;
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  }

  /**
   * Update loan
   */
  async update(id: string, prestamo: PrestamoUpdate): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, prestamo as any);
    } catch (error) {
      console.error('Error updating loan:', error);
      throw new Error('Error al actualizar el préstamo');
    }
  }

  /**
   * Return book (mark as finished)
   */
  async returnBook(id: string, isDamaged: boolean = false): Promise<void> {
    try {
      const prestamo = await this.getById(id);
      if (!prestamo) {
        throw new Error('Préstamo no encontrado');
      }

      // Verificar si el libro está atrasado
      const fechaDevolucion = prestamo.fechaDevolucionPrevista.toDate();
      const ahora = new Date();
      const diasRetraso = Math.max(0, Math.floor((ahora.getTime() - fechaDevolucion.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Calcular multa: 10 por día de retraso, 100 adicionales si está dañado
      const multaPorRetraso = diasRetraso > 0 ? diasRetraso * 10 : 0;
      const multaPorDaño = isDamaged ? 100 : 0;
      const multa = multaPorRetraso + multaPorDaño;

      // Update loan
      await this.update(id, {
        fechaDevolucionReal: Timestamp.now(),
        estado: 'FINALIZADO',
        multa,
      });

      // Update book status
      console.log('Devolviendo libro:', prestamo.idLibro, 'a DISPONIBLE');
      await this.libroRepository.update(prestamo.idLibro, {
        estado: 'DISPONIBLE',
      });
      console.log('Libro devuelto exitosamente');

      // Update member fines
      if (multa > 0) {
        const socio = await this.socioRepository.getById(prestamo.idSocio);
        if (socio) {
          await this.socioRepository.update(prestamo.idSocio, {
            multasPendientes: socio.multasPendientes + multa,
          });
        }
      }
    } catch (error) {
      console.error('Error returning book:', error);
      throw error;
    }
  }

  /**
   * Delete loan
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting loan:', error);
      throw new Error('Error al eliminar el préstamo');
    }
  }

  /**
   * Check for overdue loans and update their status
   */
  async checkOverdueLoans(): Promise<void> {
    try {
      const activeLoans = await this.getActive();
      const now = Timestamp.now();

      for (const loan of activeLoans) {
        if (loan.fechaDevolucionPrevista.toMillis() < now.toMillis()) {
          await this.update(loan.id!, { estado: 'ATRASADO' });
        }
      }
    } catch (error) {
      console.error('Error checking overdue loans:', error);
      throw new Error('Error al verificar préstamos vencidos');
    }
  }
}
