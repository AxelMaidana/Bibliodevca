import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const { signIn, loading, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (val: string) => /.+@.+\..+/.test(val);
  const canSubmit = isValidEmail(email) && password.length >= 6 && !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setError('Correo inválido');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      await signIn(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    }
  };

  useEffect(() => {
    if (firebaseUser) {
      navigate('/', { replace: true });
    }
  }, [firebaseUser, navigate]);

  return (
    <div className="max-w-md mx-auto bg-white shadow p-6 rounded">
      <h1 className="text-xl font-semibold mb-4">Ingreso</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border px-3 py-2 rounded" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="w-full border px-3 py-2 rounded" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="text-red-700 text-sm">{error}</div>}
        <button type="submit" className={`w-full text-white py-2 rounded cursor-pointer transition-opacity ${canSubmit ? 'bg-blue-600 hover:opacity-95' : 'bg-blue-300 cursor-not-allowed'}`} disabled={!canSubmit}>Entrar</button>
        <Link to="/solicitud" className="text-blue-600 hover:text-blue-700 cursor-pointer transition-opacity flex justify-center">Solicitar cuenta</Link>
      </form>
    </div>
  );
};


