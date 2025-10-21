import React, { useState } from 'react';
import { useBiblioUsers } from '../hooks/useBiblioUsers';
import { Link } from 'react-router-dom';

export const SolicitudSocio: React.FC = () => {
  const { createRequest, loading } = useBiblioUsers(false);
  const [email, setEmail] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [dni, setDni] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRequest(email, nombreCompleto, dni);
    setSent(true);
  };

  if (sent) {
    return <div className="max-w-md mx-auto bg-white shadow p-6 rounded">Solicitud enviada. Recibirás un correo cuando sea aprobada.</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow p-6 rounded">
      <h1 className="text-xl font-semibold mb-4">Solicitud de Socio</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border px-3 py-2 rounded" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border px-3 py-2 rounded" placeholder="Nombre completo" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} />
        <input className="w-full border px-3 py-2 rounded" placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded cursor-pointer hover:opacity-95 transition-opacity" disabled={loading}>Enviar solicitud</button>
        <Link to="/login" className="text-blue-600 hover:text-blue-700 cursor-pointer transition-opacity flex justify-center">Volver a la página de ingreso</Link>
      </form>
    </div>
  );
};


