import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PrestamosTable } from '../components/tables/PrestamosTable';
import { PrestamoForm } from '../components/forms/PrestamoForm';
import { usePrestamos } from '../hooks/usePrestamos';
import { useAppStore } from '../store/useAppStore';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const Prestamos: React.FC = () => {
  const {
    prestamosWithDetails,
    loading,
    loadPrestamosWithDetails,
    loadActivePrestamos,
    returnBook,
    approvePrestamo,
    rejectPrestamo,
  } = usePrestamos();
  const addNotification = useAppStore((state) => state.addNotification);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = () => {
    setShowForm(true);
  };

  const handleReturn = async (id: string, isDamaged: boolean) => {
    const message = isDamaged
      ? '¿Confirmar devolución de libro dañado? Se generará una multa de $100.'
      : '¿Confirmar devolución de libro en buen estado?';

    if (window.confirm(message)) {
      try {
        await returnBook(id, isDamaged);
        addNotification({
          type: 'success',
          title: 'Libro devuelto',
          message: isDamaged
            ? 'El libro ha sido devuelto como dañado. Se ha generado una multa.'
            : 'El libro ha sido devuelto correctamente',
        });
      } catch {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudo procesar la devolución',
        });
      }
    }
  };
  
  const handleApprove = async (id: string) => {
    if (window.confirm('¿Aprobar esta solicitud de préstamo?')) {
      try {
        await approvePrestamo(id);
        addNotification({
          type: 'success',
          title: 'Préstamo aprobado',
          message: 'La solicitud de préstamo ha sido aprobada correctamente',
        });
      } catch {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudo aprobar la solicitud de préstamo',
        });
      }
    }
  };
  
  const handleReject = async (id: string) => {
    if (window.confirm('¿Rechazar esta solicitud de préstamo?')) {
      try {
        await rejectPrestamo(id);
        addNotification({
          type: 'success',
          title: 'Préstamo rechazado',
          message: 'La solicitud de préstamo ha sido rechazada',
        });
      } catch {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudo rechazar la solicitud de préstamo',
        });
      }
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'active' | 'overdue') => {
    setFilter(newFilter);
    if (newFilter === 'all') {
      loadPrestamosWithDetails();
    } else if (newFilter === 'active') {
      loadActivePrestamos();
    } else {
      // For overdue, we'll filter from all loans
      loadPrestamosWithDetails();
    }
  };

  let filteredPrestamos = prestamosWithDetails;

  // Apply filters
  if (filter === 'active') {
    filteredPrestamos = prestamosWithDetails.filter(
      (p) => p.estado === 'ACTIVO'
    );
  } else if (filter === 'overdue') {
    const now = new Date();
    filteredPrestamos = prestamosWithDetails.filter(
      (p) => p.estado === 'ACTIVO' && p.fechaDevolucionPrevista.toDate() < now
    );
  }

  // Apply search
  filteredPrestamos = filteredPrestamos.filter(
    (prestamo) =>
      prestamo.libro?.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prestamo.libro?.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prestamo.socio?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prestamo.socio?.numeroSocio
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Préstamos
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Administra los préstamos y devoluciones de libros
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Préstamo
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por libro, autor o socio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleFilterChange('all')}
            >
              Todos
            </Button>
            <Button
              variant={filter === 'active' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleFilterChange('active')}
            >
              Activos
            </Button>
            <Button
              variant={filter === 'overdue' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleFilterChange('overdue')}
            >
              Vencidos
            </Button>
          </div>
        </div>
      </Card>

      {/* Loans Table */}
      <Card>
        <PrestamosTable
        prestamos={filteredPrestamos}
        loading={loading}
        onReturn={handleReturn}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      </Card>

      {/* Form Modal */}
      <PrestamoForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
};
