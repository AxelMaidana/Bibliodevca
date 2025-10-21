import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { BiblioUserRepository } from '../services/biblioUserRepository';
import { useAppStore } from '../store/useAppStore';

export const CompletarRegistro: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const addNotification = useAppStore((s) => s.addNotification);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Obtener parámetros de la URL
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const userIdParam = params.get('userId');

    if (emailParam) setEmail(emailParam);
    if (userIdParam) setUserId(userIdParam);

    // Cargar datos del usuario provisional
    const loadUserData = async () => {
      if (!userIdParam) return;
      
      try {
        const userRef = doc(db, 'biblioUsers', userIdParam);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          if (data.email && !emailParam) {
            setEmail(data.email);
          }
        } else {
          setError('No se encontró la información del usuario. El enlace puede haber expirado.');
        }
      } catch (err) {
        console.error('Error al cargar datos del usuario:', err);
        setError('Error al cargar datos del usuario');
      }
    };

    loadUserData();
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor complete todos los campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (!userData || !userId) {
      setError('No se encontró la información del usuario');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Crear usuario en Firebase Auth
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Crear usuario definitivo en Firestore
      const repo = new BiblioUserRepository();
      await repo.create({
        email: email,
        nombreCompleto: userData.nombreCompleto,
        dni: userData.dni,
        role: 'SOCIO',
        status: 'ACTIVO',
        uid: userCredential.user.uid
      });
      
      // 3. Eliminar usuario provisional
      await deleteDoc(doc(db, 'biblioUsers', userId));
      
      // 4. Mostrar notificación de éxito
      addNotification({
        type: 'success',
        title: 'Registro completado',
        message: 'Tu cuenta ha sido creada exitosamente'
      });
      
      // 5. Redirigir al login
      navigate('/login');
    } catch (err: any) {
      console.error('Error al completar registro:', err);
      setError(err.message || 'Error al completar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Completar Registro</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">El correo no puede ser modificado</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Confirmar Contraseña
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            placeholder="Confirma tu contraseña"
            required
          />
        </div>
        
        <div className="flex items-center justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Procesando...' : 'Completar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
};