import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { usePrestamos } from '../hooks/usePrestamos';
import { useSocios } from '../hooks/useSocios';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../store/useAppStore';

export const MisPrestamos: React.FC = () => {
  const { profile } = useAuth();
  const { prestamos, prestamosWithDetails, loadPrestamosByMember, returnBook } = usePrestamos(false);
  const { socios, loadSocios, pagarMulta } = useSocios(true); // Cambiado a true para cargar automáticamente
  const [socioId, setSocioId] = useState<string | null>(null);
  const [cantidadPago, setCantidadPago] = useState<number>(0);
  const [multaPendiente, setMultaPendiente] = useState<number>(0);
  const addNotification = useAppStore((state) => state.addNotification);

  // Buscar el socio correspondiente al usuario actual y cargar sus préstamos
  useEffect(() => {
    const buscarSocioYCargarPrestamos = async () => {
      if (!profile?.email || socios.length === 0) return;
      
      // Buscar el socio por email
      const socioEncontrado = socios.find(s => s.email === profile.email);
      
      if (socioEncontrado) {
        setSocioId(socioEncontrado.id!);
        setMultaPendiente(socioEncontrado.multasPendientes);
        // Cargar préstamos del socio con todos los detalles
        await loadPrestamosByMember(socioEncontrado.id!);
      }
    };
    
    buscarSocioYCargarPrestamos();
  }, [profile, socios, loadPrestamosByMember]);

  const handleDevolver = async (id: string) => {
    const isDamaged = window.confirm('¿El libro está dañado? Presiona OK si está dañado o Cancelar si está en buen estado.');
    
    try {
      const result = await returnBook(id, isDamaged);
      if (result) {
        addNotification({
          type: 'success',
          title: 'Libro devuelto',
          message: isDamaged 
            ? 'El libro ha sido devuelto como dañado. Se ha generado una multa.' 
            : 'El libro ha sido devuelto correctamente',
        });
        
        // Recargar préstamos con detalles
        if (socioId) {
          await loadPrestamosByMember(socioId);
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudo procesar la devolución',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Ocurrió un error al devolver el libro',
      });
    }
  };

  const handlePagarMulta = async () => {
    if (!socioId) return;
    
    if (cantidadPago <= 0) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'La cantidad a pagar debe ser mayor a 0',
      });
      return;
    }
    
    if (cantidadPago > multaPendiente) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'La cantidad a pagar no puede ser mayor que la multa pendiente',
      });
      return;
    }
    
    try {
      const result = await pagarMulta(socioId, cantidadPago);
      if (result) {
        addNotification({
          type: 'success',
          title: 'Pago realizado',
          message: `Se ha pagado $${cantidadPago} de multa correctamente`,
        });
        setMultaPendiente(prev => prev - cantidadPago);
        setCantidadPago(0);
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No se pudo procesar el pago',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Ocurrió un error al procesar el pago',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Préstamos</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gestiona tus préstamos y multas pendientes
        </p>
      </div>

      {/* Sección de multas */}
      {multaPendiente > 0 && (
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold text-red-600">Multas Pendientes: ${multaPendiente}</h2>
            <div className="mt-4 flex items-end space-x-4">
              <div>
                <label htmlFor="cantidadPago" className="block text-sm font-medium text-gray-700">
                  Cantidad a pagar
                </label>
                <input
                  type="number"
                  id="cantidadPago"
                  value={cantidadPago}
                  onChange={(e) => setCantidadPago(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  min="1"
                  max={multaPendiente}
                />
              </div>
              <Button onClick={handlePagarMulta}>Pagar Multa</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de préstamos */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Libro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Préstamo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Devolución
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prestamosWithDetails.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No tienes préstamos activos
                  </td>
                </tr>
              ) : (
                prestamosWithDetails.map((prestamo) => (
                  <tr key={prestamo.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {prestamo.tituloLibro || prestamo.libro?.titulo || 'Sin título'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prestamo.fechaInicio.toDate().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prestamo.fechaDevolucionPrevista.toDate().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          prestamo.estado === 'ACTIVO'
                            ? 'bg-green-100 text-green-800'
                            : prestamo.estado === 'ATRASADO'
                            ? 'bg-red-100 text-red-800'
                            : prestamo.estado === 'PENDIENTE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {prestamo.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(prestamo.estado === 'ACTIVO' || prestamo.estado === 'ATRASADO') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDevolver(prestamo.id!)}
                        >
                          Devolver
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};