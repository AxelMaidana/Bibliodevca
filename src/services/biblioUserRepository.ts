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
import app, { db } from './firebaseConfig';
import type {
  BiblioUser,
  BiblioUserCreate,
  BiblioUserUpdate,
} from '../models/BiblioUser';
import { SocioRepository } from './socioRepository';

export class BiblioUserRepository {
  private collectionName = 'biblioUsers';
  private socioRepository = new SocioRepository();

  /** Obtenemos todos los usuarios (ordenados por nombre) */
  async getAll(): Promise<BiblioUser[]> {
    const q = query(collection(db, this.collectionName), orderBy('nombreCompleto'));
    const qs = await getDocs(q);
    return qs.docs.map((d) => ({ id: d.id, ...d.data() }) as BiblioUser);
  }

  /** Suscripcion en tiempo real */
  subscribeAll(callback: (users: BiblioUser[]) => void): () => void {
    const q = query(collection(db, this.collectionName), orderBy('nombreCompleto'));
    return onSnapshot(
      q,
      (qs) => {
        callback(qs.docs.map((d) => ({ id: d.id, ...d.data() }) as BiblioUser));
      },
      (error) => console.error('Error in biblioUsers subscription:', error)
    );
  }

  async getById(id: string): Promise<BiblioUser | null> {
    const ref = doc(db, this.collectionName, id);
    const snap = await getDoc(ref);
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as BiblioUser) : null;
  }

  async getByEmail(email: string): Promise<BiblioUser | null> {
    const q = query(collection(db, this.collectionName), where('email', '==', email));
    const qs = await getDocs(q);
    if (qs.empty) return null;
    const d = qs.docs[0];
    return { id: d.id, ...d.data() } as BiblioUser;
  }

  async create(user: BiblioUserCreate): Promise<string> {
    const ref = await addDoc(collection(db, this.collectionName), {
      ...user,
      createdAt: user.createdAt || Timestamp.now(),
    });
    
    // Si el rol es SOCIO, crear automáticamente un registro en la colección de socios
    if (user.role === 'SOCIO' && user.status === 'ACTIVO') {
      try {
        const numeroSocio = await this.socioRepository.generateNumeroSocio();
        await this.socioRepository.create({
          nombre: user.nombreCompleto,
          dni: user.dni,
          email: user.email,
          numeroSocio: numeroSocio,
          multasPendientes: 0
        });
      } catch (error) {
        console.error('Error al crear socio automáticamente:', error);
      }
    }
    
    return ref.id;
  }

  async update(id: string, data: BiblioUserUpdate): Promise<void> {
    const ref = doc(db, this.collectionName, id);
    await updateDoc(ref, data as any);
  }

  async delete(id: string): Promise<void> {
    const ref = doc(db, this.collectionName, id);
    await deleteDoc(ref);
  }

  /**
   * Aprobar solicitud: marca ACTIVO y genera token de registro para que el socio cree su password.
   */
  async approveAndGenerateRegistration(
    requestId: string
  ): Promise<{ token: string; expiresAt: number }> {
    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h

    await this.update(requestId, {
      status: 'ACTIVO',
      approvedAt: Timestamp.now(),
      registrationToken: token,
      registrationTokenExpiresAt: Timestamp.fromMillis(expiresAt),
    });

    return { token, expiresAt };
  }
  
  async approve(id: string): Promise<void> {
    const ref = doc(db, this.collectionName, id);
    await updateDoc(ref, {
      status: 'ACTIVO',
      updatedAt: Timestamp.now(),
    });
  }
  
  async createProvisionalUser(userData: BiblioUserCreate): Promise<string> {
    // Crear usuario provisional en Firestore
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...userData,
      status: 'PROVISIONAL',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  }
  
  async approveAndCreateProvisionalUser(id: string, email: string, dni: string): Promise<string> {
    // Obtener datos del usuario
    const userRef = doc(db, this.collectionName, id);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('Usuario no encontrado');
    }
    
    const userData = userSnap.data() as BiblioUser;
    
    // Actualizar estado a APROBADO
    await updateDoc(userRef, {
      status: 'APROBADO',
      updatedAt: Timestamp.now(),
    });
    
    // Crear usuario provisional
    const provisionalId = await this.createProvisionalUser({
      email: userData.email,
      nombreCompleto: userData.nombreCompleto,
      dni: userData.dni,
      role: 'SOCIO',
      status: 'PROVISIONAL'
    });
    
    return provisionalId;
  }
}


