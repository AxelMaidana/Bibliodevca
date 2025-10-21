import React from 'react';
import { Button } from '../ui/Button';
import type { Socio } from '../../models/Socio';

interface SociosTableProps {
  socios: Socio[];
  loading: boolean;
  onEdit: (socio: Socio) => void;
  onDelete: (id: string) => void;
  onPayFine?: (id: string, amount: number) => void;
}

export const SociosTable: React.FC<SociosTableProps> = ({
  socios,
  loading,
  onEdit,
  onDelete,
  onPayFine,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (socios.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay socios registrados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              DNI
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Número de Socio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Multas Pendientes
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {socios.map((socio) => (
            <tr key={socio.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {socio.nombre}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {socio.dni}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {socio.numeroSocio}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {socio.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    socio.multasPendientes > 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  ${socio.multasPendientes}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  {onPayFine && socio.multasPendientes > 0 && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() =>
                        onPayFine(socio.id!, socio.multasPendientes)
                      }
                    >
                      Pagar Multa
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onEdit(socio)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(socio.id!)}
                  >
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
