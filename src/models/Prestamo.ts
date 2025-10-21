import { Timestamp } from 'firebase/firestore';

export interface Prestamo {
  id?: string;
  idLibro: string;
  idSocio: string;
  tituloLibro?: string;
  isbnLibro?: string;
  fechaInicio: Timestamp;
  fechaDevolucionPrevista: Timestamp;
  fechaDevolucionReal?: Timestamp;
  estado: 'PENDIENTE' | 'ACTIVO' | 'FINALIZADO' | 'ATRASADO';
  multa: number;
}

export interface PrestamoCreate {
  idLibro: string;
  idSocio: string;
  tituloLibro?: string;
  isbnLibro?: string;
  fechaInicio: Timestamp;
  fechaDevolucionPrevista: Timestamp;
  estado: 'PENDIENTE' | 'ACTIVO';
  multa: number;
}

export interface PrestamoUpdate {
  fechaDevolucionReal?: Timestamp;
  estado?: 'ACTIVO' | 'FINALIZADO' | 'ATRASADO';
  multa?: number;
}

export interface PrestamoWithDetails extends Prestamo {
  libro?: {
    titulo: string;
    autor: string;
    isbn: string;
  };
  socio?: {
    nombre: string;
    numeroSocio: string;
    email: string;
  };
}
