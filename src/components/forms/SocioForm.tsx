import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useSocios } from '../../hooks/useSocios';
import { useAppStore } from '../../store/useAppStore';

const socioSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  dni: z
    .string()
    .min(1, 'El DNI es requerido')
    .regex(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 dígitos'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
});

type SocioFormData = z.infer<typeof socioSchema>;

interface SocioFormProps {
  isOpen: boolean;
  onClose: () => void;
  socio?: {
    id: string;
    nombre: string;
    dni: string;
    email: string;
  };
}

export const SocioForm: React.FC<SocioFormProps> = ({
  isOpen,
  onClose,
  socio,
}) => {
  const { createSocio, updateSocio, checkDniExists } = useSocios();
  const addNotification = useAppStore((state) => state.addNotification);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<SocioFormData>({
    resolver: zodResolver(socioSchema),
    defaultValues: {
      nombre: '',
      dni: '',
      email: '',
    },
  });

  // Reset form when socio prop changes
  useEffect(() => {
    if (socio) {
      reset({
        nombre: socio.nombre,
        dni: socio.dni,
        email: socio.email,
      });
    } else {
      reset({
        nombre: '',
        dni: '',
        email: '',
      });
    }
  }, [socio, reset]);

  const onSubmit = async (data: SocioFormData) => {
    try {
      setLoading(true);

      // Check if DNI already exists
      const dniExists = await checkDniExists(data.dni, socio?.id);
      if (dniExists) {
        setError('dni', { message: 'Este DNI ya está registrado' });
        return;
      }

      if (socio) {
        await updateSocio(socio.id, data);
        addNotification({
          type: 'success',
          title: 'Socio actualizado',
          message: 'El socio ha sido actualizado correctamente',
        });
      } else {
        await createSocio(data);
        addNotification({
          type: 'success',
          title: 'Socio creado',
          message: 'El socio ha sido creado correctamente',
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
      title={socio ? 'Editar Socio' : 'Nuevo Socio'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nombre Completo"
          {...register('nombre')}
          error={errors.nombre?.message}
          placeholder="Ingrese el nombre completo"
        />

        <Input
          label="DNI"
          {...register('dni')}
          error={errors.dni?.message}
          placeholder="Ingrese el DNI (7 u 8 dígitos)"
          helperText="Debe contener entre 7 y 8 dígitos"
        />

        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="Ingrese el email"
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
            {socio ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
