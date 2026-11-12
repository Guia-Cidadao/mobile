import type { Page } from '@/types/pagination';

/**
 * O Spring Data pode serializar `Page<T>` de duas formas:
 * - padrão: { content, number, totalPages, totalElements, last }
 * - VIA_DTO (Spring Boot 3.3+): { content, page: { number, totalPages, totalElements } }
 * Esta função normaliza ambas para o tipo `Page<T>` do app.
 */
interface SpringPage<T> {
  content: T[];
  number?: number;
  totalPages?: number;
  totalElements?: number;
  last?: boolean;
  page?: {
    number: number;
    totalPages: number;
    totalElements: number;
  };
}

export function normalizePage<T>(data: SpringPage<T>): Page<T> {
  const page = data.page?.number ?? data.number ?? 0;
  const totalPages = data.page?.totalPages ?? data.totalPages ?? 1;
  const totalElements = data.page?.totalElements ?? data.totalElements ?? data.content.length;

  return {
    items: data.content,
    page,
    totalPages,
    totalElements,
    isLast: data.last ?? page >= totalPages - 1,
  };
}

export type { SpringPage };
