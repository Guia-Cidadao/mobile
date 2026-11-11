import type { ConfigContext, ExpoConfig } from 'expo/config';

interface ChildProcessModule {
  execSync: (command: string, options?: { stdio?: string[] }) => { toString: () => string };
}

interface NetworkInterfaceInfo {
  address: string;
  family: string | number;
  internal: boolean;
}

interface OsModule {
  networkInterfaces: () => Record<string, NetworkInterfaceInfo[] | undefined>;
}

const VIRTUAL_INTERFACE_PATTERN =
  /radmin|hamachi|zerotier|vpn|virtual|vmware|vbox|wsl|hyper-v|docker|loopback|teredo|isatap/i;

function isPrivateLanIpv4(ip: string): boolean {
  if (ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return true;
  }
  const match = /^172\.(\d+)\./.exec(ip);
  if (!match) {
    return false;
  }
  const secondOctet = Number(match[1]);
  return secondOctet >= 16 && secondOctet <= 31;
}

/**
 * Detecta o IPv4 real da máquina na rede local (LAN/Wi-Fi),
 * ignorando interfaces virtuais e VPNs (ex.: Radmin VPN 26.x.x.x, WSL, Docker, VirtualBox).
 */
function resolveLocalLanIp(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { networkInterfaces } = require('node:os') as OsModule;
    const interfaces = networkInterfaces();
    const candidates: { ip: string; score: number }[] = [];

    for (const [name, addresses] of Object.entries(interfaces)) {
      if (!addresses || VIRTUAL_INTERFACE_PATTERN.test(name)) {
        continue;
      }

      for (const info of addresses) {
        const isIpv4 = info.family === 'IPv4' || info.family === 4;
        if (!isIpv4 || info.internal) {
          continue;
        }

        const ip = info.address.trim();
        if (!ip || ip === '127.0.0.1' || ip.startsWith('26.') || ip.startsWith('169.254.')) {
          continue;
        }

        const score = ip.startsWith('192.168.') ? 3 : isPrivateLanIpv4(ip) ? 2 : 1;
        candidates.push({ ip, score });
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0]?.ip ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve o hash do commit de referência do build.
 * Prioridade: variável de ambiente (CI/EAS) -> git local -> "desconhecido".
 */
function resolveCommitHash(): string {
  if (process.env.EXPO_PUBLIC_COMMIT_HASH) {
    return process.env.EXPO_PUBLIC_COMMIT_HASH;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { execSync } = require('node:child_process') as ChildProcessModule;
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'desconhecido';
  }
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Guia Cidadão',
  slug: 'guia-cidadao',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'guiacidadao',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'light',
  backgroundColor: '#F4F6FA',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lucasberbel01.guiacidadao',
  },
  android: {
    package: 'com.lucasberbel01.guiacidadao',
    adaptiveIcon: {
      backgroundColor: '#1B4D8C',
      foregroundImage: './assets/images/android-icon-foreground.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#1B4D8C',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    commitHash: resolveCommitHash(),
    buildDate: new Date().toISOString(),
    lanHost: resolveLocalLanIp(),
  },
});
