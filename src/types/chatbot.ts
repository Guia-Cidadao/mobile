/** Espelha `ChatBotResponseDTO.Fonte` do backend. */
export interface ChatbotSource {
  servico_id: number;
  servico: string;
}

/** Espelha `ChatBotResponseDTO` do backend. */
export interface ChatbotResponse {
  session_id: string;
  resposta: string;
  fontes: ChatbotSource[] | null;
}

export type ChatAuthor = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  author: ChatAuthor;
  text: string;
  sources?: ChatbotSource[];
  isError?: boolean;
}
