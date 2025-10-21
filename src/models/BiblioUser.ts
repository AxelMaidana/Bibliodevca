import { Timestamp } from 'firebase/firestore';

export type BiblioUserRole = 'BIBLIOTECARIO' | 'SOCIO';
export type BiblioUserStatus = 'PENDIENTE' | 'ACTIVO' | 'RECHAZADO' | 'PROVISIONAL';

export interface BiblioUserBase {
  email: string;
  nombreCompleto: string;
  dni: string;
  role: BiblioUserRole;
  status: BiblioUserStatus;
  createdAt: Timestamp;
  uid?: string;
  lastPasswordChangeAt?: Timestamp;
  approvedAt?: Timestamp;
  registrationToken?: string;
  registrationTokenExpiresAt?: Timestamp;
}

export interface BiblioUser extends BiblioUserBase {
  id: string;
}

export type BiblioUserCreate = Omit<BiblioUserBase, 'createdAt'> & {
  createdAt?: Timestamp;
};

export type BiblioUserUpdate = Partial<BiblioUserBase>;


