/** Página normalizada a partir do `Page<T>` do Spring Data. */
export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalElements: number;
  isLast: boolean;
}

export interface PageRequest {
  page?: number;
  size?: number;
}
