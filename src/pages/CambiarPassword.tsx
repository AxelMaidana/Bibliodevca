import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const CambiarPassword: React.FC = () => {
  const { changePassword, profile } = useAuth();
  const [password, setPassword] = useState('');
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownMs, setCooldownMs] = useState(0);

  // Calcula el tiempo restante de cooldown (5 minutos desde el último cambio)
  useEffect(() => {
    const computeRemaining = () => {
      if (!profile?.lastPasswordChangeAt) return 0;
      const now = Date.now();
      const last = profile.lastPasswordChangeAt.toMillis();
      const five = 5 * 60 * 1000;
      const remaining = Math.max(0, five - (now - last));
      return remaining;
    };

    setCooldownMs(computeRemaining());

    const id = setInterval(() => {
      const remaining = computeRemaining();
      setCooldownMs(remaining);
      if (remaining <= 0) {
        clearInterval(id);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [profile?.lastPasswordChangeAt]);

  const formattedRemaining = useMemo(() => {
    const mins = Math.floor(cooldownMs / 60000);
    const secs = Math.floor((cooldownMs % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [cooldownMs]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await changePassword(password);
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow p-6 rounded">
      <h1 className="text-xl font-semibold mb-4">Cambiar contraseña</h1>
      {ok && <div className="mb-3 text-green-700">Contraseña actualizada</div>}
      {error && <div className="mb-3 text-red-700">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="password" className="w-full border px-3 py-2 rounded" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        {cooldownMs > 0 && (
          <div className="text-sm text-gray-600">Podrás cambiar la contraseña en {formattedRemaining}</div>
        )}
        <button
          type="submit"
          disabled={cooldownMs > 0 || password.length < 6}
          className={`w-full text-white py-2 rounded cursor-pointer transition-opacity ${
            cooldownMs > 0 || password.length < 6
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:opacity-95'
          }`}
        >
          Cambiar
        </button>
      </form>
    </div>
  );
};


