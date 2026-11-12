import type { User } from './user';

/** Espelha `LoginRequestDTO` do backend. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Espelha `LoginResponseDTO` do backend. */
export interface LoginResponse {
  token: string;
  user: User;
}

export interface Session {
  token: string;
  user: User;
}
