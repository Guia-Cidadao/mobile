import type { ChatbotResponse } from '@/types/chatbot';

import { httpClient } from './api/httpClient';

/** A IA pode levar mais tempo para responder do que as demais rotas. */
const CHATBOT_TIMEOUT_MS = 60_000;

/** Assistente virtual (`/api/chatbot`). O backend mantém o contexto via cookie de sessão. */
export const chatbotService = {
  async ask(pergunta: string): Promise<ChatbotResponse> {
    const { data } = await httpClient.post<ChatbotResponse>(
      '/api/chatbot/perguntar',
      { pergunta },
      { timeout: CHATBOT_TIMEOUT_MS, withCredentials: true },
    );
    return data;
  },
};
