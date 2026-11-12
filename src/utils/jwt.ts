interface JwtPayload {
  sub?: string;
  exp?: number;
  role?: string;
  email?: string;
}

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return atob(padded);
}

/** Lê o payload de um JWT sem validar a assinatura (validação é papel do backend). */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) {
      return null;
    }
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

/** Considera o token expirado com uma margem de segurança (em segundos). */
export function isTokenExpired(token: string, marginSeconds = 30): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) {
    return true;
  }
  const nowInSeconds = Date.now() / 1000;
  return payload.exp - marginSeconds <= nowInSeconds;
}
