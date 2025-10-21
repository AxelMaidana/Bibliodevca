export interface Socio {
  id?: string;
  nombre: string;
  dni: string;
  numeroSocio: string;
  email: string;
  multasPendientes: number;
}

export interface SocioCreate {
  nombre: string;
  dni: string;
  numeroSocio: string;
  email: string;
  multasPendientes: number;
}

export interface SocioUpdate {
  nombre?: string;
  dni?: string;
  numeroSocio?: string;
  email?: string;
  multasPendientes?: number;
}
