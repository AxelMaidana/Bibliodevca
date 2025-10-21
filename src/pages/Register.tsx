import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { BiblioUserRepository } from '../services/biblioUserRepository';

export const Register: React.FC = () => {
  const repo = new BiblioUserRepository();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [dni, setDni] = useState('');
  const [created, setCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await repo.create({
        email,
        nombreCompleto,
        dni,
        role: 'BIBLIOTECARIO',
        status: 'ACTIVO',
        uid: cred.user.uid,
      });
      setCreated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  if (created) {
    return (
      <div className="max-w-md mx-auto bg-white shadow p-6 rounded">
        <div className="text-green-700 mb-4">Bibliotecario creado correctamente.</div>
        <div>Ya puedes acceder al sistema con tu correo y contraseña.</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow p-6 rounded">
      <h1 className="text-xl font-semibold mb-4">Registrar Bibliotecario</h1>
      {error && <div className="mb-3 text-red-700">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border px-3 py-2 rounded" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border px-3 py-2 rounded" placeholder="Nombre completo" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} />
        <input className="w-full border px-3 py-2 rounded" placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} />
        <input type="password" className="w-full border px-3 py-2 rounded" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded cursor-pointer hover:opacity-95 transition-opacity">Registrar</button>
      </form>
    </div>
  );
};


