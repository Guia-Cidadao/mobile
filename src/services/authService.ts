import type { LoginCredentials, LoginResponse } from '@/types/auth';
import type { User, UserPayload } from '@/types/user';

import { httpClient } from './api/httpClient';

/** Endpoints públicos de autenticação (`/auth`). */
export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await httpClient.post<LoginResponse>('/auth/login', credentials);
    return data;
  },

  async register(payload: UserPayload): Promise<User> {
    const { data } = await httpClient.post<User>('/auth/register', payload);
    return data;
  },
};
