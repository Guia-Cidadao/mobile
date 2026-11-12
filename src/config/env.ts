import Constants from 'expo-constants';
import { Platform } from 'react-native';

interface AppExtra {
  commitHash?: string;
  buildDate?: string;
  lanHost?: string | null;
}

interface ParsedUrlParts {
  protocol: string;
  host: string;
  port: string;
  basePath: string;
}

const DEFAULT_BACKEND_PORT = '8080';

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra;

function isPrivateOrLocalHost(host: string): boolean {
  const normalized = host.toLowerCase();
  if (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '10.0.2.2' ||
    normalized.startsWith('192.168.') ||
    normalized.startsWith('10.') ||
    normalized.startsWith('26.') ||
    normalized.startsWith('169.254.')
  ) {
    return true;
  }

  const match172 = /^172\.(\d+)\./.exec(normalized);
  if (match172) {
    const secondOctet = Number(match172[1]);
    return secondOctet >= 16 && secondOctet <= 31;
  }

  return false;
}

function isUsableLanIp(host: string | null | undefined): host is string {
  if (!host) {
    return false;
  }
  const trimmed = host.trim();
  return (
    Boolean(trimmed) &&
    trimmed !== 'localhost' &&
    trimmed !== '127.0.0.1' &&
    trimmed !== '10.0.2.2' &&
    !trimmed.startsWith('26.') &&
    !trimmed.startsWith('169.254.')
  );
}

/**
 * Extrai o IP da máquina de desenvolvimento a partir do bundler do Expo (`hostUri`),
 * ignorando interfaces virtuais conhecidas (ex.: Radmin VPN 26.x.x.x).
 */
function getExpoHostIp(): string | null {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost ?? null;
  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(':')[0]?.trim();
  return isUsableLanIp(host) ? host : null;
}

function parseUrlParts(rawUrl: string): ParsedUrlParts | null {
  const match = /^(https?):\/\/([^/:]+)(?::(\d+))?(\/.*)?$/i.exec(rawUrl);
  if (!match) {
    return null;
  }

  const protocol = match[1].toLowerCase();
  const host = match[2].trim();
  const defaultPort = protocol === 'https' ? '443' : DEFAULT_BACKEND_PORT;
  const port = match[3] ?? defaultPort;
  const basePath = (match[4] ?? '').replace(/\/+$/, '');

  return { protocol, host, port, basePath };
}

function deduplicateUrls(urls: string[]): string[] {
  return Array.from(new Set(urls));
}

/**
 * Resolve as URLs candidatas da API de forma compatível com:
 * 1. Nuvem / Produção (`EXPO_PUBLIC_API_URL` apontando para domínio público / HTTPS)
 * 2. Web local (`http://localhost:8080`, `http://127.0.0.1:8080`, IP da LAN)
 * 3. Dispositivo físico (Expo Go) e Emulador Android/iOS na rede local
 */
function resolveApiConfig(): { apiUrl: string; apiUrls: string[]; isLocalApi: boolean } {
  const rawEnvUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  const parsed = rawEnvUrl ? parseUrlParts(rawEnvUrl) : null;

  // Quando EXPO_PUBLIC_API_URL aponta para um servidor na nuvem (domínio público / IP público),
  // utiliza exatamente a URL configurada sem reescrita para IPs locais.
  if (rawEnvUrl && (!parsed || !isPrivateOrLocalHost(parsed.host))) {
    return {
      apiUrl: rawEnvUrl,
      apiUrls: [rawEnvUrl],
      isLocalApi: false,
    };
  }

  const protocol = parsed?.protocol ?? 'http';
  const port = parsed?.port ?? DEFAULT_BACKEND_PORT;
  const basePath = parsed?.basePath ?? '';
  const buildLocalUrl = (host: string) => `${protocol}://${host}:${port}${basePath}`;

  const envLanIp = parsed && isUsableLanIp(parsed.host) ? parsed.host : null;
  const lanIp =
    envLanIp ?? getExpoHostIp() ?? (isUsableLanIp(extra.lanHost) ? extra.lanHost : null);

  if (Platform.OS === 'web') {
    const browserHost =
      typeof window !== 'undefined' && window.location?.hostname
        ? window.location.hostname.trim()
        : null;
    const webCandidates = [
      ...(browserHost && isPrivateOrLocalHost(browserHost) ? [buildLocalUrl(browserHost)] : []),
      buildLocalUrl('localhost'),
      buildLocalUrl('127.0.0.1'),
      ...(lanIp ? [buildLocalUrl(lanIp)] : []),
    ];
    const apiUrls = deduplicateUrls(webCandidates);
    return { apiUrl: apiUrls[0], apiUrls, isLocalApi: true };
  }

  if (Platform.OS === 'android') {
    const androidCandidates = [
      buildLocalUrl('10.0.2.2'),
      ...(lanIp ? [buildLocalUrl(lanIp)] : []),
      buildLocalUrl('localhost'),
      buildLocalUrl('127.0.0.1'),
    ];
    const apiUrls = deduplicateUrls(androidCandidates);
    return { apiUrl: apiUrls[0], apiUrls, isLocalApi: true };
  }

  const iosCandidates = [
    ...(lanIp ? [buildLocalUrl(lanIp)] : []),
    buildLocalUrl('localhost'),
    buildLocalUrl('127.0.0.1'),
  ];
  const apiUrls = deduplicateUrls(iosCandidates);
  return { apiUrl: apiUrls[0], apiUrls, isLocalApi: true };
}

const apiConfig = resolveApiConfig();

/** Configurações de ambiente centralizadas do aplicativo. */
export const env = {
  apiUrl: apiConfig.apiUrl,
  apiUrls: apiConfig.apiUrls,
  isLocalApi: apiConfig.isLocalApi,
  appName: Constants.expoConfig?.name ?? 'Guia Cidadão',
  appVersion: Constants.expoConfig?.version ?? '1.0.0',
  commitHash: extra.commitHash ?? 'desconhecido',
  buildDate: extra.buildDate ?? null,
} as const;
