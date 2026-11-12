import { isAxiosError } from 'axios';

/** Formato de erro padronizado pelo `GlobalExceptionHandler` do backend. */
interface BackendErrorBody {
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  details?: string[];
}

/** Traduções das mensagens conhecidas emitidas pelo backend. */
const BACKEND_MESSAGES: Record<string, string> = {
  'Wrong email or password': 'E-mail ou senha incorretos.',
  'usuario nao encontrado': 'Usuário não encontrado.',
  'Servico nao encontrado': 'Serviço não encontrado.',
  'You must inform an email': 'Informe um e-mail.',
  'Invalid email': 'E-mail inválido.',
  'The informed email is invalid': 'O e-mail informado é inválido.',
  'The password can not be empty': 'A senha não pode ficar vazia.',
  'The password can not be blank': 'A senha não pode ficar vazia.',
  'The username can not be blank': 'O nome de usuário não pode ficar vazio.',
  'Usernames must have between 3 and 100 characters':
    'O nome de usuário deve ter entre 3 e 100 caracteres.',
  'Passowors must have at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
  'Passwords must contain a number, a capital letter and a special character':
    'A senha deve conter um número, uma letra maiúscula e um caractere especial.',
  'must not be blank': 'não pode ficar em branco.',
};

const FIELD_LABELS: Record<string, string> = {
  nome: 'Nome',
  email: 'E-mail',
  senha: 'Senha',
  password: 'Senha',
  descricao: 'Descrição',
  documentos: 'Documentos',
  pergunta: 'Pergunta',
};

const DEFAULT_STATUS_MESSAGES: Record<number, string> = {
  400: 'Verifique os dados informados e tente novamente.',
  401: 'Sua sessão expirou. Faça login novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'O recurso solicitado não foi encontrado.',
  409: 'Este registro já existe.',
  500: 'Ocorreu um erro no servidor. Tente novamente mais tarde.',
  503: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
};

export class ApiError extends Error {
  readonly status: number | null;
  readonly details: string[];

  constructor(message: string, status: number | null, details: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  get isNetworkError(): boolean {
    return this.status === null;
  }
}

function translate(message: string | undefined): string | undefined {
  if (!message) {
    return undefined;
  }
  return BACKEND_MESSAGES[message.trim()];
}

/** Converte "senha: Passwords must..." em "Senha: A senha deve...". */
function translateDetail(detail: string): string {
  const separatorIndex = detail.indexOf(':');
  if (separatorIndex === -1) {
    return translate(detail) ?? detail;
  }
  const field = detail.slice(0, separatorIndex).trim();
  const message = detail.slice(separatorIndex + 1).trim();
  const label = FIELD_LABELS[field] ?? field;
  return `${label}: ${translate(message) ?? message}`;
}

/** Normaliza qualquer erro (Axios, rede ou inesperado) em um `ApiError`. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (!isAxiosError<BackendErrorBody>(error)) {
    return new ApiError('Ocorreu um erro inesperado. Tente novamente.', null);
  }

  if (!error.response) {
    const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
    return new ApiError(
      isTimeout
        ? 'O servidor demorou para responder. Verifique sua conexão e tente novamente.'
        : 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
      null,
    );
  }

  const { status, data } = error.response;
  const details = (data?.details ?? []).map(translateDetail);
  const fallback = DEFAULT_STATUS_MESSAGES[status] ?? DEFAULT_STATUS_MESSAGES[500];
  const message = status >= 500 ? fallback : (translate(data?.message) ?? fallback);

  return new ApiError(message, status, details);
}

/**
 * Gera a mensagem amigável para exibir ao usuário,
 * permitindo sobrescrever mensagens por status conforme o contexto da tela.
 */
export function getErrorMessage(
  error: unknown,
  overrides: Partial<Record<number, string>> = {},
): string {
  const apiError = toApiError(error);
  const override = apiError.status !== null ? overrides[apiError.status] : undefined;
  if (override) {
    return override;
  }
  if (apiError.details.length > 0) {
    return apiError.details.join('\n');
  }
  return apiError.message;
}
