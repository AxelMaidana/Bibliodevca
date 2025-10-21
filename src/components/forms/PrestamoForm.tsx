import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { usePrestamos } from '../../hooks/usePrestamos';
import { useLibros } from '../../hooks/useLibros';
import { useSocios } from '../../hooks/useSocios';
import { useAppStore } from '../../store/useAppStore';

const prestamoSchema = z.object({
  idLibro: z.string().min(1, 'Debe seleccionar un libro'),
  idSocio: z.string().min(1, 'Debe seleccionar un socio'),
});

type PrestamoFormData = z.infer<typeof prestamoSchema>;

interface PrestamoFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrestamoForm: React.FC<PrestamoFormProps> = ({
  isOpen,
  onClose,
}) => {
  const { createPrestamo } = usePrestamos();
  const { libros, loadLibros, loading: librosLoading } = useLibros();
  const { socios, loadSocios, loading: sociosLoading } = useSocios();
  const addNotification = useAppStore((state) => state.addNotification);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PrestamoFormData>({
    resolver: zodResolver(prestamoSchema),
    defaultValues: {
      idLibro: '',
      idSocio: '',
    },
  });

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadLibros();
      loadSocios();
    }
  }, [isOpen, loadLibros, loadSocios]);

  const selectedSocioId = watch('idSocio');
  const selectedSocio = socios.find((s) => s.id === selectedSocioId);

  const availableLibros = libros.filter(
    (libro) => libro.estado === 'DISPONIBLE'
  );
  const availableSocios = socios.filter(
    (socio) => socio.multasPendientes === 0
  );

  const onSubmit = async (data: PrestamoFormData) => {
    try {
      setLoading(true);

      await createPrestamo(data);

      addNotification({
        type: 'success',
        title: 'Préstamo creado',
        message: 'El préstamo ha sido registrado correctamente',
      });

      reset();
      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Préstamo"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Libro
          </label>
          <select
            {...register('idLibro')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            disabled={librosLoading}
          >
            <option value="">
              {librosLoading ? 'Cargando libros...' : 'Seleccione un libro'}
            </option>
            {availableLibros.map((libro) => (
              <option key={libro.id} value={libro.id}>
                {libro.titulo} - {libro.autor} (ISBN: {libro.isbn})
              </option>
            ))}
          </select>
          {errors.idLibro && (
            <p className="mt-1 text-sm text-red-600">
              {errors.idLibro.message}
            </p>
          )}
          {availableLibros.length === 0 && !librosLoading && (
            <p className="mt-1 text-sm text-yellow-600">
              No hay libros disponibles
            </p>
          )}
          {librosLoading && (
            <p className="mt-1 text-sm text-blue-600">
              Cargando libros... ({libros.length} libros encontrados)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Socio
          </label>
          <select
            {...register('idSocio')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            disabled={sociosLoading}
          >
            <option value="">
              {sociosLoading ? 'Cargando socios...' : 'Seleccione un socio'}
            </option>
            {availableSocios.map((socio) => (
              <option key={socio.id} value={socio.id}>
                {socio.nombre} - {socio.numeroSocio}
              </option>
            ))}
          </select>
          {errors.idSocio && (
            <p className="mt-1 text-sm text-red-600">
              {errors.idSocio.message}
            </p>
          )}
          {availableSocios.length === 0 && !sociosLoading && (
            <p className="mt-1 text-sm text-yellow-600">
              No hay socios disponibles (todos tienen multas pendientes)
            </p>
          )}
          {sociosLoading && (
            <p className="mt-1 text-sm text-blue-600">
              Cargando socios... ({socios.length} socios encontrados)
            </p>
          )}
        </div>

        {selectedSocio && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <h4 className="text-sm font-medium text-blue-800">
              Información del Socio
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              <strong>Nombre:</strong> {selectedSocio.nombre}
              <br />
              <strong>DNI:</strong> {selectedSocio.dni}
              <br />
              <strong>Email:</strong> {selectedSocio.email}
            </p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-yellow-800">
            Información del Préstamo
          </h4>
          <p className="text-sm text-yellow-700 mt-1">
            • El préstamo tendrá una duración de 7 días
            <br />
            • El socio debe devolver el libro en la fecha prevista
            <br />• Se generará una multa por libros dañados
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={
              availableLibros.length === 0 || availableSocios.length === 0
            }
          >
            Crear Préstamo
          </Button>
        </div>
      </form>
    </Modal>
  );
};
