/** Espelha `ServicoResponseDTO` do backend. */
export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  documentos: string[];
}

/** Espelha `ServicoRequestDTO` do backend. */
export interface ServicoPayload {
  nome: string;
  descricao: string;
  documentos: string[];
}
