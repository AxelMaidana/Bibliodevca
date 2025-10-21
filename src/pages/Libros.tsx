import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LibrosTable } from '../components/tables/LibrosTable';
import { LibroForm } from '../components/forms/LibroForm';
import { useLibros } from '../hooks/useLibros';
import { usePrestamos } from '../hooks/usePrestamos';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../hooks/useAuth';
import type { Libro } from '../models/Libro';
import { Timestamp } from 'firebase/firestore';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const Libros: React.FC = () => {
  const { libros, loading, loadLibros, loadLibrosByStatus, deleteLibro } =
    useLibros();
  const { createPrestamo } = usePrestamos();
  const { profile } = useAuth();
  const addNotification = useAppStore((state) => state.addNotification);
  const [showForm, setShowForm] = useState(false);
  const [editingLibro, setEditingLibro] = useState<Libro | undefined>();
  const [filter, setFilter] = useState<'all' | 'DISPONIBLE' | 'PRESTADO'>(
    'all'
  );
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = () => {
    setEditingLibro(undefined);
    setShowForm(true);
  };

  const handleEdit = (libro: Libro) => {
    setEditingLibro(libro);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este libro?')) {
      try {
        await deleteLibro(id);
        addNotification({
          type: 'success',
          title: 'Libro eliminado',
          message: 'El libro ha sido eliminado correctamente',
        });
      } catch {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudo eliminar el libro',
        });
      }
    }
  };
  
  const handleSolicitarPrestamo = async (libro: Libro) => {
    if (!profile) return;
    
    try {
      const now = Timestamp.now();
      // Fecha de devolución prevista: 15 días después
      const fechaDevolucion = new Timestamp(
        now.seconds + 15 * 24 * 60 * 60,
        now.nanoseconds
      );
      
      await createPrestamo(
        {
          idLibro: libro.id!,
          idSocio: profile.id!
        },
        'PENDIENTE',
        7 // 7 dias para la devolución
      );
      
      addNotification({
        type: 'success',
        title: 'Solicitud enviada',
        message: 'Tu solicitud de préstamo ha sido enviada y está pendiente de aprobación',
      });
      
      // Recargar la lista de libros
      loadLibros();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo solicitar el préstamo',
      });
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'DISPONIBLE' | 'PRESTADO') => {
    setFilter(newFilter);
    if (newFilter === 'all') {
      loadLibros();
    } else {
      loadLibrosByStatus(newFilter);
    }
  };

  const filteredLibros = libros.filter(
    (libro) =>
      libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      libro.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      libro.isbn.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Libros
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Administra el catálogo de libros de la biblioteca
          </p>
        </div>
      {profile?.role === 'BIBLIOTECARIO' &&
        <Button onClick={handleCreate} variant="secondary">
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Libro
        </Button>
      }
        

      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título, autor o ISBN..."
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
              variant={filter === 'DISPONIBLE' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleFilterChange('DISPONIBLE')}
            >
              Disponibles
            </Button>
            <Button
              variant={filter === 'PRESTADO' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleFilterChange('PRESTADO')}
            >
              Prestados
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <LibrosTable
          libros={filteredLibros}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSolicitarPrestamo={profile?.role === 'SOCIO' ? handleSolicitarPrestamo : undefined}
        />
      </Card>

      {/* Form Modal */}
      <LibroForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        libro={editingLibro ? {
          id: editingLibro.id!,
          titulo: editingLibro.titulo,
          autor: editingLibro.autor,
          isbn: editingLibro.isbn
        } : undefined}
      />
    </div>
  );
};
