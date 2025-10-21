import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useLibros } from '../../hooks/useLibros';
import { useAppStore } from '../../store/useAppStore';

const libroSchema = z.object({
  titulo: z
    .string()
    .min(1, 'El título es requerido')
    .min(3, 'El título debe tener al menos 3 caracteres'),
  autor: z
    .string()
    .min(1, 'El autor es requerido')
    .min(3, 'El autor debe tener al menos 3 caracteres'),
  isbn: z
    .string()
    .min(1, 'El ISBN es requerido')
    .regex(/^\d{13}$/, 'El ISBN debe tener 13 dígitos'),
});

type LibroFormData = z.infer<typeof libroSchema>;

interface LibroFormProps {
  isOpen: boolean;
  onClose: () => void;
  libro?: {
    id: string;
    titulo: string;
    autor: string;
    isbn: string;
  };
}

export const LibroForm: React.FC<LibroFormProps> = ({
  isOpen,
  onClose,
  libro,
}) => {
  const { createLibro, updateLibro, checkIsbnExists } = useLibros();
  const addNotification = useAppStore((state) => state.addNotification);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<LibroFormData>({
    resolver: zodResolver(libroSchema),
    defaultValues: {
      titulo: '',
      autor: '',
      isbn: '',
    },
  });

  // Reset form when libro prop changes
  useEffect(() => {
    if (libro) {
      reset({
        titulo: libro.titulo,
        autor: libro.autor,
        isbn: libro.isbn,
      });
    } else {
      reset({
        titulo: '',
        autor: '',
        isbn: '',
      });
    }
  }, [libro, reset]);

  const onSubmit = async (data: LibroFormData) => {
    try {
      setLoading(true);

      // Check if ISBN already exists
      const isbnExists = await checkIsbnExists(data.isbn, libro?.id);
      if (isbnExists) {
        setError('isbn', { message: 'Este ISBN ya está registrado' });
        return;
      }

      if (libro) {
        await updateLibro(libro.id, data);
        addNotification({
          type: 'success',
          title: 'Libro actualizado',
          message: 'El libro ha sido actualizado correctamente',
        });
      } else {
        await createLibro(data);
        addNotification({
          type: 'success',
          title: 'Libro creado',
          message: 'El libro ha sido creado correctamente',
        });
      }

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
      title={libro ? 'Editar Libro' : 'Nuevo Libro'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Título"
          {...register('titulo')}
          error={errors.titulo?.message}
          placeholder="Ingrese el título del libro"
        />

        <Input
          label="Autor"
          {...register('autor')}
          error={errors.autor?.message}
          placeholder="Ingrese el nombre del autor"
        />

        <Input
          label="ISBN"
          {...register('isbn')}
          error={errors.isbn?.message}
          placeholder="Ingrese el ISBN (13 dígitos)"
          helperText="Debe contener exactamente 13 dígitos"
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {libro ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
