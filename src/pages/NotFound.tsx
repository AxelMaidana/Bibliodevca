import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <h1 className="text-3xl font-bold mb-4">404</h1>
      <p className="mb-6">La página que buscas no existe.</p>
      <Link to="/" className="text-blue-600 hover:opacity-95 cursor-pointer transition-opacity">Volver al inicio</Link>
    </div>
  );
};


