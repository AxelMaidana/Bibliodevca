import React from 'react';
import { Button } from '../ui/Button';
import type { Libro } from '../../models/Libro';
import { useAuth } from '../../hooks/useAuth';

interface LibrosTableProps {
  libros: Libro[];
  loading: boolean;
  onEdit: (libro: Libro) => void;
  onDelete: (id: string) => void;
  onSolicitarPrestamo?: (libro: Libro) => void;
}

export const LibrosTable: React.FC<LibrosTableProps> = ({
  libros,
  loading,
  onEdit,
  onDelete,
  onSolicitarPrestamo,
}) => {
  const { profile } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (libros.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay libros registrados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Título
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Autor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ISBN
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha de Alta
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {libros.map((libro) => (
            <tr key={libro.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {libro.titulo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {libro.autor}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {libro.isbn}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    libro.estado === 'DISPONIBLE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {libro.estado}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {libro.fechaAlta.toDate().toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  {profile?.role === 'BIBLIOTECARIO' ? (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEdit(libro)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDelete(libro.id!)}
                      >
                        Eliminar
                      </Button>
                    </>
                  ) : (
                    libro.estado === 'DISPONIBLE' && onSolicitarPrestamo && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onSolicitarPrestamo(libro)}
                      >
                        Solicitar Préstamo
                      </Button>
                    )
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
