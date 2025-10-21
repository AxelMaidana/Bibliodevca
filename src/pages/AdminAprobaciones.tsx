import React, { useState } from 'react';
import { useBiblioUsers } from '../hooks/useBiblioUsers';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../store/useAppStore';
import { EmailService } from '../services/emailService';

export const AdminAprobaciones: React.FC = () => {
  const { users, loading, approve } = useBiblioUsers(true);
  const { profile } = useAuth();
  const addNotification = useAppStore((s) => s.addNotification);
  const [approving, setApproving] = useState<Record<string, boolean>>({});
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const emailService = new EmailService();

  const pendientes = users.filter((u) => u.status === 'PENDIENTE');

  if (profile?.role !== 'BIBLIOTECARIO') {
    return <div>No autorizado</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Solicitudes pendientes</h1>
      {loading ? (
        <div>Cargando...</div>
      ) : pendientes.length === 0 ? (
        <div>No hay solicitudes</div>
      ) : (
        <div className="space-y-3">
          {pendientes.map((u) => (
            <div key={u.id} className="bg-white shadow p-4 rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{u.nombreCompleto}</div>
                <div className="text-sm text-gray-500">{u.email} • DNI {u.dni}</div>
                {approved[u.id] && (
                  <div className="text-green-700 text-sm mt-1">Solicitud aprobada</div>
                )}
              </div>
              <button
                disabled={approving[u.id] || approved[u.id]}
                className={`px-3 py-2 rounded cursor-pointer transition-opacity ${
                  approving[u.id] || approved[u.id]
                    ? 'bg-green-300 cursor-not-allowed text-white'
                    : 'bg-green-600 text-white hover:opacity-95'
                }`}
                onClick={async () => {
                  try {
                    setApproving((s) => ({ ...s, [u.id]: true }));
                    
                    // 1. Crear usuario provisional en Firestore
                    const provisionalUserId = await approve(u.id, u.email, u.dni);
                    
                    // 2. Enviar correo con EmailJS con enlace para completar registro
                    try {
                      await emailService.sendApprovalEmailWithEmailJS({
                        toEmail: u.email,
                        toName: u.nombreCompleto,
                        dni: u.dni,
                        userId: provisionalUserId
                      });
                      
                      console.log('Correo enviado correctamente con EmailJS');
                    } catch (e) {
                      console.warn('Fallo al enviar correo de aprobación con EmailJS:', e);
                      
                      // Intentar con el método alternativo
                      try {
                        await emailService.sendApprovalEmail({
                          toEmail: u.email,
                          toName: u.nombreCompleto,
                          dni: u.dni,
                          userId: provisionalUserId
                        });
                      } catch (fallbackError) {
                        console.error('Fallo al enviar correo de aprobación (método alternativo):', fallbackError);
                      }
                    }
                    
                    setApproved((s) => ({ ...s, [u.id]: true }));
                    addNotification({
                      type: 'success',
                      title: 'Solicitud aprobada',
                      message: `Se ha enviado un correo a ${u.nombreCompleto} para completar su registro`,
                    });
                  } catch (err) {
                    addNotification({
                      type: 'error',
                      title: 'Error al aprobar',
                      message: err instanceof Error ? err.message : 'Error desconocido',
                    });
                  } finally {
                    setApproving((s) => ({ ...s, [u.id]: false }));
                  }
                }}
              >
                {approved[u.id] ? 'Aprobada' : approving[u.id] ? 'Aprobando...' : 'Aprobar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


