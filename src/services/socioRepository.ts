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
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Socio, SocioCreate, SocioUpdate } from '../models/Socio';

export class SocioRepository {
  private collectionName = 'socios';
  
  /**
   * Pagar multa pendiente
   */
  async pagarMulta(id: string, cantidad: number): Promise<void> {
    try {
      const socio = await this.getById(id);
      if (!socio) {
        throw new Error('Socio no encontrado');
      }
      
      // Verificar que la cantidad a pagar no sea mayor que la multa pendiente
      if (cantidad > socio.multasPendientes) {
        throw new Error('El monto a pagar es mayor que la multa pendiente');
      }
      
      // Actualizar el monto de multas pendientes
      await this.update(id, {
        multasPendientes: socio.multasPendientes - cantidad
      });
    } catch (error) {
      console.error('Error pagando multa:', error);
      throw error;
    }
  }

  /**
   * Get all members
   */
  async getAll(): Promise<Socio[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('nombre'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Socio
      );
    } catch (error) {
      console.error('Error getting members:', error);
      throw new Error('Error al obtener los socios');
    }
  }

  /**
   * Subscribe to all members in real-time
   */
  subscribeAll(callback: (socios: Socio[]) => void): () => void {
    const q = query(collection(db, this.collectionName), orderBy('nombre'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(
          (docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }) as Socio
        );
        callback(data);
      },
      (error) => {
        console.error('Error in socios subscription:', error);
      }
    );
    return unsubscribe;
  }

  /**
   * Get member by ID
   */
  async getById(id: string): Promise<Socio | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Socio;
      }
      return null;
    } catch (error) {
      console.error('Error getting member by ID:', error);
      throw new Error('Error al obtener el socio');
    }
  }
  
  /**
   * Get member by email
   */
  async getByEmail(email: string): Promise<Socio | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Socio;
    } catch (error) {
      console.error('Error getting member by email:', error);
      throw new Error('Error al obtener el socio por email');
    }
  }

  /**
   * Get members with pending fines
   */
  async getWithPendingFines(): Promise<Socio[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('multasPendientes', '>', 0),
        orderBy('multasPendientes', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Socio
      );
    } catch (error) {
      console.error('Error getting members with pending fines:', error);
      throw new Error('Error al obtener socios con multas pendientes');
    }
  }

  /**
   * Create new member
   */
  async create(socio: SocioCreate): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), socio);
      return docRef.id;
    } catch (error) {
      console.error('Error creating member:', error);
      throw new Error('Error al crear el socio');
    }
  }

  /**
   * Update member
   */
  async update(id: string, socio: SocioUpdate): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, socio as any);
    } catch (error) {
      console.error('Error updating member:', error);
      throw new Error('Error al actualizar el socio');
    }
  }

  /**
   * Delete member
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting member:', error);
      throw new Error('Error al eliminar el socio');
    }
  }

  /**
   * Check if DNI already exists
   */
  async dniExists(dni: string, excludeId?: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('dni', '==', dni)
      );
      const querySnapshot = await getDocs(q);

      if (excludeId) {
        return querySnapshot.docs.some((doc) => doc.id !== excludeId);
      }

      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking DNI:', error);
      throw new Error('Error al verificar el DNI');
    }
  }

  /**
   * Check if member number already exists
   */
  async numeroSocioExists(
    numeroSocio: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('numeroSocio', '==', numeroSocio)
      );
      const querySnapshot = await getDocs(q);

      if (excludeId) {
        return querySnapshot.docs.some((doc) => doc.id !== excludeId);
      }

      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking member number:', error);
      throw new Error('Error al verificar el número de socio');
    }
  }

  /**
   * Generate unique member number
   */
  async generateNumeroSocio(): Promise<string> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('numeroSocio', 'desc')
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return 'SOC001';
      }

      const lastNumero = querySnapshot.docs[0].data().numeroSocio;
      const lastNumber = parseInt(lastNumero.replace('SOC', ''));
      const newNumber = lastNumber + 1;

      return `SOC${newNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating member number:', error);
      throw new Error('Error al generar el número de socio');
    }
  }
}
