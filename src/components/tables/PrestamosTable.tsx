import React from 'react';
import { Button } from '../ui/Button';
import type { PrestamoWithDetails } from '../../models/Prestamo';

interface PrestamosTableProps {
  prestamos: PrestamoWithDetails[];
  loading: boolean;
  onReturn: (id: string, isDamaged: boolean) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const PrestamosTable: React.FC<PrestamosTableProps> = ({
  prestamos,
  loading,
  onReturn,
  onApprove,
  onReject,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (prestamos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay préstamos registrados</p>
      </div>
    );
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return 'bg-blue-100 text-blue-800';
      case 'FINALIZADO':
        return 'bg-green-100 text-green-800';
      case 'ATRASADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (fechaDevolucionPrevista: { toDate: () => Date }) => {
    const now = new Date();
    const dueDate = fechaDevolucionPrevista.toDate();
    return now > dueDate;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Libro
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Socio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha de Inicio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha de Devolución
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Multa
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {prestamos.map((prestamo) => (
            <tr key={prestamo.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {prestamo.libro?.titulo || 'Libro no encontrado'}
                </div>
                <div className="text-sm text-gray-500">
                  {prestamo.libro?.autor} - ISBN: {prestamo.libro?.isbn}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {prestamo.socio?.nombre || 'Socio no encontrado'}
                </div>
                <div className="text-sm text-gray-500">
                  {prestamo.socio?.numeroSocio} - {prestamo.socio?.email}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {prestamo.fechaInicio.toDate().toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>
                  {prestamo.fechaDevolucionPrevista
                    .toDate()
                    .toLocaleDateString()}
                  {prestamo.estado === 'ACTIVO' &&
                    isOverdue(prestamo.fechaDevolucionPrevista) && (
                      <div className="text-red-600 text-xs font-medium">
                        VENCIDO
                      </div>
                    )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prestamo.estado)}`}
                >
                  {prestamo.estado}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${prestamo.multa}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {prestamo.estado === 'ACTIVO' && (
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => onReturn(prestamo.id!, false)}
                    >
                      Devolver
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onReturn(prestamo.id!, true)}
                    >
                      Dañado
                    </Button>
                  </div>
                )}
                {prestamo.estado === 'PENDIENTE' && onApprove && onReject && (
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => onApprove(prestamo.id!)}
                    >
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onReject(prestamo.id!)}
                    >
                      Rechazar
                    </Button>
                  </div>
                )}
                {prestamo.estado === 'FINALIZADO' && (
                  <span className="text-sm text-gray-500">
                    Devuelto:{' '}
                    {prestamo.fechaDevolucionReal
                      ?.toDate()
                      .toLocaleDateString()}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
