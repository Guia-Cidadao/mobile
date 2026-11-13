import type { User, UserPayload } from '@/types/user';

import { httpClient } from './api/httpClient';

/** CRUD do usuário autenticado (`/api/user`). */
export const userService = {
  async getById(id: number): Promise<User> {
    const { data } = await httpClient.get<User>(`/api/user/${id}`);
    return data;
  },

  async update(id: number, payload: UserPayload): Promise<User> {
    const { data } = await httpClient.put<User>(`/api/user/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`/api/user/${id}`);
  },
};
