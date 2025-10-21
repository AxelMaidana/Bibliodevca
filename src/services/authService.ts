import app, { auth } from './firebaseConfig';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  User,
} from 'firebase/auth';

export class AuthService {
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  async signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async signOut() {
    await signOut(auth);
  }

  async changePassword(newPassword: string) {
    if (!auth.currentUser) throw new Error('No autenticado');
    await updatePassword(auth.currentUser, newPassword);
  }
}


