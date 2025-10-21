import { Timestamp } from 'firebase/firestore';

export interface Libro {
  id?: string;
  titulo: string;
  autor: string;
  isbn: string;
  estado: 'DISPONIBLE' | 'PRESTADO';
  fechaAlta: Timestamp;
}

export interface LibroCreate {
  titulo: string;
  autor: string;
  isbn: string;
  estado: 'DISPONIBLE';
  fechaAlta: Timestamp;
}

export interface LibroUpdate {
  titulo?: string;
  autor?: string;
  isbn?: string;
  estado?: 'DISPONIBLE' | 'PRESTADO';
}
