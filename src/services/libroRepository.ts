import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Libro, LibroCreate, LibroUpdate } from '../models/Libro';

export class LibroRepository {
  private collectionName = 'libros';

  /**
   * Get all books
   */
  async getAll(): Promise<Libro[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('titulo'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Libro
      );
    } catch (error) {
      console.error('Error getting books:', error);
      throw new Error('Error al obtener los libros');
    }
  }

  /**
   * Subscribe to all books in real-time
   */
  subscribeAll(callback: (libros: Libro[]) => void): () => void {
    const q = query(collection(db, this.collectionName), orderBy('titulo'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(
          (docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }) as Libro
        );
        callback(data);
      },
      (error) => {
        console.error('Error in libros subscription:', error);
      }
    );
    return unsubscribe;
  }

  /**
   * Get book by ID
   */
  async getById(id: string): Promise<Libro | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Libro;
      }
      return null;
    } catch (error) {
      console.error('Error getting book by ID:', error);
      throw new Error('Error al obtener el libro');
    }
  }

  /**
   * Get books by status
   */
  async getByStatus(estado: 'DISPONIBLE' | 'PRESTADO'): Promise<Libro[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('estado', '==', estado),
        orderBy('titulo')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Libro
      );
    } catch (error) {
      console.error('Error getting books by status:', error);
      throw new Error('Error al obtener los libros por estado');
    }
  }

  /**
   * Subscribe to books by status in real-time
   */
  subscribeByStatus(
    estado: 'DISPONIBLE' | 'PRESTADO',
    callback: (libros: Libro[]) => void
  ): () => void {
    const q = query(
      collection(db, this.collectionName),
      where('estado', '==', estado),
      orderBy('titulo')
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(
          (docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }) as Libro
        );
        callback(data);
      },
      (error) => {
        console.error('Error in libros by status subscription:', error);
      }
    );
    return unsubscribe;
  }

  /**
   * Create new book
   */
  async create(libro: LibroCreate): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...libro,
        fechaAlta: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating book:', error);
      throw new Error('Error al crear el libro');
    }
  }

  /**
   * Update book
   */
  async update(id: string, libro: LibroUpdate): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, libro as any);
    } catch (error) {
      console.error('Error updating book:', error);
      throw new Error('Error al actualizar el libro');
    }
  }

  /**
   * Delete book
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting book:', error);
      throw new Error('Error al eliminar el libro');
    }
  }

  /**
   * Check if ISBN already exists
   */
  async isbnExists(isbn: string, excludeId?: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isbn', '==', isbn)
      );
      const querySnapshot = await getDocs(q);

      if (excludeId) {
        return querySnapshot.docs.some((doc) => doc.id !== excludeId);
      }

      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking ISBN:', error);
      throw new Error('Error al verificar el ISBN');
    }
  }
}
