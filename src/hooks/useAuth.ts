import { useEffect, useMemo, useState, useCallback } from 'react';
import { AuthService } from '../services/authService';
import { BiblioUserRepository } from '../services/biblioUserRepository';
import type { BiblioUser, BiblioUserRole } from '../models/BiblioUser';
import { Timestamp } from 'firebase/firestore';

// Hook para gestionar autenticación
export const useAuth = () => {
  const authService = useMemo(() => new AuthService(), []);
  const userRepo = useMemo(() => new BiblioUserRepository(), []);

  const [firebaseUser, setFirebaseUser] = useState<import('firebase/auth').User | null>(null);
  const [profile, setProfile] = useState<BiblioUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = authService.onAuthStateChanged(async (u) => {
      setFirebaseUser(u);
      if (u?.email) {
        const prof = await userRepo.getByEmail(u.email);
        setProfile(prof);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [authService, userRepo]);

  // Inicia sesión
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    await authService.signIn(email, password);
  }, [authService]);

  // Cierra sesión
  const signOut = useCallback(async () => {
    setError(null);
    await authService.signOut();
  }, [authService]);

  // Cambia contraseña
  const changePassword = useCallback(async (newPassword: string) => {
    setError(null);
    if (!profile) throw new Error('Perfil no disponible');
    const now = Timestamp.now();
    const last = profile.lastPasswordChangeAt;
    const fiveMinutesMs = 5 * 60 * 1000;
    if (last && now.toMillis() - last.toMillis() < fiveMinutesMs) {
      const remaining = fiveMinutesMs - (now.toMillis() - last.toMillis());
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      throw new Error(`Debes esperar ${mins}:${secs.toString().padStart(2, '0')} para cambiar la contraseña`);
    }
    await authService.changePassword(newPassword);
    await userRepo.update(profile.id, { lastPasswordChangeAt: now });
    setProfile({ ...profile, lastPasswordChangeAt: now });
  }, [authService, profile, userRepo]);

  // Comprueba si el usuario tiene un rol específico
  const hasRole = useCallback((role: BiblioUserRole) => profile?.role === role, [profile]);

  return { firebaseUser, profile, loading, error, signIn, signOut, changePassword, hasRole };
}


