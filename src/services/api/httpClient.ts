import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios';

import { env } from '@/config/env';
import { isTokenExpired } from '@/utils/jwt';

import { ApiError, toApiError } from './apiError';

const DEFAULT_TIMEOUT_MS = 15_000;
const LOCAL_PROBE_TIMEOUT_MS = 5_000;
const LOCAL_FALLBACK_TIMEOUT_MS = 6_000;

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _localFallbackAttempted?: boolean;
  _preserveBaseUrl?: boolean;
}

let activeBaseUrl: string = env.apiUrl;
let activeProbePromise: Promise<string | null> | null = null;
let hasConfirmedBaseUrl = !env.isLocalApi || env.apiUrls.length <= 1;

/** Instância única do Axios usada por todos os serviços da aplicação. */
export const httpClient = axios.create({
  baseURL: activeBaseUrl,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let authToken: string | null = null;
let sessionExpiredHandler: (() => void) | null = null;

/** Retorna a URL base atualmente ativa no cliente HTTP. */
export function getActiveApiUrl(): string {
  return activeBaseUrl;
}

function setActiveBaseUrl(nextBaseUrl: string): void {
  activeBaseUrl = nextBaseUrl;
  httpClient.defaults.baseURL = nextBaseUrl;
  hasConfirmedBaseUrl = true;
}

/**
 * Em desenvolvimento local, testa em paralelo as URLs candidatas (LAN, 10.0.2.2, localhost)
 * e seleciona automaticamente a primeira que responder.
 */
async function resolveReachableBaseUrl(forceRefresh = false): Promise<string | null> {
  if (!env.isLocalApi || env.apiUrls.length <= 1) {
    return activeBaseUrl;
  }

  if (hasConfirmedBaseUrl && !forceRefresh) {
    return activeBaseUrl;
  }

  if (activeProbePromise) {
    return activeProbePromise;
  }

  const controllers = env.apiUrls.map(() => new AbortController());

  activeProbePromise = Promise.any(
    env.apiUrls.map(async (candidateUrl, index) => {
      await axios.get(`${candidateUrl}/v3/api-docs`, {
        timeout: LOCAL_PROBE_TIMEOUT_MS,
        validateStatus: (status) => status >= 200 && status < 500,
        signal: controllers[index].signal,
      });
      return candidateUrl;
    }),
  )
    .then((winningUrl) => {
      controllers.forEach((controller) => controller.abort());
      setActiveBaseUrl(winningUrl);
      return winningUrl;
    })
    .catch(() => null)
    .finally(() => {
      activeProbePromise = null;
    });

  return activeProbePromise;
}

if (env.isLocalApi && env.apiUrls.length > 1) {
  void resolveReachableBaseUrl();
}

/** Define o token JWT enviado no header `Authorization` das requisições. */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/** Registra o callback executado quando a sessão expira (ex.: logout automático). */
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

httpClient.interceptors.request.use(async (config) => {
  const retryConfig = config as RetryableRequestConfig;
  if (!retryConfig._preserveBaseUrl) {
    if (!hasConfirmedBaseUrl && env.isLocalApi && env.apiUrls.length > 1) {
      await resolveReachableBaseUrl();
    }
    config.baseURL = activeBaseUrl;
  }
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

function handleApiFailure(error: unknown): Promise<never> {
  const status = isAxiosError(error) ? error.response?.status : undefined;

  // O Spring Security responde 403 quando o token é inválido/expirado,
  // por isso verificamos a expiração localmente para diferenciar de falta de permissão.
  const isSessionExpired =
    authToken !== null && (status === 401 || (status === 403 && isTokenExpired(authToken)));

  if (isSessionExpired) {
    sessionExpiredHandler?.();
  }

  return Promise.reject(toApiError(error));
}

httpClient.interceptors.response.use(
  (response) => {
    hasConfirmedBaseUrl = true;
    return response;
  },
  async (error: unknown) => {
    if (
      isAxiosError(error) &&
      !error.response &&
      error.config &&
      env.isLocalApi &&
      env.apiUrls.length > 1
    ) {
      const config = error.config as RetryableRequestConfig;

      if (!config._localFallbackAttempted) {
        config._localFallbackAttempted = true;
        const failedBaseUrl = config.baseURL ?? activeBaseUrl;
        const probedUrl = await resolveReachableBaseUrl(true);

        const fallbackCandidates = Array.from(
          new Set([
            ...(probedUrl ? [probedUrl] : []),
            ...env.apiUrls.filter((url) => url !== failedBaseUrl),
          ]),
        );

        for (const candidateUrl of fallbackCandidates) {
          try {
            const retryConfig: RetryableRequestConfig = {
              ...config,
              baseURL: candidateUrl,
              timeout: Math.min(config.timeout ?? DEFAULT_TIMEOUT_MS, LOCAL_FALLBACK_TIMEOUT_MS),
              _localFallbackAttempted: true,
              _preserveBaseUrl: true,
            };
            const retryResponse = await httpClient.request(retryConfig);
            setActiveBaseUrl(candidateUrl);
            return retryResponse;
          } catch (retryError: unknown) {
            if (
              (retryError instanceof ApiError && !retryError.isNetworkError) ||
              (isAxiosError(retryError) && Boolean(retryError.response))
            ) {
              setActiveBaseUrl(candidateUrl);
              return Promise.reject(toApiError(retryError));
            }
          }
        }
      }
    }

    return handleApiFailure(error);
  },
);
