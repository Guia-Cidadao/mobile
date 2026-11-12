export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

/** Espelha `UserResponseDTO` do backend. */
export interface User {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
}

/** Espelha `UserRequestDTO` do backend (cadastro e atualização). */
export interface UserPayload {
  nome: string;
  email: string;
  senha: string;
}
