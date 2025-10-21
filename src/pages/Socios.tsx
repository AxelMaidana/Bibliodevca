import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SociosTable } from '../components/tables/SociosTable';
import { SocioForm } from '../components/forms/SocioForm';
import { useSocios } from '../hooks/useSocios';
import { useAppStore } from '../store/useAppStore';
import type { Socio } from '../models/Socio';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const Socios: React.FC = () => {
  const {
    socios,
    loading,
    loadSocios,
    loadSociosWithPendingFines,
    deleteSocio,
    payFine,
  } = useSocios();
  const addNotification = useAppStore((state) => state.addNotification);
  const [showForm, setShowForm] = useState(false);
  const [editingSocio, setEditingSocio] = useState<Socio | undefined>();
  const [filter, setFilter] = useState<'all' | 'withFines'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = () => {
    setEditingSocio(undefined);
    setShowForm(true);
  };

  const handleEdit = (socio: Socio) => {
    setEditingSocio(socio);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este socio?')) {
      try {
        await deleteSocio(id);
        addNotification({
          type: 'success',
          title: 'Socio eliminado',
          message: 'El socio ha sido eliminado correctamente',
        });
      } catch {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudo eliminar el socio',
        });
      }
    }
  };

  const handlePayFine = async (id: string, amount: number) => {
    if (window.confirm(`¿Confirmar el pago de $${amount} de multa?`)) {
      try {
        await payFine(id, amount);
        addNotification({
          type: 'success',
          title: 'Multa pagada',
          message: 'La multa ha sido pagada correctamente',
        });
      } catch {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudo procesar el pago',
        });
      }
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'withFines') => {
    setFilter(newFilter);
    if (newFilter === 'all') {
      loadSocios();
    } else {
      loadSociosWithPendingFines();
    }
  };

  const filteredSocios = socios.filter(
    (socio) =>
      socio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.dni.includes(searchTerm) ||
      socio.numeroSocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Socios
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Administra los socios de la biblioteca
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Socio
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
                placeholder="Buscar por nombre, DNI, número de socio o email..."
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
              variant={filter === 'withFines' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleFilterChange('withFines')}
            >
              Con Multas
            </Button>
          </div>
        </div>
      </Card>

      {/* Members Table */}
      <Card>
        <SociosTable
          socios={filteredSocios}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPayFine={handlePayFine}
        />
      </Card>

      {/* Form Modal */}
      <SocioForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        socio={editingSocio}
      />
    </div>
  );
};
