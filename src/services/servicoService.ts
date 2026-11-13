import type { Page, PageRequest } from '@/types/pagination';
import type { Servico, ServicoPayload } from '@/types/servico';

import { httpClient } from './api/httpClient';
import { normalizePage, type SpringPage } from './api/pagination';

const DEFAULT_PAGE_SIZE = 10;

/** CRUD de serviços públicos (`/api/servicos`). Escrita restrita a administradores. */
export const servicoService = {
  async list({ page = 0, size = DEFAULT_PAGE_SIZE }: PageRequest = {}): Promise<Page<Servico>> {
    const { data } = await httpClient.get<SpringPage<Servico>>('/api/servicos/all', {
      params: { page, size, sort: 'nome' },
    });
    return normalizePage(data);
  },

  async getById(id: number): Promise<Servico> {
    const { data } = await httpClient.get<Servico>(`/api/servicos/id/${id}`);
    return data;
  },

  async getByNome(nome: string): Promise<Servico> {
    const { data } = await httpClient.get<Servico>(
      `/api/servicos/nome/${encodeURIComponent(nome)}`,
    );
    return data;
  },

  async create(payload: ServicoPayload): Promise<Servico> {
    const { data } = await httpClient.post<Servico>('/api/servicos/save', payload);
    return data;
  },

  async update(id: number, payload: ServicoPayload): Promise<Servico> {
    const { data } = await httpClient.put<Servico>(`/api/servicos/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`/api/servicos/${id}`);
  },
};
