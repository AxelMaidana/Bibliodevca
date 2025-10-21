import React, { useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { useLibros } from '../hooks/useLibros';
import { useSocios } from '../hooks/useSocios';
import { usePrestamos } from '../hooks/usePrestamos';
import {
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const Dashboard: React.FC = () => {
  const { libros } = useLibros();
  const { socios } = useSocios();
  const { prestamosWithDetails, checkOverdueLoans } = usePrestamos();

  useEffect(() => {
    // Solo verificar préstamos vencidos una vez al cargar
    checkOverdueLoans();
  }, [checkOverdueLoans]);

  const stats = {
    totalLibros: libros.length,
    librosDisponibles: libros.filter((l) => l.estado === 'DISPONIBLE').length,
    librosPrestados: libros.filter((l) => l.estado === 'PRESTADO').length,
    totalSocios: socios.length,
    sociosConMultas: socios.filter((s) => s.multasPendientes > 0).length,
    prestamosActivos: prestamosWithDetails.filter((p) => p.estado === 'ACTIVO')
      .length,
    prestamosAtrasados: prestamosWithDetails.filter(
      (p) => p.estado === 'ATRASADO'
    ).length,
  };

  const recentPrestamos = prestamosWithDetails
    .filter((p) => p.estado === 'ACTIVO')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Resumen general del sistema de biblioteca
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpenIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total de Libros
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalLibros}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpenIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Libros Disponibles
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.librosDisponibles}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Libros Prestados
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.librosPrestados}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total de Socios
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalSocios}
                </dd>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Socios con Multas
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.sociosConMultas}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Préstamos Activos
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.prestamosActivos}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Préstamos Atrasados
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.prestamosAtrasados}
                </dd>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Active Loans */}
      <Card title="Préstamos Activos Recientes">
        {recentPrestamos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay préstamos activos
          </p>
        ) : (
          <div className="space-y-3">
            {recentPrestamos.map((prestamo) => (
              <div
                key={prestamo.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {prestamo.libro?.titulo}
                  </p>
                  <p className="text-sm text-gray-600">
                    Prestado a: {prestamo.socio?.nombre} (
                    {prestamo.socio?.numeroSocio})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Vence:{' '}
                    {prestamo.fechaDevolucionPrevista
                      .toDate()
                      .toLocaleDateString()}
                  </p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      prestamo.estado === 'ATRASADO'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {prestamo.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
